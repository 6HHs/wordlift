import { PrismaService } from '../../prisma/prisma.service';
export declare class StatisticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getOverview(userId: number, bookId?: number): Promise<{
        totalWords: number;
        totalLearned: number;
        dueCount: number;
        streak: number;
    }>;
    getDistribution(userId: number): Promise<{
        NEW: number;
        LEARNING: number;
        REVIEWING: number;
        MASTERED: number;
    }>;
    getForgettingCurve(userId: number): Promise<{
        date: string;
        count: number;
    }[]>;
}
