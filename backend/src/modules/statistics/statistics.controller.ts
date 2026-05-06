import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('api/statistics')
export class StatisticsController {
  constructor(private readonly service: StatisticsService) {}

  @Get('overview')
  async getOverview(@Query('bookId') bookId?: string) {
    return this.service.getOverview(1, bookId ? +bookId : undefined);
  }

  @Get('distribution')
  async getDistribution() {
    return this.service.getDistribution(1);
  }

  @Get('forgetting-curve')
  async getForgettingCurve() {
    return this.service.getForgettingCurve(1);
  }
}
