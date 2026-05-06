import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('api/review')
export class ReviewController {
  constructor(private readonly service: ReviewService) {}

  @Get('learned')
  async getLearnedWords() {
    return this.service.getLearnedWords(1);
  }

  @Get('today')
  async getTodayReview() {
    return this.service.getTodayReview(1); // demo user id=1
  }

  @Get('streak')
  async getStreak() {
    return this.service.getStreakInfo(1);
  }

  @Post('checkin')
  async checkIn() {
    return this.service.checkIn(1);
  }

  @Post(':wordId')
  async submitReview(
    @Param('wordId') wordId: string,
    @Body() body: { rating: 'again' | 'good' | 'easy' },
  ) {
    return this.service.submitReview(1, +wordId, body.rating);
  }
}
