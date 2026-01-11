import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';

/**
 * Helper type for generic class constructors.
 *
 * Kept here for reference only.
 *
 * Simplified version of being used:
 *
 * type ClassConstructor<T = unknown> = {
 *   new (...args: any[]): T;
 * };
 */

type ClassConstructor<T = unknown> = new (...args: any[]) => T;

export function Serializer(dto: ClassConstructor) {
  return UseInterceptors(new SerlizerInterceptor(dto));
}

// Implement means SerlizerInterceptor satisfy all conditions of NestInterceptor
@Injectable()
class SerlizerInterceptor implements NestInterceptor {
  constructor(private readonly dto: ClassConstructor) {}
  intercept(
    _context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true /** This prop ensure that plainToInstance keep only dto props that is defined with @Exposed  */,
        });
      }),
    );
  }
}
