import { BadRequestException, Injectable } from '@nestjs/common';
import { SqlService } from './sql.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly sqlService: SqlService,
    private prisma: PrismaService,
  ) {}

  async executeTask(subTaskId: number, executeSqlQuery: string) {
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

    return {
      success: true,
      isCorrect: isCorrect && isCorrectSnapshot,
      userResult: userResult.data,
      correctResult: correctResult.data,
      executionTimeMs: userResult.executionTimeMs,
    };
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
