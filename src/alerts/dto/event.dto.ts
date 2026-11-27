import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import type { EventSource } from '../types.js';

export class IngestEventDto {
  @IsString()
  @IsNotEmpty()
  clientEventId!: string;

  @IsIn(['FIELD_SUBMISSION', 'STATIONED_TELEMETRY', 'HEARTBEAT'])
  @IsOptional()
  sourceType: EventSource = 'STATIONED_TELEMETRY';

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  siteId?: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsObject()
  @IsNotEmpty()
  payload!: Record<string, unknown>;

  @IsDateString()
  @IsOptional()
  occurredAt?: string;
}

export interface IngestResultDto {
  id: string;
  duplicate: boolean;
  alertsCreated: string[];
  failed?: boolean;
}
