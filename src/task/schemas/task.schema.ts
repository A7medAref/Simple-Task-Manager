import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Document } from 'mongoose';
import { v4 } from 'uuid';

import { TaskPriority } from '../enum/task-priority.enum';
import { TaskStatus } from '../enum/task-status.enum';

export type TaskDocument = Task & Document;

@Schema({ _id: false, versionKey: false })
export class Task {
  @Prop({ default: v4 })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: TaskStatus })
  status: string;

  @Prop({ required: true, enum: TaskPriority })
  priority: string;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ required: true })
  userId: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
