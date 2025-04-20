import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesService } from '../roles/roles.service';

@Module({
  controllers: [AuthController],
  providers: [PrismaService, AuthService, RolesService],
})
export class AuthModule {}
