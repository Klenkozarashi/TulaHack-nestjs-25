import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SqlService } from './sql.service';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task-dto';

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

  @Get('/:subTaskId')
  async getSubTaskById(@Param('subTaskId') subTaskId: number) {
    return this.taskService.getSubTaskById(subTaskId);
  }

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.createTask(createTaskDto);
  }
}
