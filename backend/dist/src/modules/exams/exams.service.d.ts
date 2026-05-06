import { PrismaService } from '../../prisma/prisma.service';
export interface SessionInfo {
    id: string;
    label: string;
    year: number;
    month: number;
}
export interface PaperInfo {
    id: string;
    name: string;
    relativePath: string;
}
export declare class ExamsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSessions(): SessionInfo[];
    getPapers(sessionId: string): PaperInfo[];
    getPdfPath(sessionId: string, relativePath: string): string;
    getPdfText(sessionId: string, relativePath: string): Promise<string>;
    lookupWord(word: string): Promise<{
        word: string;
        found: boolean;
        meaning: null;
        phonetic: null;
        example: null;
    } | {
        word: string;
        found: boolean;
        meaning: string;
        phonetic: string | null;
        example: string | null;
    }>;
    private scanPdfs;
}
