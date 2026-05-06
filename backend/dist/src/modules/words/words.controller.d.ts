import { WordsService } from './words.service';
export declare class WordsController {
    private readonly service;
    constructor(service: WordsService);
    findByBook(bookId: string, limit?: string): Promise<{
        word: string;
        id: number;
        phonetic: string | null;
        meaning: string;
        example: string | null;
        wordBookId: number;
    }[]>;
    findNewWords(bookId: string, limit?: string): Promise<{
        word: string;
        id: number;
        phonetic: string | null;
        meaning: string;
        example: string | null;
        wordBookId: number;
    }[]>;
    fillPhonetics(bookId: string): Promise<{
        updated: number;
        failed: number;
        total: number;
    }>;
}
