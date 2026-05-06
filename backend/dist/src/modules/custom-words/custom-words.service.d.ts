import { PrismaService } from '../../prisma/prisma.service';
export declare class CustomWordsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getOrCreateCustomBook;
    findAll(userId: number): Promise<{
        word: string;
        id: number;
        wordBookId: number;
        phonetic: string | null;
        meaning: string;
        example: string | null;
    }[]>;
    create(userId: number, data: {
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
    remove(userId: number, wordId: number): Promise<{
        word: string;
        id: number;
        wordBookId: number;
        phonetic: string | null;
        meaning: string;
        example: string | null;
    }>;
}
