import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { TaskPriority } from '../enum/task-priority.enum';
import { TaskStatus } from '../enum/task-status.enum';
import { PaginationDto } from './pagination.dto';

export class GetTasksWithFilterDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
}
