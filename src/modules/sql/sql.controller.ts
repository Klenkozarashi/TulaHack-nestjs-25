import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SqlService } from './sql.service';
import { TaskService } from './task.service';
import { ExecuteTaskDto } from './dto/execute-task.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('sql')
export class SqlController {
  constructor(
    private readonly sqlService: SqlService,
    private readonly taskService: TaskService,
  ) {}

  @Post('/execute-task')
  @UseGuards(AuthGuard)
  executeSql(
    @Body() { subTaskId, query }: ExecuteTaskDto,
    @Req() request: Request & { cookies: any },
  ) {
    const sessionToken = request.cookies['sessionToken'];
    return this.taskService.executeTask(subTaskId, query, sessionToken);
  }
}
