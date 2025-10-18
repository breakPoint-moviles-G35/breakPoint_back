
import { Controller, Get, Query, ParseFloatPipe, Param } from '@nestjs/common';
import { SpaceService } from './space.service'; 
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('space')
// @UseGuards(JwtAuthGuard)
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

    @Get('nearest')
    async findNearestAvailableByLocation(
        @Query('latitude', ParseFloatPipe) latitude: number,
        @Query('longitude', ParseFloatPipe) longitude: number,
    ) {
        return this.spaceService.findNearestAvailableByLocation(latitude, longitude);
    }

    @Get('recommendations/:userId')
    async findSpacesByUserHistory(@Param('userId') userId: string) {
        return this.spaceService.findSpacesByUserHistory(userId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.spaceService.findOne(id);
}
}
