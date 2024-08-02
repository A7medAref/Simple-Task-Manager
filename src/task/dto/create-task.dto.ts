import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, MinLength } from 'class-validator';

import { TaskPriority } from '../enum/task-priority.enum';
import { TaskStatus } from '../enum/task-status.enum';

export class CreateTaskDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(2)
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(2)
  description: string;

  @ApiProperty()
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiProperty()
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  @IsDate()
  dueDate: Date;
}
