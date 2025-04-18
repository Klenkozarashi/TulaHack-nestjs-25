import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthController } from "./Auth.controller";

@Module({
  controllers: [AuthController],
  providers: [PrismaService]
})
export class AuthModule {}