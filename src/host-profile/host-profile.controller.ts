import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Logger,
} from '@nestjs/common';
import { HostProfileService } from './host-profile.service';
import { CreateHostProfileDto } from './dto/create-host-profile.dto';
import type { Request } from 'express';

@Controller('host-profile')
export class HostProfileController {
  private readonly logger = new Logger(HostProfileController.name);

  constructor(private readonly hostProfileService: HostProfileService) {}

  @Post()
  async create(@Req() req: Request, @Body() createHostProfileDto: CreateHostProfileDto) {
    this.logger.log(`HTTP POST /host-profile | user=${(req as any)?.user?.id}`);
    return this.hostProfileService.create(createHostProfileDto);
  }

  @Get()
  async findAll(@Req() req: Request) {
    this.logger.log(`HTTP GET /host-profile | user=${(req as any)?.user?.id}`);
    return this.hostProfileService.findAll();
  }

  @Get('my-profile')
  async findMyProfile(@Req() req: Request) {
    this.logger.log(`HTTP GET /host-profile/my-profile | user=${(req as any)?.user?.id}`);
    const userId = (req as any).user?.id;
    return this.hostProfileService.findByUserId(userId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    this.logger.log(`HTTP GET /host-profile/${id} | user=${(req as any)?.user?.id}`);
    return this.hostProfileService.findOne(id);
  }
}
