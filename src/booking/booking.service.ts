/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Space } from 'src/space/entities/space.entity/space.entity';
import { User } from 'src/user/entities/user/user.entity';
import { EventLog } from 'src/event-log/entities/event-log.entity/event-log.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking) private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Space) private readonly spaceRepo: Repository<Space>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(EventLog) private readonly eventLogRepo: Repository<EventLog>,
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

      const now = new Date();
      if (start < now) {
        logger.warn(`Intento de reserva en el pasado | start=${start.toISOString()} | now=${now.toISOString()}`);
        throw new BadRequestException('No se puede crear la reserva indicada: la hora de inicio ya ha pasado');
      }

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
      const baseSubtotal = Number(space.price) * hours;
      logger.debug(`Pricing | hours=${hours} | baseSubtotal=${baseSubtotal}`);

      const previousCompletedBookings = await this.bookingRepo
        .createQueryBuilder('b')
        .leftJoin('b.user', 'user')
        .leftJoin('b.space', 'space')
        .where('user.id = :userId', { userId })
        .andWhere('space.id = :spaceId', { spaceId: space.id })
        .andWhere('b.status IN (:...statuses)', { statuses: [BookingStatus.CLOSED, BookingStatus.CONFIRMED] })
        .getCount();

      const discountApplied = previousCompletedBookings >= 2;
      const discountPercent = discountApplied ? 25 : 0;
      const discountAmount = discountApplied ? Number((baseSubtotal * 0.25).toFixed(2)) : 0;
      const total = Number((baseSubtotal - discountAmount).toFixed(2));
      logger.debug(
        `Loyalty discount | previousCompleted=${previousCompletedBookings} | discountApplied=${discountApplied} | total=${total}`,
      );

      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const booking = this.bookingRepo.create({
        user,
        space,
        slot_start: start,
        slot_end: end,
        status: BookingStatus.CONFIRMED,
        baseSubtotal,
        discountApplied,
        discountPercent,
        discountAmount,
        totalAmount: total,
        currency: 'USD',
      });
      const saved = await this.bookingRepo.save(booking);
      logger.log(`Booking created | bookingId=${saved.id} | status=${saved.status}`);
      return {
        ...saved,
        baseSubtotal: Number(saved.baseSubtotal),
        discountApplied: saved.discountApplied,
        discountPercent: Number(saved.discountPercent),
        discountAmount: Number(saved.discountAmount),
        totalAmount: Number(saved.totalAmount),
        total: Number(saved.totalAmount),
      };
    } catch (e: any) {
      const message = e?.message ?? 'Unknown error';
      const stack = e?.stack;
      const info = { userId, spaceId: dto?.spaceId } as any;
      Logger.error(`Failed to create booking | ${message}`, stack, BookingService.name);
      Logger.debug(`Context: ${JSON.stringify(info)}`);
      throw e;
    }
  }

  async findForUser(userId: string) {
    const logger = new Logger(BookingService.name);
    logger.log(`List bookings requested | userId=${userId}`);
    const bookings = await this.bookingRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.space', 'space')
      .leftJoin('b.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('b.slot_start', 'DESC')
      .getMany();
    return bookings.map((b) => ({
      id: b.id,
      status: b.status,
      slotStart: b.slot_start,
      slotEnd: b.slot_end,
      baseSubtotal: Number(b.baseSubtotal),
      discountApplied: b.discountApplied,
      discountPercent: Number(b.discountPercent),
      discountAmount: Number(b.discountAmount),
      totalAmount: Number(b.totalAmount),
      total: Number(b.totalAmount),
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

  async findActiveNow(userId: string) {
    const now = new Date();
    const bookings = await this.bookingRepo.find({
      where: { user: { id: userId } },
      relations: { space: true },
      order: { slot_start: 'DESC' },
    });
    const active = bookings.filter((b) => {
      const inWindow = b.slot_start <= now && now <= b.slot_end;
      return inWindow && b.status === BookingStatus.CONFIRMED;
    });
    if (active.length === 0) return [];
    return active.map((b) => ({
      id: b.id,
      status: b.status,
      slotStart: b.slot_start,
      slotEnd: b.slot_end,
      space: {
        id: b.space?.id,
        title: b.space?.title,
        imageUrl: (b as any)?.space?.imageUrl,
      },
    }));
  }

  async findClosed(userId: string) {
    const bookings = await this.bookingRepo.find({
      where: { user: { id: userId } },
      relations: { space: true },
      order: { slot_start: 'DESC' },
    });
    const closed = bookings.filter((b) => {
      return b.status === BookingStatus.CLOSED;
    });
    if (closed.length === 0) return [];
    return closed.map((b) => ({
      id: b.id,
      status: b.status,
      slotStart: b.slot_start,
      slotEnd: b.slot_end,
      space: {
        id: b.space?.id,
        title: b.space?.title,
        imageUrl: (b as any)?.space?.imageUrl,
      },
    }));
  }

  async checkout(userId: string, bookingId: string) {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId }, relations: { user: true } });
    if (!booking || booking.user?.id !== userId) return null;

    const now = new Date();
    if (now < booking.slot_start || now > booking.slot_end) {
      throw new BadRequestException('Not within booking time window');
    }
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Only CONFIRMED bookings can be closed');
    }

    booking.status = BookingStatus.CLOSED;
    return await this.bookingRepo.save(booking);
  }

  async update(id: string, userId: string, dto: UpdateBookingDto) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: { user: true, space: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (userId && booking.user.id !== userId) {
      throw new BadRequestException('Not allowed');
    }

    if (dto.slotStart && dto.slotEnd) {
      const start = new Date(dto.slotStart);
      const end = new Date(dto.slotEnd);
      if (end <= start) throw new BadRequestException('slotEnd must be after slotStart');

      const overlap = await this.bookingRepo
        .createQueryBuilder('b')
        .leftJoin('b.space', 'space')
        .where('space.id = :spaceId', { spaceId: booking.space.id })
        .andWhere('(b.slot_start < :end AND b.slot_end > :start)', { start, end })
        .andWhere('b.id != :id', { id })
        .andWhere("b.status IN (:...statuses)", { statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED] })
        .getCount();

      if (overlap > 0) throw new BadRequestException('Time slot not available');

      booking.slot_start = start;
      booking.slot_end = end;
    }

    if (dto.status) booking.status = dto.status;

    const saved = await this.bookingRepo.save(booking);
    return saved;
  }

  async remove(id: string, userId?: string) {
  const cleanId = id.trim();
  console.log('ID limpio (soft delete):', cleanId);

  const booking = await this.bookingRepo.findOne({
    where: { id: cleanId },
    relations: { user: true },
  });

  if (!booking) throw new NotFoundException('Booking not found');
  if (userId && booking.user?.id !== userId)
    throw new BadRequestException('Not allowed');

  // 🔹 Eliminar logs asociados (mantener integridad)
  await this.eventLogRepo
    .createQueryBuilder()
    .delete()
    .from(EventLog)
    .where('"bookingId" = :id', { id: cleanId })
    .execute();

  // 🔹 Cambiar estado a CANCELLED en lugar de eliminar
  booking.status = BookingStatus.CANCELLED;
  await this.bookingRepo.save(booking);

  console.log(`Booking ${cleanId} marcado como CANCELLED`);

  return { message: `Booking ${cleanId} cancelled`, status: booking.status };
}

async findNextForUser(
    userId: string,
    windowMinutes = 60,
  ): Promise<Booking | null> {
    // Si quieres incluir el título del espacio, puedes join a Spaces
    const qb = this.bookingRepo
      .createQueryBuilder('r')
      .select(['r.id', 'r.spaceId', 'r.slot_start'])
      .where('r.userId = :userId', { userId })
      .andWhere('r.slot_start > NOW()')
      .andWhere(`r.slot_start <= NOW() + (:wm || ' minutes')::interval`, {
        wm: String(windowMinutes),
      })
      .orderBy('r.slot_start', 'ASC')
      .limit(1);

    // Si tienes entidad "Space" y relación, puedes hacer:
    // .leftJoin('r.space', 's')
    // .addSelect(['s.title'])

    const next = await qb.getOne();

    return next;
  }


}