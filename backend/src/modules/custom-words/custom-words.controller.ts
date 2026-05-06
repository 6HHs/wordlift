import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CustomWordsService } from './custom-words.service';

@Controller('api/custom-words')
export class CustomWordsController {
  constructor(private readonly service: CustomWordsService) {}

  @Get()
  async findAll() {
    return this.service.findAll(1);
  }

  @Post()
  async create(@Body() body: { word: string; meaning: string; phonetic?: string; example?: string }) {
    return this.service.create(1, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(1, +id);
  }
}
