import { WordBooksService } from './word-books.service';
export declare class WordBooksController {
    private readonly service;
    constructor(service: WordBooksService);
    findAll(): Promise<({
        _count: {
            words: number;
        };
    } & {
        id: number;
        name: string;
        description: string | null;
        level: string;
    })[]>;
    findOne(id: string): Promise<({
        _count: {
            words: number;
        };
    } & {
        id: number;
        name: string;
        description: string | null;
        level: string;
    }) | null>;
    getStats(id: string): Promise<{
        total: number;
        learned: number;
        learning: number;
        notStarted: number;
    }>;
}
