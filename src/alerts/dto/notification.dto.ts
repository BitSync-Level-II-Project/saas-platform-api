import { IsBoolean, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import type { Severity } from '../types.js';

export class ListNotificationsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number = 20;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}

export class UpdatePreferencesDto {
  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  inAppEnabled?: boolean;

  @IsIn(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  @IsOptional()
  minSeverity?: Severity;
}
