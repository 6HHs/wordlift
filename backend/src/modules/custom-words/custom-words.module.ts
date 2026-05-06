import { Module } from '@nestjs/common';
import { CustomWordsController } from './custom-words.controller';
import { CustomWordsService } from './custom-words.service';

@Module({
  controllers: [CustomWordsController],
  providers: [CustomWordsService],
})
export class CustomWordsModule {}
