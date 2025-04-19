import { IsOptional, IsString } from 'class-validator';

export class ExecuteTaskDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  name: string;
}
