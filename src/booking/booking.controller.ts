/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Req,
  Logger,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

import type { Request } from 'express';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // CREAR RESERVA
  
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateBookingDto) {
    const logger = new Logger(BookingController.name);
    logger.log(`HTTP POST /booking | user=${(req as any)?.user?.id}`);
    const userId = (req as any).user?.id;
    return this.bookingService.create(userId, dto);
  }

  //  LISTAR RESERVAS POR USUARIO
  
  @Get()
  async findForUser(@Req() req: Request) {
    const logger = new Logger(BookingController.name);
    logger.log(`HTTP GET /booking | user=${(req as any)?.user?.id}`);
    const userId = (req as any).user?.id;
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

  // ELIMINAR RESERVA
  
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.bookingService.remove(id, userId);
  }
}
