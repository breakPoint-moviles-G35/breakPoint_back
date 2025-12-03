import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { FeatureUsageDto } from './dto/feature-usage.dto';
import { ForecastDayDto } from './dto/forecast-day.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('q7')
  async getFeatureUsageQ7(): Promise<FeatureUsageDto[]> {
    return await this.analyticsService.getFeatureUsageQ7();
  }

  @Get('q20/:id')
  async getQ20Forecast(@Param('id') id: string): Promise<ForecastDayDto[]> {
    return await this.analyticsService.getQ20ForecastForSpace(id);
  }
}
