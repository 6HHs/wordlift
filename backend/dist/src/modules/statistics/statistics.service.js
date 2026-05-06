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
exports.StatisticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let StatisticsService = class StatisticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverview(userId, bookId) {
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
    async getDistribution(userId) {
        const groups = await this.prisma.userWord.groupBy({
            by: ['status'],
            where: { userId },
            _count: true,
        });
        const distribution = { NEW: 0, LEARNING: 0, REVIEWING: 0, MASTERED: 0 };
        for (const g of groups) {
            distribution[g.status] = g._count;
        }
        return distribution;
    }
    async getForgettingCurve(userId) {
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
};
exports.StatisticsService = StatisticsService;
exports.StatisticsService = StatisticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatisticsService);
//# sourceMappingURL=statistics.service.js.map