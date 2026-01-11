import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthService } from './auth.service';
import type { SessionData } from 'src/types/session-data.type';
import { UsersService } from './users.service';
import { Serializer } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';
import { UpdatePasswordDto } from './dtos/update-user.dto';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { UpdateUserRoleDto } from './dtos/update-user-roles.dto';

@Serializer(UserDto)
@Controller('auth')
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/register')
  async register(@Body() body: CreateUserDto, @Session() session: SessionData) {
    const user = await this.authService.signup(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/login')
  async login(@Body() body: CreateUserDto, @Session() session: SessionData) {
    const user = await this.authService.signin(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/logout')
  logout(@Session() session: SessionData) {
    session.userId = null;
  }

  @UseGuards(AuthGuard)
  @Get('/whoami')
  whoami(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(AuthGuard, SuperAdminGuard)
  @Get('/:id')
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(Number.parseInt(id));
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return user;
  }

  @UseGuards(AuthGuard, SuperAdminGuard)
  @Get()
  async findAllUsers(@Query('email') email: string) {
    return await this.usersService.find(email);
  }

  @UseGuards(AuthGuard)
  @Patch('/password')
  async updatePassword(
    @CurrentUser() user: User,
    @Body() body: UpdatePasswordDto,
  ) {
    return await this.authService.updatePassword(user.id, body.password);
  }

  @Patch('/:id/role')
  @UseGuards(AuthGuard, SuperAdminGuard)
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(+id, body.role);
  }

  @UseGuards(AuthGuard, SuperAdminGuard)
  @Delete('/:id')
  async removeUser(@Param('id') id: string) {
    return await this.usersService.remove(Number.parseInt(id));
  }
}
