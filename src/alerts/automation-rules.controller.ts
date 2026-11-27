import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AutomationRulesService } from './automation-rules.service.js';
import { TenantContextService } from './tenant-context.service.js';
import {
  CreateRuleDto,
  DeleteRuleDto,
  ListRulesDto,
  SetRuleEnabledDto,
  UpdateRuleDto,
} from './dto/rule.dto.js';

@Controller('automation-rules')
export class AutomationRulesController {
  constructor(
    private readonly rulesService: AutomationRulesService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateRuleDto) {
    const context = this.tenantContextService.getContext(req);
    return this.rulesService.create(context, dto);
  }

  @Get()
  findAll(@Req() req: Request, @Query() query: ListRulesDto) {
    const context = this.tenantContextService.getContext(req);
    return this.rulesService.findAll(context, query);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const context = this.tenantContextService.getContext(req);
    return this.rulesService.findOne(context, id);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateRuleDto,
  ) {
    const context = this.tenantContextService.getContext(req);
    return this.rulesService.update(context, id, dto);
  }

  @Patch(':id/enabled')
  setEnabled(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: SetRuleEnabledDto,
  ) {
    const context = this.tenantContextService.getContext(req);
    return this.rulesService.setEnabled(context, id, dto.enabled);
  }

  @Delete(':id')
  remove(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: DeleteRuleDto,
  ) {
    const context = this.tenantContextService.getContext(req);
    return this.rulesService.remove(context, id, dto?.reason);
  }
}
