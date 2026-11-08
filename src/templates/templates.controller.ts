import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { ListTemplatesDto } from './dto/list-templates.dto.js';
import { TemplatesService } from './templates.service.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';
@Controller('templates')
export class TemplatesController {
  constructor(
    private readonly templatesService: TemplatesService,
  ) {}

  @Post()
  createDraft(@Body() dto: CreateTemplateDto) {
    return this.templatesService.createDraft(dto);
  }

  @Get()
  findAll(@Query() query: ListTemplatesDto) {
    return this.templatesService.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ) {
    return this.templatesService.findOne(id);
  }

    @Patch(':id')
  updateDraft(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templatesService.updateDraft(id, dto);
  }
}