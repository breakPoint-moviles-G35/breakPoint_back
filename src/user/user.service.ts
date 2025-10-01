import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user/user.entity';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    // Como password tiene select:false, lo incluimos manualmente
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.email = :email', { email })
      .getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({where:{id}});
  }

  async create(data: Partial<User>): Promise<User> {
    const email = data.email?.trim().toLowerCase();
    if (!email || !/@uniandes\.edu\.co$/i.test(email)) {
        throw new BadRequestException('El email debe ser con @uniandes.edu.co');
    }
    data.email = email;

    const user = this.repo.create(data);
    return this.repo.save(user);
  }
}
