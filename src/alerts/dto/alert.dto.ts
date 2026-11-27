import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { AlertStatus, Severity } from '../types.js';

export class ListAlertsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsIn(['NEW', 'ACKNOWLEDGED', 'RESOLVED', 'ESCALATED'])
  @IsOptional()
  status?: AlertStatus;

  @IsIn(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  @IsOptional()
  severity?: Severity;

  @IsString()
  @IsOptional()
  siteId?: string;
}

export class ActOnAlertDto {
  @IsString()
  @IsOptional()
  note?: string;
}
