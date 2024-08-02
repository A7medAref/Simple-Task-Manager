import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, MinLength } from 'class-validator';

import { TaskPriority } from '../enum/task-priority.enum';
import { TaskStatus } from '../enum/task-status.enum';

export class UpdateTaskDto {
  @ApiProperty()
  @IsOptional()
  @MinLength(2)
  title: string;

  @ApiProperty()
  @IsOptional()
  @MinLength(2)
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiProperty()
  @IsOptional()
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : value), {
    toClassOnly: true,
  })
  @IsDate()
  dueDate: Date;
}
