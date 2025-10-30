import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard) 
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // CREAR RESERVA
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateBookingDto) {
    const userId = (req as any).user?.id;
    console.log('[POST] create booking | userId:', userId);
    return this.bookingService.create(userId, dto);
  }

  // LISTAR RESERVAS POR USUARIO
  @Get()
  async findForUser(@Req() req: Request) {
    const userId = (req as any).user?.id;
    console.log('[GET] find bookings | userId:', userId);
    return this.bookingService.findForUser(userId);
  }

  // ACTUALIZAR RESERVA
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() dto: UpdateBookingDto,
  ) {
    const userId = (req as any).user?.id;
    return this.bookingService.update(id, userId, dto);
  }

  // SOFT - ELIMINAR RESERVA
  @Delete(':id')
async cancel(@Param('id') id: string, @Req() req: Request) {
  const userId = (req as any).user?.id;
  const result = await this.bookingService.remove(id, userId);
  return { message: `Booking ${id} cancelled`, result };
}

  // RESERVAS ACTIVAS
  @Get('active-now')
  findActiveNow(@Req() req: any) {
    return this.bookingService.findActiveNow(req.user.id);
  }

  // RESERVAS CERRADAS
  @Get('closed')
  findClosed(@Req() req: any) {
    return this.bookingService.findClosed(req.user.id);
  }

  // CHECKOUT
  @Post(':id/checkout')
  async checkout(@Req() req: any, @Param('id') id: string) {
    const result = await this.bookingService.checkout(req.user.id, id);
    if (!result) throw new NotFoundException('Booking not found');
    return result;
  }
}