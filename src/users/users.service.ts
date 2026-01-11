import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UserRole } from './user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async create(email: string, password: string) {
    const user = this.repo.create({ email, password });
    return this.repo.save(user);
  }

  async find(email: string) {
    return await this.repo.findBy({ email });
  }

  async findOne(id: number): Promise<User | null> {
    if (!id) {
      return null;
    }
    return await this.repo.findOneBy({ id });
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.repo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    Object.assign(user, attrs);
    return await this.repo.save(user);
  }

  async updateRole(
    targetUserId: number,
    newRole: UserRole,
    options?: {
      actorEmail?: string;
      allowSystemPromotion?: boolean;
    },
  ) {
    const user = await this.repo.findOneBy({ id: targetUserId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === newRole) {
      return user;
    }

    // SUPER_ADMIN is system-controlled
    if (newRole === UserRole.SUPER_ADMIN) {
      if (!options?.allowSystemPromotion) {
        throw new ForbiddenException(
          'SUPER_ADMIN role cannot be assigned manually',
        );
      }

      if (options.actorEmail !== user.email) {
        throw new ForbiddenException('SUPER_ADMIN can only self-promote');
      }
    }

    user.role = newRole;
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.repo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return await this.repo.remove(user);
  }
}
