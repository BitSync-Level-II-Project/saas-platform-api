import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AssignTaskDto } from './dto/assign-task.dto.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { ListTasksDto } from './dto/list-tasks.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TasksService } from './tasks.service.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // 1. Create a task: POST /api/v1/tasks
  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  // 2. Search, filter and list tasks: GET /api/v1/tasks
  @Get()
  findAll(@Query() query: ListTasksDto) {
    return this.tasksService.findAll(query);
  }

  // 3. Get task details: GET /api/v1/tasks/:id
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.tasksService.findOne(id);
  }

  // 4. Edit a task or change its status: PATCH /api/v1/tasks/:id
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, dto);
  }

  // 5. Assign a worker or stationed phone: PUT /api/v1/tasks/:id/assignment
  @Put(':id/assignment')
  assign(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AssignTaskDto,
  ) {
    return this.tasksService.assign(id, dto);
  }

  // 6. Unassign: DELETE /api/v1/tasks/:id/assignment
  @Delete(':id/assignment')
  unassign(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.tasksService.unassign(id);
  }

  // 7. Archive a task (soft delete): DELETE /api/v1/tasks/:id
  @Delete(':id')
  archive(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.tasksService.archive(id);
  }
}