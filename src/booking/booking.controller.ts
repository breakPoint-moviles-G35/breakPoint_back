/* eslint-disable prettier/prettier */
import { Body, Controller, Post, Req, UseGuards, Logger, Get, Param, NotFoundException } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateBookingDto) {
    const logger = new Logger(BookingController.name);
    logger.log(`HTTP POST /booking | user=${req?.user?.id}`);
    return this.bookingService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findMy(@Req() req: any) {
    const logger = new Logger(BookingController.name);
    logger.log(`HTTP GET /booking | user=${req?.user?.id}`);
    return this.bookingService.findForUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('active-now')
  findActiveNow(@Req() req: any) {
    return this.bookingService.findActiveNow(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/checkout')
  async checkout(@Req() req: any, @Param('id') id: string) {
    const result = await this.bookingService.checkout(req.user.id, id);
    if (!result) throw new NotFoundException('Booking not found');
    return result;
  }
}


