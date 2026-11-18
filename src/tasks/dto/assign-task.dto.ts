import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { AssigneeType } from '../../generated/prisma/enums.js';

export class AssignTaskDto {
  // Accepts WORKER, Worker, "Stationed phone", STATIONED_PHONE
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase().replace(/\s+/g, '_') : value,
  )
  @IsEnum(AssigneeType)
  assigneeType!: AssigneeType;

  // Worker user ID, or the stationed phone's device ID
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  assigneeId!: string;
}