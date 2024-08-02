import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { ConfigModule } from '../core/config/config.module';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../core/utils/mongoose-in-memory';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;
  const registerDto = { username: 'testuser', password: 'password' };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule, AuthModule, rootMongooseTestModule()],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        json: jest.fn(),
      };

      const user = await service.register(registerDto, mockResponse as any);

      expect(mockResponse.setHeader).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
      expect(user).toEqual({
        user: expect.objectContaining({
          id: expect.any(String),
          username: registerDto.username,
          password: expect.not.stringContaining(registerDto.password),
        }),
        accessToken: expect.any(String),
      });
    });

    it('should throw an error if username already exists', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        json: jest.fn(),
      };

      await expect(
        service.register(registerDto, mockResponse as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        json: jest.fn(),
      };

      const user = await service.login(registerDto, mockResponse as any);

      expect(mockResponse.setHeader).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();

      expect(user).toEqual({
        user: expect.objectContaining({
          id: expect.any(String),
          username: registerDto.username,
          password: expect.not.stringContaining(registerDto.password),
        }),
        accessToken: expect.any(String),
      });
    });

    it('should throw an error if the username is wrong', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        json: jest.fn(),
      };

      await expect(
        service.login(
          { ...registerDto, username: 'wrongusername' },
          mockResponse as any,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw an error if the password is wrong', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        json: jest.fn(),
      };

      await expect(
        service.login(
          { ...registerDto, password: 'wrongpassword' },
          mockResponse as any,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });
});
