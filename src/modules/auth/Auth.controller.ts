import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from "@nestjs/common";
import { SignUpRequestDto, AuthResponseDto, LogoutRequestDto, SignInRequestDto } from "./dtos";
import type { Response } from "express";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { SuccessDto } from "src/shared/globalDtos";

@Controller("auth")
export class AuthController {
  constructor(private dbService: PrismaService) {}

  @Post("/signup")
  async signUp(
    @Body() userDto: SignUpRequestDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponseDto> {
    const candidate = await this.dbService.user.findFirst({
      where: { email: userDto.email },
    });

    if (candidate) {
      throw new HttpException(
        "Such user already exist",
        HttpStatus.BAD_REQUEST
      );
    }

    const hashPassword = await bcrypt.hash(userDto.password, 5);
    const { userId } = await this.dbService.user.create({
      data: { ...userDto, password: hashPassword },
    });
    const { sessionId } = await this.dbService.session.create({
      data: { user: { connect: { userId } } },
    });

    response.cookie("sessionId", sessionId, { httpOnly: true });

    return new AuthResponseDto(userDto.name, userDto.email, sessionId);
  }

  @Post("/logout")
  async logOut(
    @Body() logoutDto: LogoutRequestDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<SuccessDto> {
    const candidate = await this.dbService.session.findFirst({
      where: { userId: logoutDto.userId },
    });

    if (!candidate) {
      throw new HttpException(
        "Such user was not founded",
        HttpStatus.BAD_REQUEST
      );
    }

    await this.dbService.session.delete({
      where: { userId: candidate.userId }
    });

    response.clearCookie("sessionId")
    return new SuccessDto();
  }

  @Post("/signin")
  async signIn(
    @Body() userDto: SignInRequestDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponseDto> {
    const user = await this.dbService.user.findFirst({
      where: { email: userDto.email },
    });

    if (!user) {
      throw new HttpException(
        "Such user was not founded",
        HttpStatus.BAD_REQUEST
      );
    }

    const isPasswordEqual: boolean = await bcrypt.compare(userDto.password, user.password);

    if (!isPasswordEqual) {
      throw new HttpException(
        "Password is wrong",
        HttpStatus.BAD_REQUEST
      );
    }

    const { sessionId } = await this.dbService.session.create({
      data: { user: { connect: { userId: user.userId } } },
    });

    response.cookie("sessionId", sessionId, { httpOnly: true });

    return new AuthResponseDto(user.name, user.email, sessionId);
  }
}