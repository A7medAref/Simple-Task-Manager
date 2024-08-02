import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../core/utils/mongoose-in-memory';
import { UserModule } from './user.module';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [UserModule, rootMongooseTestModule()],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const userDto = { username: 'testuser', password: 'password' };
  describe('createUser', () => {
    it('should create a new user and return user id', async () => {
      const userId = await service.createUser(userDto);
      expect(userId).toBeDefined();

      const user = await service.getUser({ id: userId });
      expect(user).toBeDefined();
      expect(user.username).toBe(userDto.username);
    });

    it('should throw an error if username already exists', async () => {
      await expect(service.createUser(userDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('isUserExist', () => {
    it('should return true if user exists', async () => {
      const result = await service.isUserExist({ username: userDto.username });
      expect(result).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      const result = await service.isUserExist({ username: 'nonexisting' });
      expect(result).toBe(false);
    });
  });

  describe('getUser', () => {
    it('should return user by username', async () => {
      const user = await service.getUser({ username: userDto.username });
      expect(user).toBeDefined();
      expect(user.username).toBe(userDto.username);
    });

    it('should throw an error if user does not exist', async () => {
      await expect(service.getUser({ id: 'nonexisting' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});
