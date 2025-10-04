/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { HostProfileService } from './host-profile.service';
import { HostProfile } from './entities/host-profile.entity/host-profile.entity';

@Controller('host-profiles')
export class HostProfileController {
    constructor(private readonly hostProfileService: HostProfileService) {}

    @Get()
    async findAll() {
        return this.hostProfileService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.hostProfileService.findOne(id);
    }

    @Get('user/:userId')
    async findByUserId(@Param('userId') userId: string) {
        return this.hostProfileService.findByUserId(userId);
    }

    @Post()
    async create(@Body() hostProfileData: Partial<HostProfile>) {
        return this.hostProfileService.create(hostProfileData);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() hostProfileData: Partial<HostProfile>) {
        return this.hostProfileService.update(id, hostProfileData);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.hostProfileService.remove(id);
        return { message: 'Host profile deleted successfully' };
    }
}
