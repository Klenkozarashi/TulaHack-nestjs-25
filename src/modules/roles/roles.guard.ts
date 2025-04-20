import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ROLES_KEY } from "./roles-auth.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor (
        private readonly reflector: Reflector,
        private readonly prisma: PrismaService
    ) {}
    
    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
                context.getHandler(),
                context.getClass()
            ]);

            if (!requiredRoles) return true;

            const req = context.switchToHttp().getRequest();
            const sessionToken = req.cookies.sessionToken;
            
            if (!sessionToken) {
                throw new UnauthorizedException();
            }

            const user = await this.prisma.user.findFirst({
                where: { session: { some: { sessionToken }}}
            });

            if (!user) {
                throw new UnauthorizedException();
            }

            return (user as User & { roles: { value: string }[] }).roles.some(role => requiredRoles.includes(role.value));
        } catch (err) {
            throw new HttpException("No access", HttpStatus.FORBIDDEN)
        }
    }
}