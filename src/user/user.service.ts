import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user/user.entity';
import { HostProfile } from 'src/host-profile/entities/host-profile.entity/host-profile.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,

    @InjectRepository(HostProfile)
    private readonly hostRepo: Repository<HostProfile>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.email = :email', { email })
      .getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<User>): Promise<User> {
    const email = data.email?.trim().toLowerCase();
    if (!email || !/@uniandes\.edu\.co$/i.test(email)) {
      throw new BadRequestException('El email debe ser con @uniandes.edu.co');
    }

    const name = data.name;
    if (!name) {
      throw new BadRequestException('El nombre del usuario es obligatorio :)');
    }

    data.email = email;

    // Crear usuario
    const user = this.repo.create(data);
    const savedUser = await this.repo.save(user);

    // Si el rol es Host, crear automáticamente su HostProfile
    if (savedUser.role === UserRole.HOST) {
      const hostProfile = this.hostRepo.create({
        user: savedUser,
        verification_status: 'pending',
        payout_method: 'none',
      });
      await this.hostRepo.save(hostProfile);
      console.log(`HostProfile creado para el usuario ${savedUser.email}`);
    }

    return savedUser;
  }

  async updateUser(user:User): Promise<User | null> {
    
    return this.repo.save(user);
}
}