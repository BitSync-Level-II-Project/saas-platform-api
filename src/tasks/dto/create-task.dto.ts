import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateTaskDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  warehouse!: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  location!: string;

  // The versionId returned when the template was published
  @IsUUID()
  templateVersionId!: string;

  // User ID of the Supervisor
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  supervisorId!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dueDate must be in YYYY-MM-DD format' })
  dueDate!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  instructions?: string;
}