import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { User } from 'src/users/user.entity';
import { GetEstimateDto } from './dtos/getEstimate-report.dto';
import { EstimateResult } from 'src/types/report-estimate.type';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private readonly reportRepo: Repository<Report>,
  ) {}

  async create(reportDto: CreateReportDto, user: User) {
    const report = this.reportRepo.create(reportDto);
    // typeorm will extract id from user and store it in report
    report.user = user;
    return await this.reportRepo.save(report);
  }

  async changeApproval(id: number, approved: boolean) {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!report) {
      throw new NotFoundException('Report not found!');
    }
    report.approved = approved;
    return await this.reportRepo.save(report);
  }

  async createEstimate({
    make,
    model,
    year,
    lat,
    lon,
    mileage,
  }: GetEstimateDto): Promise<EstimateResult | undefined> {
    const qb = this.reportRepo
      .createQueryBuilder('report')
      .select('report.price', 'price')
      .where('report.make = :make', { make })
      .andWhere('report.model = :model', { model })
      .andWhere('report.lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('report.lon - :lon BETWEEN -5 AND 5', { lon })
      .andWhere('report.year - :year BETWEEN -3 AND 3', { year })
      .andWhere('report.approved IS TRUE')
      .orderBy('ABS(report.mileage - :mileage)', 'DESC')
      .setParameters({ mileage })
      .limit(3);

    const result = this.reportRepo.manager
      .createQueryBuilder()
      .select('AVG(sub.price)', 'price')
      .from(`(${qb.getQuery()})`, 'sub')
      .setParameters(qb.getParameters())
      .getRawOne<EstimateResult>();

    return result ?? { price: null };
  }
}
