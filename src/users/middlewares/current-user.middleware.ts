import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { SessionData } from 'src/types/session-data.type';
import { UsersService } from '../users.service';
import { User } from '../user.entity';

declare module 'express-serve-static-core' {
  interface Request {
    currentUser?: User | null;
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}
  async use(req: Request, _res: Response, next: NextFunction) {
    const session = req.session as SessionData;
    if (session?.userId) {
      req.currentUser = await this.usersService.findOne(session.userId);
    } else {
      req.currentUser = null;
    }
    next();
  }
}
