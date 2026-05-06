import { PrismaService } from '../../prisma/prisma.service';
export declare class WordBooksService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findOne(id: number): Promise<({
        _count: {
            words: number;
        };
    } & {
        id: number;
        name: string;
        description: string | null;
        level: string;
    }) | null>;
    getStats(id: number): Promise<{
        total: number;
        learned: number;
        learning: number;
        notStarted: number;
    }>;
}
