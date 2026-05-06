import { Controller, Get, Param } from '@nestjs/common';
import { WordBooksService } from './word-books.service';

@Controller('api/word-books')
export class WordBooksController {
  constructor(private readonly service: WordBooksService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    return this.service.getStats(+id);
  }
}
