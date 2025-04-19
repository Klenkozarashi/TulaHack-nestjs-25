import { Module } from "@nestjs/common";
import { AnalyticsController } from "./analytics.controller";
import { PrismaService } from "../prisma/prisma.service";

@Module({
    controllers: [AnalyticsController],
    providers: [PrismaService]
})
export class AnalyticsModule {}