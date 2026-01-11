import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let dummyPassword: string;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;
  beforeEach(async () => {
    dummyPassword = process.env.DUMMY_PASSWORD!;
    fakeUsersService = {
      find: (email: string) => {
        return Promise.resolve([
          { id: 1, email, password: dummyPassword } as User,
        ]);
      },
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'x',
          password: dummyPassword,
        } as User);
      },
      update: (id: number, attrs) => Promise.resolve({ id, ...attrs } as User),
      remove: (id: number) =>
        Promise.resolve({ id, email: 'x', password: dummyPassword } as User),
    };
    fakeAuthService = {
      signup: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
      signin: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    })
      .overrideGuard(SuperAdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const email = 'a@b.com';
    const users = await controller.findAllUsers(email);
    expect(users.length).toBeGreaterThanOrEqual(1);
    expect(users[0].email).toEqual(email);
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('removeUser removes and returns the removed user with the given id', async () => {
    const user = await controller.removeUser('1');
    expect(user.id).toEqual(1);
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => Promise.resolve(null); // We can pass id: nummber, but no need

    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('signup updates session object and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.register(
      {
        email: 'x',
        password: dummyPassword,
      },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });

  it('signin updates session object and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.login(
      {
        email: 'x',
        password: dummyPassword,
      },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });

  it('signout remove userId from session object (signout user)', () => {
    const session = { userId: 1 };
    controller.logout(session);
    expect(session.userId).toEqual(null);
  });
});
