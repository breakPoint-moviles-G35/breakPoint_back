
import { ConfigModule } from '@nestjs/config';

import { EventLogModule } from './event-log/event-log.module';
import { UserModule } from './user/user.module';
import { SpaceModule } from './space/space.module';
import { HostProfileModule } from './host-profile/host-profile.module';
import { InventorySlotModule } from './inventory-slot/inventory-slot.module';
import { BookingModule } from './booking/booking.module';
import { AccessCredentialModule } from './access-credential/access-credential.module';
import { ReviewModule } from './review/review.module';
import { IncidentModule } from './incident/incident.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // 👈 carga .env
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.SUPABASE_HOST,
      port: 5432,
      username: process.env.SUPABASE_USER,
      password: process.env.SUPABASE_PASSWORD,
      database: process.env.SUPABASE_DB,
      autoLoadEntities: true,
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    }),
    EventLogModule,
    UserModule,
    HostProfileModule,
    SpaceModule,
    InventorySlotModule,
    BookingModule,
    AccessCredentialModule,
    ReviewModule,
    IncidentModule,
    AuthModule,
  ],
})
export class AppModule {}
