import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class RolesService {
    constructor (private readonly prisma: PrismaService) {}

    async getCommonRole(value: string) {
        const role = await this.prisma.role.findFirst({
            where: { value }
        });

        if (!role) {
            return this.createCommonRole(value);
        }

        return role;
    }

    private async createCommonRole(value: string):Promise<Role> {
        return this.prisma.role.create({
            data: {
                value,
                description: "a common role"
            }
        });
    }
}