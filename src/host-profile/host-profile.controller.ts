/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Logger, Req } from '@nestjs/common';
import { HostProfileService } from './host-profile.service';


@Controller('host-profiles')
export class HostProfileController {
  constructor(private readonly hostProfileService: HostProfileService) {}

  @Get()
  async findAll(@Req() req: any) {
    const logger = new Logger(HostProfileController.name);
    logger.log(`HTTP GET /host-profiles | user=${req?.user?.id || 'anonymous'}`);
    return this.hostProfileService.findAll();
  }

}
