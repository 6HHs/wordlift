"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamsService = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs_1 = require("fs");
const prisma_service_1 = require("../../prisma/prisma.service");
const EXAM_DIR = (0, path_1.join)(__dirname, '..', '..', '..', '..', 'exam-papers');
let ExamsService = class ExamsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getSessions() {
        if (!(0, fs_1.existsSync)(EXAM_DIR)) {
            return [];
        }
        const entries = (0, fs_1.readdirSync)(EXAM_DIR, { withFileTypes: true });
        const sessions = [];
        for (const entry of entries) {
            if (!entry.isDirectory())
                continue;
            const match = entry.name.match(/^CET6_(\d{4})\.(\d{2})$/);
            if (!match)
                continue;
            const year = parseInt(match[1]);
            const month = parseInt(match[2]);
            sessions.push({
                id: entry.name,
                label: `${year}年${month}月`,
                year,
                month,
            });
        }
        sessions.sort((a, b) => b.year - a.year || b.month - a.month);
        return sessions;
    }
    getPapers(sessionId) {
        const sessionPath = (0, path_1.join)(EXAM_DIR, sessionId);
        if (!(0, fs_1.existsSync)(sessionPath)) {
            throw new common_1.NotFoundException(`Session ${sessionId} not found`);
        }
        const papers = [];
        this.scanPdfs(sessionPath, '', papers);
        const examPapers = papers.filter((p) => {
            const lower = p.name.toLowerCase();
            return !lower.includes('解析') && !lower.includes('答案') && !lower.includes('key');
        });
        return examPapers.map((p, i) => ({
            ...p,
            id: `paper-${i + 1}`,
        }));
    }
    getPdfPath(sessionId, relativePath) {
        const fullPath = (0, path_1.join)(EXAM_DIR, sessionId, relativePath);
        if (!(0, fs_1.existsSync)(fullPath)) {
            throw new common_1.NotFoundException('PDF not found');
        }
        return fullPath;
    }
    async getPdfText(sessionId, relativePath) {
        const fullPath = this.getPdfPath(sessionId, relativePath);
        const { readFileSync } = await Promise.resolve().then(() => __importStar(require('fs')));
        const buf = readFileSync(fullPath);
        const { PDFParse } = await Promise.resolve().then(() => __importStar(require('pdf-parse')));
        const parser = new PDFParse({ data: buf });
        const result = await parser.getText();
        return result.text;
    }
    async lookupWord(word) {
        const result = await this.prisma.word.findFirst({
            where: { word: { equals: word } },
        });
        if (!result) {
            return { word, found: false, meaning: null, phonetic: null, example: null };
        }
        return {
            word: result.word,
            found: true,
            meaning: result.meaning,
            phonetic: result.phonetic,
            example: result.example,
        };
    }
    scanPdfs(dir, relativeDir, results) {
        const entries = (0, fs_1.readdirSync)(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = (0, path_1.join)(dir, entry.name);
            const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
                this.scanPdfs(fullPath, relativePath, results);
            }
            else if (entry.name.toLowerCase().endsWith('.pdf')) {
                results.push({
                    id: '',
                    name: entry.name.replace(/\.pdf$/i, ''),
                    relativePath,
                });
            }
        }
    }
};
exports.ExamsService = ExamsService;
exports.ExamsService = ExamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExamsService);
//# sourceMappingURL=exams.service.js.map