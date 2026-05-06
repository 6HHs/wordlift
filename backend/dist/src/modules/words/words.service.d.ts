import { PrismaService } from '../../prisma/prisma.service';
export declare class WordsService {
    private prisma;
    constructor(prisma: PrismaService);
    findByBook(bookId: number, limit?: number): Promise<{
        word: string;
        id: number;
        phonetic: string | null;
        meaning: string;
        example: string | null;
        wordBookId: number;
    }[]>;
    findNewWords(bookId: number, limit?: number): Promise<{
        word: string;
        id: number;
        phonetic: string | null;
        meaning: string;
        example: string | null;
        wordBookId: number;
    }[]>;
    fillPhonetics(bookId: number): Promise<{
        updated: number;
        failed: number;
        total: number;
    }>;
    private fetchPhonetic;
}
