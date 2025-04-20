import { Controller, Get, UseGuards } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Roles } from "../roles/roles-auth.decorator";
import { RolesGuard } from "../roles/roles.guard";

@Controller("analytics")
export class AnalyticsController {
    constructor (private prismaService: PrismaService) {}
    
    /*@Roles("ADMIN")
    @UseGuards(RolesGuard)*/
    @Get("/tasksAmount")
    async getTasksAmount() {
        const tasks = await this.prismaService.task.findMany();
        return tasks.length;
    }

    /*@Roles("ADMIN")
    @UseGuards(RolesGuard)*/
    @Get("/usersAmount")
    async getUsersAmount() {
        const users = await this.prismaService.user.findMany();
        return users.length;
    }

    /*@Roles("ADMIN")
    @UseGuards(RolesGuard)*/
    @Get("/completedTasks")
    async getCompletedTasks() {
        const tasks = await this.prismaService.completedTasks.findMany();
        return tasks.length;
    }
}