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
exports.WordBooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let WordBooksService = class WordBooksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const books = await this.prisma.wordBook.findMany({
            include: { _count: { select: { words: true } } },
        });
        return books;
    }
    async findOne(id) {
        const book = await this.prisma.wordBook.findUnique({
            where: { id },
            include: { _count: { select: { words: true } } },
        });
        return book;
    }
    async getStats(id) {
        const total = await this.prisma.word.count({ where: { wordBookId: id } });
        const learned = await this.prisma.userWord.count({
            where: { word: { wordBookId: id }, status: 'MASTERED' },
        });
        const learning = await this.prisma.userWord.count({
            where: { word: { wordBookId: id }, status: { in: ['LEARNING', 'REVIEWING'] } },
        });
        return { total, learned, learning, notStarted: total - learned - learning };
    }
};
exports.WordBooksService = WordBooksService;
exports.WordBooksService = WordBooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WordBooksService);
//# sourceMappingURL=word-books.service.js.map