import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import type { Notify, Operator, Severity } from '../types.js';

export class CreateRuleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  siteId?: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsString()
  @IsNotEmpty()
  fieldKey!: string;

  @IsIn(['GT', 'GTE', 'LT', 'LTE', 'EQ', 'NEQ', 'BETWEEN'])
  operator!: Operator;

  @IsNumber()
  @IsOptional()
  thresholdValue?: number;

  @IsNumber()
  @IsOptional()
  thresholdMax?: number;

  @IsIn(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity!: Severity;

  @IsIn(['SUPERVISOR', 'SUPERVISOR_MANAGER'])
  @IsOptional()
  notify?: Notify;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  cooldownMinutes?: number;
}

export class UpdateRuleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  siteId?: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsString()
  @IsOptional()
  fieldKey?: string;

  @IsIn(['GT', 'GTE', 'LT', 'LTE', 'EQ', 'NEQ', 'BETWEEN'])
  @IsOptional()
  operator?: Operator;

  @IsNumber()
  @IsOptional()
  thresholdValue?: number;

  @IsNumber()
  @IsOptional()
  thresholdMax?: number;

  @IsIn(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  @IsOptional()
  severity?: Severity;

  @IsIn(['SUPERVISOR', 'SUPERVISOR_MANAGER'])
  @IsOptional()
  notify?: Notify;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  cooldownMinutes?: number;
}

export class SetRuleEnabledDto {
  @IsBoolean()
  enabled!: boolean;
}

export class DeleteRuleDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class ListRulesDto {
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

  @IsString()
  @IsOptional()
  siteId?: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
