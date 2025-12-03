import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EventLog } from 'src/event-log/entities/event-log.entity/event-log.entity';
import { FeatureUsageDto } from './dto/feature-usage.dto';
import { ForecastDayDto } from './dto/forecast-day.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(EventLog)
    private readonly eventLogRepository: Repository<EventLog>,
    private readonly dataSource: DataSource,
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

  async getQ20ForecastForSpace(spaceId: string): Promise<ForecastDayDto[]> {
    try {
      const rows = await this.dataSource.query(
        `
        WITH base AS (
          SELECT
            "spaceId"::text AS space_id,
            (timezone('America/Bogota', COALESCE(slot_start, slot_end)))::date AS day,
            UPPER(TRIM(status::text)) AS status_norm
          FROM booking
          WHERE "spaceId" = $1::uuid
        ),
        daily_all AS (
          SELECT
            space_id,
            day,
            COUNT(*) AS bookings
          FROM base
          WHERE status_norm IN ('CONFIRMED', 'CLOSED') AND day IS NOT NULL
          GROUP BY space_id, day
        ),
        last4w AS (
          SELECT *
          FROM daily_all
          WHERE day >= (timezone('America/Bogota', now())::date - INTERVAL '28 days')
        ),
        pattern AS (
          SELECT
            space_id,
            EXTRACT(DOW FROM day) AS dow,
            AVG(bookings) AS avg_by_dow
          FROM last4w
          GROUP BY space_id, dow
        ),
        space_avg AS (
          SELECT
            space_id,
            AVG(bookings) AS avg_space
          FROM daily_all
          GROUP BY space_id
        ),
        global_base AS (
          SELECT
            (timezone('America/Bogota', COALESCE(slot_start, slot_end)))::date AS day,
            UPPER(TRIM(status::text)) AS status_norm
          FROM booking
        ),
        global_daily AS (
          SELECT
            day,
            COUNT(*) AS bookings
          FROM global_base
          WHERE status_norm IN ('CONFIRMED', 'CLOSED') AND day IS NOT NULL
          GROUP BY day
        ),
        global_avg AS (
          SELECT AVG(bookings) AS avg_global FROM global_daily
        ),
        next7 AS (
          SELECT
            $1::text AS space_id,
            (timezone('America/Bogota', now())::date + g) AS day,
            EXTRACT(DOW FROM (timezone('America/Bogota', now())::date + g)) AS dow
          FROM generate_series(1,7) AS g
        )
        SELECT
          n.day,
          COALESCE(p.avg_by_dow, sa.avg_space, ga.avg_global, 0) AS forecast_bookings
        FROM next7 n
        LEFT JOIN pattern p   ON p.space_id = n.space_id AND p.dow = n.dow
        LEFT JOIN space_avg sa ON sa.space_id = n.space_id
        CROSS JOIN global_avg ga
        ORDER BY n.day ASC;
        `,
        [spaceId],
      );

      return rows.map((row: any) => {
        const day = row.day instanceof Date ? row.day.toISOString().slice(0, 10) : String(row.day);
        return {
          day,
          forecastBookings: Number(row.forecast_bookings ?? row.forecastBookings),
        };
      });
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Failed to compute Q20 forecast for spaceId=${spaceId}: ${error.message}`, error?.stack);
      throw new HttpException('Failed to retrieve forecast analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
