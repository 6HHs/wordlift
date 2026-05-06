import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WordBooksService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const books = await this.prisma.wordBook.findMany({
      include: { _count: { select: { words: true } } },
    });
    return books;
  }

  async findOne(id: number) {
    const book = await this.prisma.wordBook.findUnique({
      where: { id },
      include: { _count: { select: { words: true } } },
    });
    return book;
  }

  async getStats(id: number) {
    const total = await this.prisma.word.count({ where: { wordBookId: id } });
    const learned = await this.prisma.userWord.count({
      where: { word: { wordBookId: id }, status: 'MASTERED' },
    });
    const learning = await this.prisma.userWord.count({
      where: { word: { wordBookId: id }, status: { in: ['LEARNING', 'REVIEWING'] } },
    });
    return { total, learned, learning, notStarted: total - learned - learning };
  }
}
