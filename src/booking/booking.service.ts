/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Space } from 'src/space/entities/space.entity/space.entity';
import { User } from 'src/user/entities/user/user.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking) private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Space) private readonly spaceRepo: Repository<Space>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
    const logger = new Logger(BookingService.name);
    logger.log(`Create booking requested | userId=${userId} | dto=${JSON.stringify(dto)}`);
    try {
      const space = await this.spaceRepo.findOne({ where: { id: dto.spaceId } });
      if (!space) throw new NotFoundException('Space not found');
      logger.debug(`Space found | spaceId=${space.id} | capacity=${space.capacity} | price=${space.price}`);

      if (dto.guestCount > space.capacity) {
        logger.warn(`Guest count exceeds capacity | guestCount=${dto.guestCount} | capacity=${space.capacity}`);
        throw new BadRequestException('Guest count exceeds capacity');
      }

      const start = new Date(dto.slotStart);
      const end = new Date(dto.slotEnd);
      logger.debug(`Parsed dates | start=${start.toISOString?.() ?? start} | end=${end.toISOString?.() ?? end}`);
      if (!(start instanceof Date) || isNaN(start.getTime()) || !(end instanceof Date) || isNaN(end.getTime()))
        throw new BadRequestException('Invalid dates');
      if (end <= start) throw new BadRequestException('slotEnd must be after slotStart');

      // Overlap check
      const overlapping = await this.bookingRepo
        .createQueryBuilder('b')
        .leftJoin('b.space', 'space')
        .where('space.id = :spaceId', { spaceId: space.id })
        .andWhere('(b.slot_start < :end AND b.slot_end > :start)', { start, end })
        .andWhere("b.status IN (:...statuses)", { statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED] })
        .getCount();
      logger.debug(`Overlap check | overlappingCount=${overlapping}`);
      if (overlapping > 0) throw new BadRequestException('Time slot not available');

      const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (60 * 60 * 1000)));
      const totalAmount = Number(space.price) * hours;
      logger.debug(`Pricing | hours=${hours} | totalAmount=${totalAmount}`);

      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const booking = this.bookingRepo.create({
        user,
        space,
        slot_start: start,
        slot_end: end,
        status: BookingStatus.CONFIRMED,
        total_amount: totalAmount,
        currency: 'USD',
      });
      const saved = await this.bookingRepo.save(booking);
      logger.log(`Booking created | bookingId=${saved.id} | status=${saved.status}`);
      return saved;
    } catch (e: any) {
      const message = e?.message ?? 'Unknown error';
      const stack = e?.stack;
      // avoid logging sensitive info beyond dto summary above
      const info = { userId, spaceId: dto?.spaceId };
      Logger.error(`Failed to create booking | ${message}`, stack, BookingService.name);
      Logger.debug(`Context: ${JSON.stringify(info)}`);
      throw e;
    }
  }

  async findForUser(userId: string) {
    const logger = new Logger(BookingService.name);
    logger.log(`List bookings requested | userId=${userId}`);
    const bookings = await this.bookingRepo.find({
      where: { user: { id: userId } },
      relations: { space: true },
      order: { slot_start: 'DESC' },
    });
    return bookings.map((b) => ({
      id: b.id,
      status: b.status,
      slotStart: b.slot_start,
      slotEnd: b.slot_end,
      totalAmount: b.total_amount,
      currency: b.currency,
      space: {
        id: b.space?.id,
        title: b.space?.title,
        imageUrl: (b as any)?.space?.imageUrl,
        price: b.space?.price,
        capacity: b.space?.capacity,
      },
    }));
  }
}


