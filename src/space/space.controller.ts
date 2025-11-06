import {
  Controller,
  Get,
  Query,
  ParseFloatPipe,
  DefaultValuePipe,
  ParseIntPipe,
  Param,
  Body,
  Post,
} from '@nestjs/common';
import { SpaceService } from './space.service';
import { CreateSpaceDto } from './dto/createSpace.dto';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('space')
// @UseGuards(JwtAuthGuard)
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
