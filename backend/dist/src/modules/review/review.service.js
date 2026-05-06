"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const INTERVALS = [1, 2, 4, 7, 15, 30];
let ReviewService = class ReviewService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLearnedWords(userId) {
        return this.prisma.userWord.findMany({
            where: { userId, status: { not: 'NEW' } },
            include: { word: { include: { wordBook: true } } },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async getTodayReview(userId) {
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
    async getStats(userId) {
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
    async submitReview(userId, wordId, rating) {
        const word = await this.prisma.word.findUnique({ where: { id: wordId } });
        if (!word)
            throw new common_1.NotFoundException('Word not found');
        const now = new Date();
        let userWord = await this.prisma.userWord.findUnique({
            where: { userId_wordId: { userId, wordId } },
        });
        const reviewCount = (userWord?.reviewCount ?? 0) + 1;
        let nextReviewAt;
        let stability;
        let difficulty;
        let status;
        switch (rating) {
            case 'again':
                nextReviewAt = new Date(now.getTime() + 86400000);
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
        }
        else {
            await this.prisma.userWord.create({ data });
        }
        return { status, nextReviewAt, reviewCount };
    }
    async getStreak(userId) {
        return this.prisma.dailyCheckIn.count({
            where: { userId },
        });
    }
    async checkIn(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existing = await this.prisma.dailyCheckIn.findUnique({
            where: { userId_date: { userId, date: today } },
        });
        if (existing) {
            const streak = await this.getStreak(userId);
            return { streak, checkedInToday: true };
        }
        await this.prisma.dailyCheckIn.create({
            data: { userId, date: today },
        });
        const streak = await this.getStreak(userId);
        return { streak, checkedInToday: true };
    }
    async getStreakInfo(userId) {
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
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewService);
//# sourceMappingURL=review.service.js.map