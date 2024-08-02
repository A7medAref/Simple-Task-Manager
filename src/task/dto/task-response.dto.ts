import { ApiProperty } from '@nestjs/swagger';

import { TaskPriority } from '../enum/task-priority.enum';
import { TaskStatus } from '../enum/task-status.enum';

export class TaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  status: TaskStatus;

  @ApiProperty()
  priority: TaskPriority;

  @ApiProperty()
  dueDate: Date;
}
