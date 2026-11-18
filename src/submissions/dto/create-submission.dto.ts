import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDefined,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class SubmissionAnswerDto {
  @IsString()
  @Matches(/\S/, {
    message: 'Field ID must not be blank.',
  })
  @MaxLength(100)
  fieldId!: string;

  @IsDefined()
  value!: unknown;
}

export class CreateSubmissionDto {
  @IsString()
  @Matches(/\S/, {
    message: 'Task ID must not be blank.',
  })
  @MaxLength(100)
  taskId!: string;

  @IsUUID('4')
  templateVersionId!: string;

  @IsUUID('4')
  clientAttemptId!: string;

  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => SubmissionAnswerDto)
  answers!: SubmissionAnswerDto[];
}
