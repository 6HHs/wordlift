import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomWordsService {
  // For custom words, we use wordBookId = 0 or a dedicated book.
  // Here we create a "Custom" WordBook on first use.

  constructor(private prisma: PrismaService) {}

  private async getOrCreateCustomBook() {
    let book = await this.prisma.wordBook.findFirst({
      where: { level: 'CUSTOM' },
    });
    if (!book) {
      book = await this.prisma.wordBook.create({
        data: { name: '自定义生词本', description: '用户自行添加的单词', level: 'CUSTOM' },
      });
    }
    return book;
  }

  async findAll(userId: number) {
    const book = await this.prisma.wordBook.findFirst({
      where: { level: 'CUSTOM' },
    });
    if (!book) return [];
    return this.prisma.word.findMany({
      where: { wordBookId: book.id },
      orderBy: { id: 'desc' },
    });
  }

  async create(
    userId: number,
    data: { word: string; meaning: string; phonetic?: string; example?: string },
  ) {
    const book = await this.getOrCreateCustomBook();
    const word = await this.prisma.word.create({
      data: { ...data, wordBookId: book.id },
    });
    // Also create a UserWord record so it appears in reviews
    await this.prisma.userWord.create({
      data: { userId, wordId: word.id, status: 'LEARNING' },
    });
    return word;
  }

  async remove(userId: number, wordId: number) {
    await this.prisma.userWord.deleteMany({
      where: { userId, wordId },
    });
    return this.prisma.word.delete({ where: { id: wordId } });
  }
}
