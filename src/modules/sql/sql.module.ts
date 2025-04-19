import { Module } from '@nestjs/common';
import { SqlService } from './sql.service';
import { SqlController } from './sql.controller';
import { TaskService } from './task.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SqlController],
  providers: [SqlService, TaskService, PrismaService],
})
export class SqlModule {}
