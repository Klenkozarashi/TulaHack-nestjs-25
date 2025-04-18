import { IsEmail, IsString, Length } from "class-validator";
import { SuccessDto } from "src/shared/globalDtos";

export class SignUpRequestDto {
  @IsString({message: 'name must be a string'})
  @Length(3, 24, {message: 'name must be longer than 3 and less and 24'})
  name: string;
  @IsString({message: 'email must be a string'})
  @IsEmail({}, {message: 'email must be correct'})
  email: string;
  @IsString({message: 'password must be a string'})
  @Length(3, 24, {message: 'password must be longer than 3 and less and 24'})
  password: string;  
}

export class SignInRequestDto {
  @IsString({message: 'email must be a string'})
  @IsEmail({}, {message: 'email must be correct'})
  email: string;
  @IsString({message: 'password must be a string'})
  @Length(3, 24, {message: 'password must be longer than 3 and less and 24'})
  password: string; 
}

export class AuthResponseDto extends SuccessDto {
  constructor (
    public name: string,
    public email: string,
    public sessionId: string
  ) {
    super();
  }
}

export class LogoutRequestDto {
  @IsString({message: 'userId must be a string'})
  @Length(3, 48, {message: 'userId must be longer than 3 and less and 24'})
  userId: string;
}