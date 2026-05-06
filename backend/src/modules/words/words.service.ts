import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WordsService {
  constructor(private prisma: PrismaService) {}

  async findByBook(bookId: number, limit?: number) {
    return this.prisma.word.findMany({
      where: { wordBookId: bookId },
      ...(limit ? { take: limit } : {}),
      orderBy: { id: 'asc' },
    });
  }

  async findNewWords(bookId: number, limit?: number) {
    const studiedIds = await this.prisma.userWord.findMany({
      where: { userId: 1, word: { wordBookId: bookId } },
      select: { wordId: true },
    });

    const result = await this.prisma.word.findMany({
      where: {
        wordBookId: bookId,
        id: { notIn: studiedIds.map((uw) => uw.wordId) },
      },
      ...(limit ? { take: limit } : {}),
      orderBy: { id: 'asc' },
    });

    return result;
  }

  async fillPhonetics(bookId: number): Promise<{ updated: number; failed: number; total: number }> {
    const words = await this.prisma.word.findMany({
      where: { wordBookId: bookId, phonetic: null },
      take: 50,
    });

    let updated = 0;
    let failed = 0;

    for (const word of words) {
      try {
        const phonetic = await this.fetchPhonetic(word.word);
        if (phonetic) {
          await this.prisma.word.update({
            where: { id: word.id },
            data: { phonetic },
          });
          updated++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 200));
    }

    return { updated, failed, total: words.length };
  }

  private async fetchPhonetic(word: string): Promise<string | null> {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return null;
    const data = await res.json();
    // Try to get the first available phonetic text
    if (data[0]?.phonetic) return data[0].phonetic;
    for (const p of data[0]?.phonetics ?? []) {
      if (p.text) return p.text;
    }
    return null;
  }
}
