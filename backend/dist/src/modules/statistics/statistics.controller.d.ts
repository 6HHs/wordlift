import { StatisticsService } from './statistics.service';
export declare class StatisticsController {
    private readonly service;
    constructor(service: StatisticsService);
    getOverview(bookId?: string): Promise<{
        totalWords: number;
        totalLearned: number;
        dueCount: number;
        streak: number;
    }>;
    getDistribution(): Promise<{
        NEW: number;
        LEARNING: number;
        REVIEWING: number;
        MASTERED: number;
    }>;
    getForgettingCurve(): Promise<{
        date: string;
        count: number;
    }[]>;
}
