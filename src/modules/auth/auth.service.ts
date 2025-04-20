import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly rolesService: RolesService
  ) {}

  async register(email: string, password: string, name?: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const findUser = await this.prisma.user.findFirst({
      where: { email: email },
    });

    if (findUser)
      throw new BadRequestException('Пользователь с такой почтой существует');

    const role = await this.rolesService.getCommonRole("USER");

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId: role.id
      },
    });

    const sessionToken = randomUUID();

    await this.prisma.session.create({
      data: {
        userId: user.id,
        sessionToken,
      },
    });

    return { sessionToken };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { session: true },
    });

    if (!user) throw new Error('Неверные email или пароль');

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) throw new Error('Неверные email или пароль');

    const sessionToken = randomUUID();

    await this.prisma.session.create({
      data: {
        userId: user.id,
        sessionToken,
      },
    });

    return { sessionToken };
  }

  async logout(sessionToken: string) {
    await this.prisma.session.deleteMany({
      where: { sessionToken },
    });
  }
}
