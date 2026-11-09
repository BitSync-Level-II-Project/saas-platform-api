import { IsInt, Min } from 'class-validator';

export class PublishTemplateDto {
  @IsInt()
  @Min(1)
  expectedRevision!: number;
}