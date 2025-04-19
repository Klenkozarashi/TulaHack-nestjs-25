import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const session = request?.cookies?.sessionToken;

    if (!session) throw new UnauthorizedException('Нет токена сессии');

    const user = await this.prisma.user.findFirst({
      where: {
        session: {
          some: { sessionToken: session },
        },
      },
      include: { session: { where: { sessionToken: session } } },
    });

    if (!user) throw new UnauthorizedException('Сессия невалидна');

    request.user = user;
    return true;
  }
}
