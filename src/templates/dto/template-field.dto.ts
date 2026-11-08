import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export enum TemplateFieldType {
  ShortText = 'short-text',
  LongText = 'long-text',
  Number = 'number',
  Dropdown = 'dropdown',
  YesNo = 'yes-no',
  DateTime = 'date-time',
  Photo = 'photo',
  Barcode = 'barcode',
  Location = 'location',
}

export class TemplateFieldDto {
  @IsString()
  @Matches(/\S/, {
    message: 'Field ID must not be blank.',
  })
  @MaxLength(100)
  id!: string;

  @IsEnum(TemplateFieldType)
  type!: TemplateFieldType;

  @IsString()
  @MaxLength(200)
  label!: string;

  @IsBoolean()
  required!: boolean;

  @ValidateIf((_object: unknown, value: unknown) =>
    value !== undefined,
  )
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  options?: string[];

  @IsOptional()
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
  })
  min?: number | null;

  @IsOptional()
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
  })
  max?: number | null;
}