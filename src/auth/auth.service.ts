import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';

import type { User } from '../common/schemas/user.schema';
import { UserService } from '../user/user.service';
import type { AuthenticatingDto } from './dto/authenticating.dto';
import type { IToken } from './interfaces/token.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Compare password string with stored hashed password
   * @param userPassword Password string
   * @param hashedPassword Stored hashed password
   * @returns Whether the password is valid
   */
  private validPassword(
    userPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(userPassword, hashedPassword);
  }

  /**
   * check if the user exist and if the password is valid
   * @param user user that you will check about
   * @param password
   * @returns if the user is valid
   */
  private async isValidUser(user: User, password: string): Promise<boolean> {
    if (!user.password) {
      return false;
    }

    return this.validPassword(password, user.password);
  }

  /** Create JWT token
   *
   * @param tokenData The data to be stored in the token
   * @returns The created token
   */
  private createAuthToken(tokenData: IToken): Promise<string> {
    return this.jwtService.signAsync(tokenData, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15d',
    });
  }

  private async generateAndSendAccessToken(user: User, res: Response) {
    const accessToken = await this.createAuthToken({
      id: user.id,
      username: user.username,
    });

    // send the access token in the header
    res.setHeader('Authorization', `Bearer ${accessToken}`);

    res.json({ id: user.id, username: user.username });

    return { user, accessToken };
  }

  /**
   * login and get access token
   * @param loginDto see LoginDto
   * @param res @ express response
   */
  login = async (
    loginDto: AuthenticatingDto,
    res: Response,
  ): Promise<{ user: User; accessToken: string }> => {
    const { username, password } = loginDto;

    let user: User;

    try {
      user = await this.userService.getUser(
        { username },
        { password: 1, id: 1, username: 1 },
      );
    } catch {
      throw new UnauthorizedException('wrong username or password');
    }

    const isValidUser: boolean = await this.isValidUser(user, password);

    if (!isValidUser) {
      throw new UnauthorizedException('wrong username or password');
    }

    return this.generateAndSendAccessToken(user, res);
  };

  /** Register a new user
   *
   * @param registerDto
   * @param res
   */
  register = async (
    registerDto: AuthenticatingDto,
    res: Response,
  ): Promise<{ user: User; accessToken: string }> => {
    const { username, password } = registerDto;

    const isUserExist = await this.userService.isUserExist({ username });

    if (isUserExist) {
      throw new BadRequestException('username already exist');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      password: hashedPassword,
      username,
    };
    const id = await this.userService.createUser(user);

    return this.generateAndSendAccessToken({ id, ...user }, res);
  };
}
