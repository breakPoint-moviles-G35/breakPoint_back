import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventorySlotEntity } from './entities/inventory-slot.entity/inventory-slot.entity';

@Module({
    imports: [TypeOrmModule.forFeature([InventorySlotEntity])],
})
export class InventorySlotModule {}
