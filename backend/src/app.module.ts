import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { WordBooksModule } from './modules/word-books/word-books.module';
import { WordsModule } from './modules/words/words.module';
import { ReviewModule } from './modules/review/review.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { CustomWordsModule } from './modules/custom-words/custom-words.module';
import { ExamsModule } from './modules/exams/exams.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    WordBooksModule,
    WordsModule,
    ReviewModule,
    StatisticsModule,
    CustomWordsModule,
    ExamsModule,
  ],
})
export class AppModule {}
