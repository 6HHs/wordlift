import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const INTERVALS = [1, 2, 4, 7, 15, 30]; // days

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async getLearnedWords(userId: number) {
    return this.prisma.userWord.findMany({
      where: { userId, status: { not: 'NEW' } },
      include: { word: { include: { wordBook: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getTodayReview(userId: number) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now.getTime() + 86400000);

    const dueWords = await this.prisma.userWord.findMany({
      where: {
        userId,
        nextReviewAt: { not: null, lte: tomorrow },
        status: { in: ['LEARNING', 'REVIEWING'] },
      },
      include: { word: true },
      orderBy: { nextReviewAt: 'asc' },
    });

    const stats = await this.getStats(userId);

    return { words: dueWords, stats };
  }

  async getStats(userId: number) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now.getTime() + 86400000);

    const [dueCount, newCount, masteredCount, streak] = await Promise.all([
      this.prisma.userWord.count({
        where: {
          userId,
          nextReviewAt: { not: null, lte: tomorrow },
          status: { in: ['LEARNING', 'REVIEWING'] },
        },
      }),
      this.prisma.userWord.count({
        where: { userId, status: 'NEW' },
      }),
      this.prisma.userWord.count({
        where: { userId, status: 'MASTERED' },
      }),
      this.prisma.dailyCheckIn.count({ where: { userId } }),
    ]);

    return { dueCount, newCount, masteredCount, streak };
  }

  async submitReview(
    userId: number,
    wordId: number,
    rating: 'again' | 'good' | 'easy',
  ) {
    const word = await this.prisma.word.findUnique({ where: { id: wordId } });
    if (!word) throw new NotFoundException('Word not found');

    const now = new Date();
    let userWord = await this.prisma.userWord.findUnique({
      where: { userId_wordId: { userId, wordId } },
    });

    const reviewCount = (userWord?.reviewCount ?? 0) + 1;
    let nextReviewAt: Date;
    let stability: number;
    let difficulty: number;
    let status: string;

    // SM-2 algorithm
    switch (rating) {
      case 'again':
        nextReviewAt = new Date(now.getTime() + 86400000); // 1 day
        stability = 0;
        difficulty = Math.min((userWord?.difficulty ?? 0) + 1, 5);
        status = 'LEARNING';
        break;
      case 'good':
        stability = INTERVALS[Math.min(reviewCount - 1, INTERVALS.length - 1)];
        nextReviewAt = new Date(now.getTime() + stability * 86400000);
        difficulty = Math.max((userWord?.difficulty ?? 0) - 0.5, 0);
        status = 'REVIEWING';
        break;
      case 'easy':
        stability =
          INTERVALS[Math.min(reviewCount - 1, INTERVALS.length - 1)] * 2;
        nextReviewAt = new Date(now.getTime() + stability * 86400000);
        difficulty = Math.max((userWord?.difficulty ?? 0) - 1, 0);
        status = reviewCount >= 5 ? 'MASTERED' : 'REVIEWING';
        break;
    }

    const data = {
      userId,
      wordId,
      status,
      difficulty: Math.round(difficulty),
      stability,
      reviewCount,
      lastReviewAt: now,
      nextReviewAt,
    };

    if (userWord) {
      await this.prisma.userWord.update({
        where: { userId_wordId: { userId, wordId } },
        data,
      });
    } else {
      await this.prisma.userWord.create({ data });
    }

    return { status, nextReviewAt, reviewCount };
  }

  private async getStreak(userId: number): Promise<number> {
    return this.prisma.dailyCheckIn.count({
      where: { userId },
    });
  }

  async checkIn(userId: number): Promise<{ streak: number; checkedInToday: boolean }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.dailyCheckIn.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    if (existing) {
      // Already checked in today — don't error, just return current state
      const streak = await this.getStreak(userId);
      return { streak, checkedInToday: true };
    }

    await this.prisma.dailyCheckIn.create({
      data: { userId, date: today },
    });

    const streak = await this.getStreak(userId);
    return { streak, checkedInToday: true };
  }

  async getStreakInfo(userId: number): Promise<{ streak: number; checkedInToday: boolean }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [streak, checkedIn] = await Promise.all([
      this.getStreak(userId),
      this.prisma.dailyCheckIn.findUnique({
        where: { userId_date: { userId, date: today } },
      }),
    ]);

    return { streak, checkedInToday: !!checkedIn };
  }
}
