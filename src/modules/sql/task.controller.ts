import { Controller, Get, Param } from '@nestjs/common';
import { SqlService } from './sql.service';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  constructor(
    private readonly sqlService: SqlService,
    private readonly taskService: TaskService,
  ) {}

  @Get('/all')
  getAllTasks() {
    return this.taskService.getAllTasks();
  }

  @Get('/:subTaskId')
  getSubTaskById(@Param('subTaskId') subTaskId: number) {
    return this.taskService.getSubTaskById(subTaskId);
  }
}
