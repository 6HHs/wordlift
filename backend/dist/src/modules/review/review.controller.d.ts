import { ReviewService } from './review.service';
export declare class ReviewController {
    private readonly service;
    constructor(service: ReviewService);
    getLearnedWords(): Promise<({
        word: {
            wordBook: {
                id: number;
                name: string;
                description: string | null;
                level: string;
            };
        } & {
            id: number;
            word: string;
            phonetic: string | null;
            meaning: string;
            example: string | null;
            wordBookId: number;
        };
    } & {
        id: number;
        userId: number;
        wordId: number;
        status: string;
        difficulty: number;
        stability: number;
        reviewCount: number;
        lastReviewAt: Date | null;
        nextReviewAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getTodayReview(): Promise<{
        words: ({
            word: {
                id: number;
                word: string;
                phonetic: string | null;
                meaning: string;
                example: string | null;
                wordBookId: number;
            };
        } & {
            id: number;
            userId: number;
            wordId: number;
            status: string;
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
    getStreak(): Promise<{
        streak: number;
        checkedInToday: boolean;
    }>;
    checkIn(): Promise<{
        streak: number;
        checkedInToday: boolean;
    }>;
    submitReview(wordId: string, body: {
        rating: 'again' | 'good' | 'easy';
    }): Promise<{
        status: string;
        nextReviewAt: Date;
        reviewCount: number;
    }>;
}
