import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { UserRole } from './user-role.enum';
import { ConfigService } from '@nestjs/config';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');
    //randomBytes is random 0 or 1, -> generate buffer in 0 or 1 but 8 length
    //toString('hex') - convert buffer to string -> 8 bytes × 2 = 16 hex characters as Each byte becomes 2 hex characters
    //a39f2bc17de4098a

    /** Typescript does not know what will scrypt return so store as Buffer */
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    return salt + '.' + hash.toString('hex');
  }

  async signup(email: string, password: string) {
    const existing = await this.usersService.find(email);
    if (existing.length) {
      throw new BadRequestException('Email already registered!');
    }
    const hashedPassword: string = await this.hashPassword(password);
    return await this.usersService.create(email, hashedPassword);
  }

  async signin(email: string, password: string) {
    const [exists] = await this.usersService.find(email);

    if (!exists) {
      throw new NotFoundException('Email not registered!');
    }

    const [salt, storedHash] = exists.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Invalid credentials!');
    }

    // 🔐 SUPER_ADMIN auto-promotion
    const superAdminEmail = this.configService.get<string>(
      'application.adminEmail',
    );

    if (
      superAdminEmail === exists.email &&
      exists.role !== UserRole.SUPER_ADMIN
    ) {
      return await this.usersService.updateRole(
        exists.id,
        UserRole.SUPER_ADMIN,
        {
          actorEmail: exists.email,
          allowSystemPromotion: true,
        },
      );
    }

    return exists;
  }

  async updatePassword(userId: number, newPassword: string) {
    const hashedPassword: string = await this.hashPassword(newPassword);
    return await this.usersService.update(userId, { password: hashedPassword });
  }
}
