import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { User } from '../users/user.entity';
import { UserRole } from '../users/user-role.enum';
import { CreateReportDto } from './dtos/create-report.dto';
import { GetEstimateDto } from './dtos/getEstimate-report.dto';
import { Report } from './report.entity';

describe('ReportsController', () => {
  let controller: ReportsController;

  let createMock: jest.Mock<Promise<Report>, [CreateReportDto, User]>;

  let changeApprovalMock: jest.Mock<Promise<Report>, [number, boolean]>;

  let createEstimateMock: jest.Mock<
    Promise<{ price: number | null }>,
    [GetEstimateDto]
  >;

  beforeEach(async () => {
    createMock = jest.fn<Promise<Report>, [CreateReportDto, User]>();

    changeApprovalMock = jest.fn<Promise<Report>, [number, boolean]>();

    createEstimateMock = jest.fn<
      Promise<{ price: number | null }>,
      [GetEstimateDto]
    >();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: {
            create: createMock,
            changeApproval: changeApprovalMock,
            createEstimate: createEstimateMock,
          },
        },
      ],
    }).compile();

    controller = module.get(ReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates a report', async () => {
    const dto: CreateReportDto = {
      make: 'ford',
      model: 'mustang',
      year: 2020,
      mileage: 1000,
      lat: 10,
      lon: 10,
      price: 10000,
    };

    const user: User = {
      id: 1,
      role: UserRole.USER,
    } as User;

    const report: Report = {
      id: 1,
      ...dto,
      approved: false,
      user,
    } as Report;

    createMock.mockResolvedValue(report);

    const result = await controller.createReport(dto, user);

    expect(createMock).toHaveBeenCalledWith(dto, user);
    expect(result).toEqual(report);
  });

  it('approves a report', async () => {
    const report: Report = {
      id: 1,
      approved: true,
    } as Report;

    changeApprovalMock.mockResolvedValue(report);

    const result = await controller.approveReport('1', { approved: true });

    expect(changeApprovalMock).toHaveBeenCalledWith(1, true);
    expect(result).toEqual(report);
  });

  it('returns an estimate', async () => {
    const query: GetEstimateDto = {
      make: 'ford',
      model: 'mustang',
      year: 2020,
      lat: 10,
      lon: 10,
      mileage: 1000,
    };

    createEstimateMock.mockResolvedValue({ price: 12000 });

    const result = await controller.getEstimate(query);

    expect(createEstimateMock).toHaveBeenCalledWith(query);
    expect(result).toEqual({ price: 12000 });
  });
});
