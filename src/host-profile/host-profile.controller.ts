import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Logger,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { HostProfileService } from './host-profile.service';
import { CreateHostProfileDto } from './dto/create-host-profile.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('host-profile')
export class HostProfileController {
  private readonly logger = new Logger(HostProfileController.name);

  constructor(private readonly hostProfileService: HostProfileService) {}

  /**
   * 🔹 Crear un nuevo perfil de host (generalmente no se usa directamente
   *     porque se crea automáticamente al registrar un usuario con rol Host)
   */
  @Post()
  async create(@Req() req: Request, @Body() createHostProfileDto: CreateHostProfileDto) {
    this.logger.log(`HTTP POST /host-profile | user=${(req as any)?.user?.id}`);
    return this.hostProfileService.create(createHostProfileDto);
  }

  /**
   * 🔹 Obtener todos los perfiles de host
   */
  @Get()
  async findAll(@Req() req: Request) {
    this.logger.log(`HTTP GET /host-profile | user=${(req as any)?.user?.id}`);
    return this.hostProfileService.findAll();
  }

  /**
   * 🔹 Obtener el perfil del host asociado al usuario autenticado (requiere JWT)
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-profile')
  async findMyProfile(@Req() req: Request) {
    this.logger.log(`HTTP GET /host-profile/my-profile | user=${(req as any)?.user?.id}`);
    const userId = (req as any).user?.id;

    if (!userId) {
      this.logger.warn('No se encontró user en req, token inválido o guard ausente');
      throw new NotFoundException('No se pudo identificar el usuario');
    }

    const hostProfile = await this.hostProfileService.findByUserId(userId);
    if (!hostProfile) {
      this.logger.warn(`HostProfile no encontrado para userId=${userId}`);
      throw new NotFoundException('HostProfile no encontrado para este usuario');
    }

    return hostProfile;
  }

  /**
   * 🔹 Obtener el perfil de host a partir del userId (para usar en Postman o Flutter)
   */
  @Get('by-user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    this.logger.log(`HTTP GET /host-profile/by-user/${userId}`);
    const hostProfile = await this.hostProfileService.findByUserId(userId);
    if (!hostProfile) throw new NotFoundException('HostProfile no encontrado para este usuario');
    return hostProfile;
  }

  /**
   * 🔹 Obtener un perfil de host específico por su ID (UUID)
   */
  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    this.logger.log(`HTTP GET /host-profile/${id} | user=${(req as any)?.user?.id}`);
    return this.hostProfileService.findOne(id);
  }
}
