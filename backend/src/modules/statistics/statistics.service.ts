import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview(userId: number, bookId?: number) {
    const wordFilter = bookId ? { wordBookId: bookId } : {};

    const [totalWords, totalLearned, dueCount, streak] = await Promise.all([
      this.prisma.word.count({ where: wordFilter }),
      this.prisma.userWord.count({
        where: {
          userId,
          status: { not: 'NEW' },
          word: wordFilter,
        },
      }),
      this.prisma.userWord.count({
        where: {
          userId,
          nextReviewAt: { not: null, lte: new Date() },
          status: { in: ['LEARNING', 'REVIEWING'] },
          word: wordFilter,
        },
      }),
      this.prisma.dailyCheckIn.count({ where: { userId } }),
    ]);

    return { totalWords, totalLearned, dueCount, streak };
  }

  async getDistribution(userId: number) {
    const groups = await this.prisma.userWord.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    });

    const distribution = { NEW: 0, LEARNING: 0, REVIEWING: 0, MASTERED: 0 };
    for (const g of groups) {
      distribution[g.status as keyof typeof distribution] = g._count;
    }
    return distribution;
  }

  async getForgettingCurve(userId: number) {
    // Generate next 14 days of predicted review load
    const predictions = [];
    for (let i = 0; i < 14; i++) {
      const day = new Date(Date.now() + i * 86400000);
      const dayEnd = new Date(day.getTime() + 86400000);

      const count = await this.prisma.userWord.count({
        where: {
          userId,
          nextReviewAt: { not: null, gte: day, lte: dayEnd },
          status: { in: ['LEARNING', 'REVIEWING'] },
        },
      });

      predictions.push({
        date: day.toISOString().split('T')[0],
        count,
      });
    }
    return predictions;
  }

}
