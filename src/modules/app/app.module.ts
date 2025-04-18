import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '../prisma/prisma.service';
import { SqlModule } from '../sql/sql.module';
import { AuthModule } from '../auth/Auth.module';

@Module({
  imports: [AuthModule, SqlModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
