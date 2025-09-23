import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventLogModule } from './event-log/event-log.module';
import { UserModule } from './user/user.module';
import { HostProfileModule } from './host-profile/host-profile.module';
import { SpaceModule } from './space/space.module';
import { InventorySlotModule } from './inventory-slot/inventory-slot.module';
import { BookingModule } from './booking/booking.module';
import { AccessCredentialModule } from './access-credential/access-credential.module';
import { ReviewModule } from './review/review.module';
import { IncidentModule } from './incident/incident.module';


@Module({
  imports: [EventLogModule, UserModule, HostProfileModule, SpaceModule, InventorySlotModule, BookingModule, AccessCredentialModule, ReviewModule, IncidentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
