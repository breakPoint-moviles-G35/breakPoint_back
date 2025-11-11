import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseFloatPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SpaceService } from './space.service';
import { CreateSpaceDto } from './dto/createSpace.dto';
import { UpdateSpaceDto } from './dto/updateSpace.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/entities/user/user.entity';
import type { Request } from 'express';

@Controller('space')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  /**
   * 🔹 Obtener todos los espacios
   */
  @Get()
  async findAll() {
    return this.spaceService.findAll();
  }

  /**
   * 🔹 Crear un nuevo espacio
   */
  @Post()
  async createSpace(@Body() createSpaceDto: CreateSpaceDto) {
    return this.spaceService.create(createSpaceDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOST, UserRole.ADMIN)
  async updateSpace(
    @Param('id') id: string,
    @Body() updateSpaceDto: UpdateSpaceDto,
    @Req() req: Request,
  ) {
    const user = (req as any)?.user;
    return this.spaceService.update(id, updateSpaceDto, user);
  }

  /**
   * 🔹 Obtener todos los espacios ordenados por precio
   */
  @Get('sorted')
  async findAllSortedByPrice() {
    return this.spaceService.findAllSortedByPrice();
  }

  /**
   * 🔹 Buscar espacios disponibles entre fechas
   */
  @Get('available')
  async findSpacesByAvailability(
    @Query('start') start: Date,
    @Query('end') end: Date,
  ) {
    return this.spaceService.findSpacesByAvailability(start, end);
  }

  /**
   * 🔹 Recomendaciones personalizadas según historial del usuario
   */
  @Get('recommendations/:userId')
  async findSpacesByUserHistory(@Param('userId') userId: string) {
    return this.spaceService.findSpacesByUserHistory(userId);
  }

  /**
   * 🔹 Buscar el espacio más cercano según coordenadas
   */
  @Get('nearest')
  async findNearestAvailableByLocation(
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
  ) {
    return this.spaceService.findNearestAvailableByLocation(latitude, longitude);
  }

  /**
   * 🔹 Buscar una lista de espacios cercanos según coordenadas
   */
  @Get('nearest/list')
  async findNearestAvailableSpaces(
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return this.spaceService.findNearestAvailableSpaces(latitude, longitude, limit);
  }

  /**
   * 🔹 Buscar espacios creados por un Host específico (arrendador)
   */
  @Get('by-host/:hostProfileId')
  async findByHost(@Param('hostProfileId') hostProfileId: string) {
    return this.spaceService.findByHost(hostProfileId);
  }

  /**
   * 🔹 Buscar un espacio específico por su ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.spaceService.findOne(id);
  }
}
