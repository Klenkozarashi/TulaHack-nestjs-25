import { BadRequestException, Injectable } from '@nestjs/common';
import { SqlService } from './sql.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task-dto';
import { SuccessDto } from 'src/shared/globalDtos';

@Injectable()
export class TaskService {
  constructor(
    private readonly sqlService: SqlService,
    private prisma: PrismaService,
  ) {}

  async getAllTasks() {
    const tasks = await this.prisma.task.findMany({
      include: { subTask: true },
    });

    return tasks.map((task) => {
      const parsed = this.parseSqlSchema(task.sqlSchema);

      return {
        ...task,
        table: parsed?.table,
        columns: parsed?.columns,
      };
    });
  }

  private parseSqlSchema(
    sqlSchema: string,
  ): { table: string; columns: string[] } | null {
    const createTableMatch = sqlSchema.match(
      /CREATE TABLE (\w+)\s*\(([^)]+)\)/i,
    );

    if (!createTableMatch) {
      return null;
    }

    const table = createTableMatch[1];

    const columnsRaw = createTableMatch[2]
      .split(',')
      .map((col) => col.trim().split(' ')[0]); // Берём только имя столбца

    return {
      table,
      columns: columnsRaw,
    };
  }

  async getTaskById(taskId: number) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId },
      include: { subTask: true },
    });

    const parsed = this.parseSqlSchema(task.sqlSchema);
    return {
      ...task,
      table: parsed?.table,
      columns: parsed?.columns,
    };
  }

  async getSubTaskById(subTaskId: number) {
    return this.prisma.subTask.findFirst({
      where: { id: subTaskId },
      include: { task: true },
    });
  }

  async executeTask(
    subTaskId: number,
    executeSqlQuery: string,
    sessionToken: string,
  ) {
    const subTask = await this.prisma.subTask.findFirst({
      where: { id: subTaskId },
      include: { task: true },
    });

    if (!subTask) throw new BadRequestException('Такого задания не существует');

    const userResult = await this.sqlService.run(
      subTask.task.sqlSchema,
      subTask.task.fillData,
      executeSqlQuery,
    );

    if (!userResult.success) {
      return {
        success: false,
        error: userResult.error,
      };
    }

    const correctResult = await this.sqlService.run(
      subTask.task.sqlSchema,
      subTask.task.fillData,
      subTask.solution,
    );

    if (!correctResult.success) {
      throw new BadRequestException('Ошибка в эталонном решении задачи');
    }

    const isCorrect = this.compareResults(userResult.data, correctResult.data);
    const isCorrectSnapshot = this.compareSnapshots(
      userResult.afterSnapshot,
      correctResult.afterSnapshot,
    );

    const { id } = await this.prisma.user.findFirst({
      where: {
        session: {
          some: { sessionToken },
        },
      },
    });

    await this.prisma.completedTasks.create({
      data: { userId: id, taskId: subTask.task.id },
    });

    return {
      success: true,
      isCorrect: isCorrect && isCorrectSnapshot,
      userResult: userResult.data,
      correctResult: correctResult.data,
      executionTimeMs: userResult.executionTimeMs,
    };
  }

  async createTask(createTaskDto: CreateTaskDto) {
    await this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description ?? '',
        sqlSchema: createTaskDto.sqlSchema,
        fillData: createTaskDto.fillData,
        level: createTaskDto.level,
        subTask: {
          createMany: {
            data: [...createTaskDto.subTasks],
          },
        },
      },
    });

    return new SuccessDto();
  }

  private compareSnapshots(
    userSnapshot: Record<string, any[]>,
    correctSnapshot: Record<string, any[]>,
  ): boolean {
    return JSON.stringify(userSnapshot) === JSON.stringify(correctSnapshot);
  }

  private compareResults(userData: any, correctData: any): boolean {
    return JSON.stringify(userData) === JSON.stringify(correctData);
  }
}
