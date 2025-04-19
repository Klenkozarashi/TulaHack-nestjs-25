import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '../prisma/prisma.service';
import { SqlModule } from '../sql/sql.module';

@Module({
  imports: [SqlModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
