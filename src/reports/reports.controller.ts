import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dtos/create-report.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { Serializer } from '../interceptors/serialize.interceptor';
import { ReportDto } from './dtos/report.dto';
import { GetEstimateDto } from './dtos/getEstimate-report.dto';
import { ApproveReportDto } from './dtos/approve-report.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Serializer(ReportDto)
  async createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
    return await this.reportsService.create(body, user);
  }

  @Patch('/:id')
  @Roles(UserRole.ADMIN)
  @Serializer(ReportDto)
  approveReport(@Param('id') id: string, @Body() body: ApproveReportDto) {
    return this.reportsService.changeApproval(
      Number.parseInt(id),
      body.approved,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.USER)
  getEstimate(@Query() query: GetEstimateDto) {
    return this.reportsService.createEstimate(query);
  }
}
