import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { WordsService } from './words.service';

@Controller('api')
export class WordsController {
  constructor(private readonly service: WordsService) {}

  @Get('word-books/:bookId/words')
  async findByBook(
    @Param('bookId') bookId: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findByBook(+bookId, limit ? +limit : undefined);
  }

  @Get('word-books/:bookId/words/new')
  async findNewWords(
    @Param('bookId') bookId: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findNewWords(+bookId, limit ? +limit : undefined);
  }

  @Post('word-books/:bookId/fill-phonetics')
  async fillPhonetics(@Param('bookId') bookId: string) {
    return this.service.fillPhonetics(+bookId);
  }
}
