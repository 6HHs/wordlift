import { Response } from 'express';
import { ExamsService } from './exams.service';
export declare class ExamsController {
    private readonly service;
    constructor(service: ExamsService);
    getSessions(): import("./exams.service").SessionInfo[];
    getPapers(sessionId: string): import("./exams.service").PaperInfo[];
    getPdf(sessionId: string, relativePath: string, res: Response): Promise<void>;
    getPdfText(sessionId: string, relativePath: string): Promise<{
        text: string;
    }>;
    lookupWord(word: string): Promise<{
        word: string;
        found: boolean;
        meaning: string;
        phonetic: string | null;
        example: string | null;
    } | {
        word: string;
        found: boolean;
        meaning: null;
        phonetic: null;
        example: null;
    }>;
}
