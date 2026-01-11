import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator((_data: never, context) => {
  const request = context.switchToHttp().getRequest<Request>();
  return request.currentUser ?? null;
});
