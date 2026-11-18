import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ListTasksDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(150)
  search?: string;

  // Accepts ALL, Assigned, "In progress", "In review", Complete (any case)
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    const v = value.trim().toUpperCase().replace(/\s+/g, '_');
    return v === 'ALL' || v === '' ? undefined : v;
  })
  @IsIn(['ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETE'])
  status?: 'ASSIGNED' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETE';
}