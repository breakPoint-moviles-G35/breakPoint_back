/* eslint-disable prettier/prettier */
import { Controller, Get, Query } from '@nestjs/common';
import { SpaceService } from './space.service';

@Controller('space')
export class SpaceController {
    constructor(private readonly spaceService: SpaceService) {

    }
    @Get()
    async findAll() {
        return this.spaceService.findAll();
    }
    @Get('sorted')
    async findAllSortedByPrice() {
        return this.spaceService.findAllSortedByPrice();
    }

    @Get('available')
    async findSpacesByAvailability(@Query('start') start: Date, @Query('end') end: Date) {
        return this.spaceService.findSpacesByAvailability(start, end);
    }
}
