import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { AuthGuard } from '../../guards/auth.guard';
import { ExecuteTaskDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: ExecuteTaskDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { sessionToken } = await this.authService.register(
      body.email,
      body.password,
      body.name,
    );

    res.cookie('sessionToken', sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // true на продакшене через https
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    });

    return { message: 'Пользователь зарегистрирован' };
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { sessionToken } = await this.authService.login(
      body.email,
      body.password,
    );

    res.cookie('sessionToken', sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Успешный вход', token: sessionToken };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request & { cookies: any },
  ) {
    const sessionToken = req.cookies['sessionToken'];

    if (sessionToken) {
      await this.authService.logout(sessionToken);
    }

    // Удаляем куку
    res.clearCookie('sessionToken');

    return { message: 'Вы успешно вышли' };
  }
}
