import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { FeatureUsageDto } from './dto/feature-usage.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('q7')
  async getFeatureUsageQ7(): Promise<FeatureUsageDto[]> {
    return await this.analyticsService.getFeatureUsageQ7();
  }
}
