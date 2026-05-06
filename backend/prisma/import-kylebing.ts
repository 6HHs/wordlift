import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Map file index to word book info
const BOOK_MAP: Record<string, { name: string; level: string }> = {
  '1': { name: '初中英语', level: 'JUNIOR' },
  '2': { name: '高中英语', level: 'SENIOR' },
  '3': { name: '大学英语四级', level: 'CET4' },
  '4': { name: '大学英语六级', level: 'CET6' },
  '5': { name: '考研英语', level: 'KAOYAN' },
  '6': { name: '托福', level: 'TOEFL' },
  '7': { name: 'SAT', level: 'SAT' },
};

interface Translation {
  translation: string;
  type?: string;
}

interface WordEntry {
  word: string;
  translations?: Translation[];
  phrases?: { phrase: string; translation: string }[];
}

async function main() {
  const srcDir = process.argv[2] || path.join(__dirname, '../../tmp/english-vocabulary/json');

  if (!fs.existsSync(srcDir)) {
    console.error(`Directory not found: ${srcDir}`);
    console.error('Please provide the path to the KyleBing json directory');
    process.exit(1);
  }

  const files = fs.readdirSync(srcDir).sort();
  let totalImported = 0;

  for (const file of files) {
    const idx = file.split('-')[0];
    const bookInfo = BOOK_MAP[idx];
    if (!bookInfo) {
      console.log(`Skipping ${file}: no matching word book`);
      continue;
    }

    const filePath = path.join(srcDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const words: WordEntry[] = JSON.parse(content);

    console.log(`\nProcessing ${bookInfo.name} (${bookInfo.level}) - ${words.length} words...`);

    // Find existing book or create new one
    let book = await prisma.wordBook.findFirst({ where: { level: bookInfo.level } });
    if (book) {
      console.log(`  Word book "${book.name}" already exists, skipping creation`);
    } else {
      book = await prisma.wordBook.create({
        data: {
          name: bookInfo.name,
          description: `${bookInfo.name} 核心词汇`,
          level: bookInfo.level,
        },
      });
      console.log(`  Created word book: ${book.name}`);
    }

    // Remove existing words for this book if reimporting
    const existingCount = await prisma.word.count({ where: { wordBookId: book.id } });
    if (existingCount > 0) {
      console.log(`  ${existingCount} words already exist in this book, skipping import`);
      totalImported += existingCount;
      continue;
    }

    // Batch import words
    const batchSize = 100;
    let imported = 0;

    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);
      const data = batch.map((entry) => {
        const translations = entry.translations || [];
        const meaning = translations
          .map((t) => {
            const prefix = t.type ? `${t.type}. ` : '';
            return prefix + t.translation;
          })
          .join('；');
        return {
          word: entry.word,
          meaning: meaning || '(暂无释义)',
          phonetic: null as string | null,
          example: null as string | null,
          wordBookId: book!.id,
        };
      });

      await prisma.word.createMany({ data, skipDuplicates: true });
      imported += batch.length;
      process.stdout.write(`\r  Imported ${imported}/${words.length} words...`);
    }

    totalImported += imported;
    console.log(`\n  Done: ${imported} words imported`);
  }

  console.log(`\n═══════════════════════════════`);
  console.log(`Total words imported: ${totalImported}`);
  console.log(`═══════════════════════════════`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
