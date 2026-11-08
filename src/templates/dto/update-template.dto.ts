import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDefined,
  IsInt,
  IsObject,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateTemplateDto } from './create-template.dto.js';
import { TemplateFieldDto } from './template-field.dto.js';

export class UpdateTemplateDto {
  @IsInt()
  @Min(1)
  expectedRevision!: number;

  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateTemplateDto)
  details!: CreateTemplateDto;

  @IsArray()
  @ArrayMaxSize(200)
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @Type(() => TemplateFieldDto)
  fields!: TemplateFieldDto[];
}