import { IsNumber, IsString } from 'class-validator';

export class ExecuteTaskDto {
  @IsNumber()
  subTaskId: number;

  @IsString()
  query: string;
}
