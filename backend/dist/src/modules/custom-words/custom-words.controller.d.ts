import { CustomWordsService } from './custom-words.service';
export declare class CustomWordsController {
    private readonly service;
    constructor(service: CustomWordsService);
    findAll(): Promise<{
        word: string;
        id: number;
        wordBookId: number;
        phonetic: string | null;
        meaning: string;
        example: string | null;
    }[]>;
    create(body: {
        word: string;
        meaning: string;
        phonetic?: string;
        example?: string;
    }): Promise<{
        word: string;
        id: number;
        wordBookId: number;
        phonetic: string | null;
        meaning: string;
        example: string | null;
    }>;
    remove(id: string): Promise<{
        word: string;
        id: number;
        wordBookId: number;
        phonetic: string | null;
        meaning: string;
        example: string | null;
    }>;
}
