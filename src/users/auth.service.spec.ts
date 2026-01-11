import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { ConfigService } from '@nestjs/config';
import { UserRole } from './user-role.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let users: User[];
  let dummyPassword: string;
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  const fakeConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    users = [];
    dummyPassword = process.env.DUMMY_PASSWORD!;
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: users.length + 1,
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
      update: (id: number, attrs: Partial<User>) => {
        const user = users.find((user) => user.id === id);
        if (!user) {
          return Promise.reject(new NotFoundException('User not found!'));
        }
        Object.assign(user, attrs);
        return Promise.resolve(user);
      },
      updateRole: (id: number, newRole: UserRole) => {
        const user = users.find((user) => user.id === id);
        if (!user) {
          return Promise.reject(new NotFoundException('User not found!'));
        }
        user.role = newRole;
        return Promise.resolve(user);
      },
    };

    fakeConfigService.get.mockImplementation((key: string) => {
      if (key === 'application.adminEmail') {
        return 'admin@test.com';
      }
    });

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },

        // 👇 Mock ConfigService
        {
          provide: ConfigService,
          useValue: fakeConfigService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', () => {
    expect(service).toBeDefined();
  });

  it('create a new user with a salted and hashed password', async () => {
    const user = await service.signup('dummyemail@email.com', dummyPassword);
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throw an error if user signs up with email that is in use', async () => {
    await service.signup('xsxsxs@email.com', dummyPassword);

    await expect(
      service.signup('xsxsxs@email.com', `${dummyPassword + 'cdcdcd'}`),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(
      service.signin('xsxsxs@email.com', dummyPassword),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws if invalid password is provided during login', async () => {
    await service.signup('user@test.com', dummyPassword);
    const wrongPassword = dummyPassword + '_wrong';
    await expect(
      service.signin('user@test.com', wrongPassword),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns a user if correct password is provided during login', async () => {
    await service.signup('user@test.com', dummyPassword);

    const user = await service.signin('user@test.com', dummyPassword);

    expect(user).toBeDefined();
  });

  it('auto-promotes SUPER_ADMIN on signin if email matches config', async () => {
    await service.signup('admin@test.com', dummyPassword);

    const result = await service.signin('admin@test.com', dummyPassword);

    expect(result.role).toEqual(UserRole.SUPER_ADMIN);
  });

  it('does not promote normal users to SUPER_ADMIN', async () => {
    await service.signup('normaluser@test.com', dummyPassword);

    const result = await service.signin('normaluser@test.com', dummyPassword);
    expect(result.role).not.toBe(UserRole.SUPER_ADMIN);
  });

  it('hashes and updates the password', async () => {
    const user = await service.signup('test@test.com', dummyPassword);

    const updatedUser = await service.updatePassword(
      user.id,
      `${dummyPassword + '000'}`,
    );

    expect(updatedUser.password).not.toEqual(dummyPassword);
    expect(updatedUser.password).toContain('.');
  });
});
