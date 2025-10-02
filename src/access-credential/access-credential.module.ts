import { Module } from '@nestjs/common';
import { AccessCredentialEntity } from './entities/access-credential.entity/access-credential.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([AccessCredentialEntity])],
})
export class AccessCredentialModule {}
