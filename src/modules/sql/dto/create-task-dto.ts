import { TaskLevel } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

class CreateSubtaskDto {
  @IsString()
  @Length(3, 64)
  name: string;
  @IsString()
  @IsOptional()
  @Length(0, 512)
  description?: string;
  @IsString()
  @Length(1, 1024)
  solution: string;
}

export class CreateTaskDto {
  @IsString()
  @Length(2, 128)
  title: string;
  @IsString()
  @IsOptional()
  @Length(0, 512)
  description?: string;
  @IsString()
  @Length(2, 1024)
  sqlSchema: string;
  @IsString()
  @Length(2, 1024)
  fillData: string;
  @IsEnum(TaskLevel)
  level: TaskLevel;
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskDto)
  subTasks: CreateSubtaskDto[];
}
