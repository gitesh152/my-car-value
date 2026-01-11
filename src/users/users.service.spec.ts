import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from './user-role.enum';

describe('UsersService', () => {
  let service: UsersService;
  let dummyPassword: string;

  // explicitly typed mocks
  let createMock: jest.Mock<User, [{ email: string; password: string }]>;
  let saveMock: jest.Mock<Promise<User>, [User]>;
  let findByMock: jest.Mock<Promise<User[]>, [{ email: string }]>;
  let findOneByMock: jest.Mock<Promise<User | null>, [{ id: number }]>;
  let removeMock: jest.Mock<Promise<User>, [User]>;

  beforeEach(async () => {
    dummyPassword = process.env.DUMMY_PASSWORD!;
    createMock = jest.fn<User, [{ email: string; password: string }]>();
    saveMock = jest.fn<Promise<User>, [User]>();
    findByMock = jest.fn<Promise<User[]>, [{ email: string }]>();
    findOneByMock = jest.fn<Promise<User | null>, [{ id: number }]>();
    removeMock = jest.fn<Promise<User>, [User]>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: createMock,
            save: saveMock,
            findBy: findByMock,
            findOneBy: findOneByMock,
            remove: removeMock,
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /* -------------------------------- CREATE -------------------------------- */

  it('creates and saves a user', async () => {
    const user = { email: 'x', password: dummyPassword } as User;

    createMock.mockReturnValue(user);
    saveMock.mockResolvedValue(user);

    const result = await service.create('x@test.com', dummyPassword);

    expect(createMock).toHaveBeenCalledWith({
      email: 'x@test.com',
      password: dummyPassword,
    });
    expect(saveMock).toHaveBeenCalledWith(user);
    expect(result).toEqual(user);
  });

  /* -------------------------------- FIND -------------------------------- */

  it('finds users by email', async () => {
    const users = [{ id: 1, email: 'x', password: dummyPassword }] as User[];

    findByMock.mockResolvedValue(users);

    const result = await service.find('x@test.com');

    expect(findByMock).toHaveBeenCalledWith({ email: 'x@test.com' });
    expect(result).toEqual(users);
  });

  /* -------------------------------- FIND ONE -------------------------------- */

  it('returns a user if found', async () => {
    const user = { id: 1, email: 'x' } as User;

    findOneByMock.mockResolvedValue(user);

    const result = await service.findOne(1);

    expect(result).toEqual(user);
  });

  /* -------------------------------- UPDATE -------------------------------- */

  it('updates a user', async () => {
    const user = { id: 1, email: 'old@test.com' } as User;

    findOneByMock.mockResolvedValue(user);
    saveMock.mockResolvedValue({ ...user, email: 'new@test.com' });

    const result = await service.update(1, { email: 'new@test.com' });

    expect(result.email).toBe('new@test.com');
  });

  it('throws if user to update is not found', async () => {
    findOneByMock.mockResolvedValue(null);

    await expect(service.update(1, { email: 'x@test.com' })).rejects.toThrow(
      NotFoundException,
    );
  });

  /* -------------------------------- UPDATE ROLE -------------------------------- */

  it('updates user role', async () => {
    const user = {
      id: 1,
      email: 'a@test.com',
      role: UserRole.USER,
    } as User;

    findOneByMock.mockResolvedValue(user);
    saveMock.mockResolvedValue({ ...user, role: UserRole.ADMIN });

    const result = await service.updateRole(1, UserRole.ADMIN);

    expect(result.role).toBe(UserRole.ADMIN);
  });

  it('returns user if role unchanged', async () => {
    const user = {
      id: 1,
      role: UserRole.ADMIN,
    } as User;

    findOneByMock.mockResolvedValue(user);

    const result = await service.updateRole(1, UserRole.ADMIN);

    expect(saveMock).not.toHaveBeenCalled();
    expect(result).toEqual(user);
  });

  it('throws if SUPER_ADMIN is assigned manually', async () => {
    const user = {
      id: 1,
      role: UserRole.USER,
    } as User;

    findOneByMock.mockResolvedValue(user);

    await expect(service.updateRole(1, UserRole.SUPER_ADMIN)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows SUPER_ADMIN self-promotion with system flag', async () => {
    const user = {
      id: 1,
      email: 'admin@test.com',
      role: UserRole.USER,
    } as User;

    findOneByMock.mockResolvedValue(user);
    saveMock.mockResolvedValue({ ...user, role: UserRole.SUPER_ADMIN });

    const result = await service.updateRole(1, UserRole.SUPER_ADMIN, {
      actorEmail: 'admin@test.com',
      allowSystemPromotion: true,
    });

    expect(result.role).toBe(UserRole.SUPER_ADMIN);
  });

  /* -------------------------------- REMOVE -------------------------------- */

  it('removes a user', async () => {
    const user = { id: 1 } as User;

    findOneByMock.mockResolvedValue(user);
    removeMock.mockResolvedValue(user);

    const result = await service.remove(1);

    expect(removeMock).toHaveBeenCalledWith(user);
    expect(result).toEqual(user);
  });

  it('throws if user to remove does not exist', async () => {
    findOneByMock.mockResolvedValue(null);

    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });
});
