import { Injectable, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import { existsSync, readdirSync, statSync } from 'fs';
import { PrismaService } from '../../prisma/prisma.service';

const EXAM_DIR = join(__dirname, '..', '..', '..', '..', 'exam-papers');

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

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  getSessions(): SessionInfo[] {
    if (!existsSync(EXAM_DIR)) {
      return [];
    }
    const entries = readdirSync(EXAM_DIR, { withFileTypes: true });
    const sessions: SessionInfo[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const match = entry.name.match(/^CET6_(\d{4})\.(\d{2})$/);
      if (!match) continue;

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

  getPapers(sessionId: string): PaperInfo[] {
    const sessionPath = join(EXAM_DIR, sessionId);
    if (!existsSync(sessionPath)) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    const papers: PaperInfo[] = [];
    this.scanPdfs(sessionPath, '', papers);

    // Filter out answer/解析 PDFs, keep exam papers
    const examPapers = papers.filter((p) => {
      const lower = p.name.toLowerCase();
      return !lower.includes('解析') && !lower.includes('答案') && !lower.includes('key');
    });

    return examPapers.map((p, i) => ({
      ...p,
      id: `paper-${i + 1}`,
    }));
  }

  getPdfPath(sessionId: string, relativePath: string): string {
    const fullPath = join(EXAM_DIR, sessionId, relativePath);
    if (!existsSync(fullPath)) {
      throw new NotFoundException('PDF not found');
    }
    return fullPath;
  }

  async getPdfText(sessionId: string, relativePath: string): Promise<string> {
    const fullPath = this.getPdfPath(sessionId, relativePath);
    const { readFileSync } = await import('fs');
    const buf = readFileSync(fullPath);

    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buf });
    const result = await parser.getText();
    return result.text;
  }

  async lookupWord(word: string) {
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

  private scanPdfs(dir: string, relativeDir: string, results: PaperInfo[]): void {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        this.scanPdfs(fullPath, relativePath, results);
      } else if (entry.name.toLowerCase().endsWith('.pdf')) {
        results.push({
          id: '',
          name: entry.name.replace(/\.pdf$/i, ''),
          relativePath,
        });
      }
    }
  }
}
