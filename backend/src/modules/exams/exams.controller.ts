import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { ExamsService } from './exams.service';

@Controller('api/exams')
export class ExamsController {
  constructor(private readonly service: ExamsService) {}

  @Get('sessions')
  getSessions() {
    return this.service.getSessions();
  }

  @Get(':sessionId/papers')
  getPapers(@Param('sessionId') sessionId: string) {
    return this.service.getPapers(sessionId);
  }

  @Get('pdf')
  async getPdf(
    @Query('session') sessionId: string,
    @Query('path') relativePath: string,
    @Res() res: Response,
  ) {
    const pdfPath = this.service.getPdfPath(sessionId, relativePath);
    const stream = createReadStream(pdfPath);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, max-age=3600',
    });
    stream.pipe(res);
  }

  @Get('text')
  async getPdfText(
    @Query('session') sessionId: string,
    @Query('path') relativePath: string,
  ) {
    const text = await this.service.getPdfText(sessionId, relativePath);
    return { text };
  }

  @Get('lookup')
  async lookupWord(@Query('word') word: string) {
    if (!word) {
      return { word: '', found: false, meaning: null, phonetic: null, example: null };
    }
    return this.service.lookupWord(word.trim().toLowerCase());
  }
}
