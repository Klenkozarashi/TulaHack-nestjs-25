import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("analytics")
export class AnalyticsController {
    constructor (private prismaService: PrismaService) {}
    
    @Get("/tasksAmount")
    async getTasksAmount() {
        const tasks = await this.prismaService.task.findMany();
        return tasks.length;
    }

    @Get("/usersAmount")
    async getUsersAmount() {
        const users = await this.prismaService.user.findMany();
        return users.length;
    }

    
}