import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SqlService } from './sql.service';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task-dto';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles-auth.decorator';

@Controller('task')
export class TaskController {
  constructor(
    private readonly sqlService: SqlService,
    private readonly taskService: TaskService,
  ) {}

  @Get('/all')
  async getAllTasks() {
    return this.taskService.getAllTasks();
  }

  @Get('/:taskId')
  async getTaskById(@Param('taskId') taskId: number) {
    return this.taskService.getTaskById(taskId);
  }

  @Get('/subTask/:subTaskId')
  async getSubTaskById(@Param('subTaskId') subTaskId: number) {
    return this.taskService.getSubTaskById(subTaskId);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.createTask(createTaskDto);
  }
}
