import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventLog } from 'src/event-log/entities/event-log.entity/event-log.entity';
import { FeatureUsageDto } from './dto/feature-usage.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(EventLog)
    private readonly eventLogRepository: Repository<EventLog>,
  ) {}

  async getFeatureUsageQ7(): Promise<FeatureUsageDto[]> {
    try {
      const results = await this.eventLogRepository.query(
        `
        SELECT feature_name AS "featureName", COUNT(*) AS uses
        FROM (
          SELECT
            CASE
              WHEN LOWER(event_type) IN ('extend_booking', 'extend-booking') OR LOWER(payload ->> 'action') IN ('extend booking', 'extend_booking') THEN 'extend booking'
              WHEN LOWER(event_type) IN ('share_link', 'share-link') OR LOWER(payload ->> 'action') IN ('share link', 'share_link') THEN 'share link'
              WHEN LOWER(event_type) IN ('review_created', 'review', 'reviews', 'review_submitted') OR LOWER(payload ->> 'action') IN ('reviews', 'review') THEN 'reviews'
              WHEN LOWER(event_type) IN ('chat_with_host', 'chat', 'message_sent') OR LOWER(payload ->> 'action') IN ('chat with host', 'chat') THEN 'chat with host'
              ELSE NULL
            END AS feature_name
          FROM event_log
        ) mapped
        WHERE feature_name IS NOT NULL
        GROUP BY feature_name
        ORDER BY uses ASC;
        `,
      );

      return results.map((row: any) => ({
        featureName: row.featureName,
        uses: Number(row.uses),
      }));
    } catch (error) {
      this.logger.error('Failed to fetch feature usage for Q7', (error as Error)?.stack);
      throw new HttpException('Failed to retrieve feature usage analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
