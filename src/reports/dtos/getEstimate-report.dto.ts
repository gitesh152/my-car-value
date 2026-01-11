import { Transform } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetEstimateDto {
  @IsString()
  make: string;

  @IsString()
  model: string;

  @Transform(({ value }: { value: string | number }) =>
    Number.parseInt(value as string),
  )
  @IsNumber()
  @Min(1930)
  @Max(2050)
  year: number;

  @Transform(({ value }: { value: string | number }) =>
    Number.parseInt(value as string),
  )
  @IsLatitude()
  lat: number;

  @Transform(({ value }: { value: string | number }) =>
    Number.parseInt(value as string),
  )
  @IsLongitude()
  lon: number;

  @Transform(({ value }: { value: string | number }) =>
    Number.parseInt(value as string),
  )
  @IsNumber()
  @Min(0)
  @Max(1000000)
  mileage: number;
}
