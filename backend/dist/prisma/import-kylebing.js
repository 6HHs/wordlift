"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma = new client_1.PrismaClient();
const BOOK_MAP = {
    '1': { name: '初中英语', level: 'JUNIOR' },
    '2': { name: '高中英语', level: 'SENIOR' },
    '3': { name: '大学英语四级', level: 'CET4' },
    '4': { name: '大学英语六级', level: 'CET6' },
    '5': { name: '考研英语', level: 'KAOYAN' },
    '6': { name: '托福', level: 'TOEFL' },
    '7': { name: 'SAT', level: 'SAT' },
};
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
        const words = JSON.parse(content);
        console.log(`\nProcessing ${bookInfo.name} (${bookInfo.level}) - ${words.length} words...`);
        let book = await prisma.wordBook.findFirst({ where: { level: bookInfo.level } });
        if (book) {
            console.log(`  Word book "${book.name}" already exists, skipping creation`);
        }
        else {
            book = await prisma.wordBook.create({
                data: {
                    name: bookInfo.name,
                    description: `${bookInfo.name} 核心词汇`,
                    level: bookInfo.level,
                },
            });
            console.log(`  Created word book: ${book.name}`);
        }
        const existingCount = await prisma.word.count({ where: { wordBookId: book.id } });
        if (existingCount > 0) {
            console.log(`  ${existingCount} words already exist in this book, skipping import`);
            totalImported += existingCount;
            continue;
        }
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
                    phonetic: null,
                    example: null,
                    wordBookId: book.id,
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
//# sourceMappingURL=import-kylebing.js.map