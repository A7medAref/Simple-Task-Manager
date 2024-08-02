import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../core/utils/mongoose-in-memory';
import { TaskPriority } from './enum/task-priority.enum';
import { TaskStatus } from './enum/task-status.enum';
import { TaskModule } from './task.module';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let module: TestingModule;
  const task = {
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.Pending,
    priority: TaskPriority.Low,
    dueDate: new Date(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TaskModule, rootMongooseTestModule()],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const userId = 'user-id-123';
      const result = await service.createTask(task, userId);

      expect(result).toEqual({
        ...task,
        id: expect.any(String),
        userId,
      });
    });
  });

  describe('searchTasks', () => {
    it('should return tasks matching title and description for a user', async () => {
      const task1 = { ...task, title: 'search1', description: 'Description 1' };
      const task2 = { ...task, title: 'search2', description: 'Description 2' };

      const userId = 'user-id-123';

      await Promise.all([
        service.createTask(task1, userId),
        service.createTask(task2, userId),
      ]);

      const result1 = await service.searchTasks(userId, 'search');
      expect(result1).toHaveLength(2);

      const result2 = await service.searchTasks(userId, 'search1');
      expect(result2).toHaveLength(1);

      const result3 = await service.searchTasks(
        userId,
        undefined,
        'Description 2',
      );
      expect(result3).toHaveLength(1);
    });

    it('should return tasks matching title and description for a user with pagination', async () => {
      const userId = 'user-id-123';

      const result1 = await service.searchTasks(
        userId,
        'search',
        undefined,
        1,
        1,
      );
      expect(result1).toHaveLength(1);

      const result2 = await service.searchTasks(
        userId,
        'search',
        undefined,
        1,
        2,
      );
      expect(result2).toHaveLength(1);

      const result3 = await service.searchTasks(
        userId,
        'search',
        undefined,
        1,
        3,
      );
      expect(result3).toHaveLength(0);
    });
    it('should return all if no search criteria is provided', async () => {
      const userId = 'user-id-no-search';
      await Promise.all([
        service.createTask(task, userId),
        service.createTask(task, userId),
        service.createTask(task, userId),
        service.createTask(task, userId),
      ]);

      const result1 = await service.searchTasks(userId);
      expect(result1).toHaveLength(4);
    });
  });

  describe('getTaskById', () => {
    it('should get a task by ID', async () => {
      const userId = 'user-id-123';

      const createdTask = await service.createTask(task, userId);
      const fetchedTask = await service.getTaskById(createdTask.id, userId);

      expect(fetchedTask).toBeDefined();
      expect(fetchedTask?.id).toBe(createdTask.id);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      await expect(
        service.getTaskById('non-existent-id', 'user-id-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if the user is not the owner of the task', async () => {
      const userId = 'user-id-123';

      const createdTask = await service.createTask(task, userId);
      await expect(
        service.getTaskById(createdTask.id, 'another-user-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const userId = 'user-id-123';

      const createdTask = await service.createTask(task, userId);
      await service.deleteTask(createdTask.id, userId);

      await expect(service.getTaskById(createdTask.id, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if task does not exist', async () => {
      await expect(
        service.deleteTask('non-existent-id', 'user-id-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if the user is not the owner of the task', async () => {
      const userId = 'user-id-123';

      const createdTask = await service.createTask(task, userId);
      await expect(
        service.deleteTask(createdTask.id, 'another-user-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const userId = 'user-id-123';
      const updatedTask = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.Completed,
        priority: TaskPriority.High,
        dueDate: new Date(),
      };

      const createdTask = await service.createTask(task, userId);
      await service.updateTask(createdTask.id, updatedTask, userId);

      const fetchedTask = await service.getTaskById(createdTask.id, userId);

      expect(fetchedTask).toEqual(
        expect.objectContaining({ ...createdTask, ...updatedTask }),
      );
    });

    it('should throw NotFoundException if task does not exist', async () => {
      await expect(
        service.updateTask('non-existent-id', task, 'user-id-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if the user is not the owner of the task', async () => {
      const userId = 'user-id-123';

      const createdTask = await service.createTask(task, userId);
      await expect(
        service.updateTask(createdTask.id, task, 'another-user-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getTasks', () => {
    const userId = 'user-id-get-tasks';
    it('should return tasks for a user', async () => {
      await Promise.all([
        service.createTask(task, userId),
        service.createTask(task, userId),
        service.createTask(task, userId),
        service.createTask(task, userId),
      ]);

      const result1 = await service.getTasks(userId);
      expect(result1).toHaveLength(4);

      const result2 = await service.getTasks(userId, {
        status: TaskStatus.Pending,
      });
      expect(result2).toHaveLength(4);

      const result3 = await service.getTasks(userId, {
        status: TaskStatus.Completed,
      });
      expect(result3).toHaveLength(0);
    });
    it('should be able to handle multiple filters', async () => {
      const result1 = await service.getTasks(userId, {
        status: TaskStatus.Pending,
        priority: TaskPriority.Low,
      });
      expect(result1).toHaveLength(4);

      const result2 = await service.getTasks(userId, {
        status: TaskStatus.Completed,
        priority: TaskPriority.Low,
      });
      expect(result2).toHaveLength(0);
    });

    it('should be able to handle pagination', async () => {
      const result1 = await service.getTasks(userId, {}, 2, 1);
      expect(result1).toHaveLength(2);

      const result2 = await service.getTasks(userId, {}, 2, 2);
      expect(result2).toHaveLength(2);

      const result3 = await service.getTasks(userId, {}, 2, 3);
      expect(result3).toHaveLength(0);
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});
