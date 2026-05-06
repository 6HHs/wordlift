"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let WordsService = class WordsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByBook(bookId, limit) {
        return this.prisma.word.findMany({
            where: { wordBookId: bookId },
            ...(limit ? { take: limit } : {}),
            orderBy: { id: 'asc' },
        });
    }
    async findNewWords(bookId, limit) {
        const studiedIds = await this.prisma.userWord.findMany({
            where: { userId: 1, word: { wordBookId: bookId } },
            select: { wordId: true },
        });
        const result = await this.prisma.word.findMany({
            where: {
                wordBookId: bookId,
                id: { notIn: studiedIds.map((uw) => uw.wordId) },
            },
            ...(limit ? { take: limit } : {}),
            orderBy: { id: 'asc' },
        });
        return result;
    }
    async fillPhonetics(bookId) {
        const words = await this.prisma.word.findMany({
            where: { wordBookId: bookId, phonetic: null },
            take: 50,
        });
        let updated = 0;
        let failed = 0;
        for (const word of words) {
            try {
                const phonetic = await this.fetchPhonetic(word.word);
                if (phonetic) {
                    await this.prisma.word.update({
                        where: { id: word.id },
                        data: { phonetic },
                    });
                    updated++;
                }
                else {
                    failed++;
                }
            }
            catch {
                failed++;
            }
            await new Promise((r) => setTimeout(r, 200));
        }
        return { updated, failed, total: words.length };
    }
    async fetchPhonetic(word) {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`, { signal: AbortSignal.timeout(5000) });
        if (!res.ok)
            return null;
        const data = await res.json();
        if (data[0]?.phonetic)
            return data[0].phonetic;
        for (const p of data[0]?.phonetics ?? []) {
            if (p.text)
                return p.text;
        }
        return null;
    }
};
exports.WordsService = WordsService;
exports.WordsService = WordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WordsService);
//# sourceMappingURL=words.service.js.map