import { Body, Controller, Post } from '@nestjs/common';
import { SqlService } from './sql.service';
import { TaskService } from './task.service';
import { ExecuteTaskDto } from './dto/execute-task.dto';

@Controller('sql')
export class SqlController {
  constructor(
    private readonly sqlService: SqlService,
    private readonly taskService: TaskService,
  ) {}

  @Post('/execute-task')
  executeSql(@Body() { subTaskId, query }: ExecuteTaskDto) {
    return this.taskService.executeTask(subTaskId, query);
  }
}
