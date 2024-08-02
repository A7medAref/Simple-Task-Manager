import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery } from 'mongoose';
import { Model } from 'mongoose';

import type { CreateTaskDto } from './dto/create-task.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';
import type { TaskDocument } from './schemas/task.schema';
import { Task } from './schemas/task.schema';

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async createTask(task: CreateTaskDto, userId: string) {
    const [newTask] = await this.taskModel.insertMany([{ ...task, userId }]);

    return { ...task, id: newTask.id, userId };
  }

  async getTasks(
    userId: string,
    filter: FilterQuery<TaskDocument> = {},
    limit = 10,
    page = 1,
  ) {
    return this.taskModel
      .find({ userId, ...filter })
      .select({ _id: false })
      .limit(limit)
      .skip(limit * (page - 1))
      .exec();
  }

  private validateTaskState(task: TaskDocument | null, userId: string) {
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('You are not allowed to access this task');
    }
  }

  private async validateTask(taskId: string, userId: string) {
    const task = await this.taskModel.findOne({ id: taskId }, { userId: true });

    this.validateTaskState(task, userId);
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await this.taskModel
      .findOne({ id: taskId }, { _id: false })
      .exec();

    this.validateTaskState(task, userId);

    return task;
  }

  async deleteTask(taskId: string, userId: string) {
    await this.validateTask(taskId, userId);

    await this.taskModel.deleteOne({
      id: taskId,
    });
  }

  async updateTask(taskId: string, taskDto: UpdateTaskDto, userId: string) {
    await this.validateTask(taskId, userId);

    await this.taskModel.updateOne(
      {
        id: taskId,
      },
      taskDto,
    );
  }

  private getSearchOperations(
    title?: string,
    description?: string,
  ): Array<FilterQuery<TaskDocument>> {
    const searchOperations: Array<FilterQuery<TaskDocument>> = [];

    if (title) {
      searchOperations.push({ title: { $regex: title, $options: 'i' } });
    }

    if (description) {
      searchOperations.push({
        description: { $regex: description, $options: 'i' },
      });
    }

    return searchOperations;
  }

  async searchTasks(
    userId: string,
    title?: string,
    description?: string,
    limit = 10,
    page = 1,
  ) {
    const searchOperations = this.getSearchOperations(title, description);
    const findQuery: FilterQuery<TaskDocument> = { userId };

    if (searchOperations.length > 0) {
      findQuery.$or = searchOperations;
    }

    return this.taskModel
      .find(findQuery)
      .select({ _id: false })
      .limit(limit)
      .skip(limit * (page - 1))
      .exec();
  }
}
