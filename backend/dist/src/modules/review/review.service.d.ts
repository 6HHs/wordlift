import { PrismaService } from '../../prisma/prisma.service';
export declare class ReviewService {
    private prisma;
    constructor(prisma: PrismaService);
    getLearnedWords(userId: number): Promise<({
        word: {
            wordBook: {
                id: number;
                name: string;
                description: string | null;
                level: string;
            };
        } & {
            word: string;
            id: number;
            wordBookId: number;
            phonetic: string | null;
            meaning: string;
            example: string | null;
        };
    } & {
        id: number;
        status: string;
        userId: number;
        wordId: number;
        difficulty: number;
        stability: number;
        reviewCount: number;
        lastReviewAt: Date | null;
        nextReviewAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getTodayReview(userId: number): Promise<{
        words: ({
            word: {
                word: string;
                id: number;
                wordBookId: number;
                phonetic: string | null;
                meaning: string;
                example: string | null;
            };
        } & {
            id: number;
            status: string;
            userId: number;
            wordId: number;
            difficulty: number;
            stability: number;
            reviewCount: number;
            lastReviewAt: Date | null;
            nextReviewAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        stats: {
            dueCount: number;
            newCount: number;
            masteredCount: number;
            streak: number;
        };
    }>;
    getStats(userId: number): Promise<{
        dueCount: number;
        newCount: number;
        masteredCount: number;
        streak: number;
    }>;
    submitReview(userId: number, wordId: number, rating: 'again' | 'good' | 'easy'): Promise<{
        status: string;
        nextReviewAt: Date;
        reviewCount: number;
    }>;
    private getStreak;
    checkIn(userId: number): Promise<{
        streak: number;
        checkedInToday: boolean;
    }>;
    getStreakInfo(userId: number): Promise<{
        streak: number;
        checkedInToday: boolean;
    }>;
}
