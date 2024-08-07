import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { IToken } from '../../auth/interfaces/token.interface';
import { UserService } from '../../user/user.service';

@Injectable()
export class UserStrategy extends PassportStrategy(Strategy, 'jwt-user') {
  /**
   * Class Constructor
   * @param userService UserService
   */
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /** it's called automatically using a guard super class to validate user using token
   *
   * @param payload object get from jwt token
   * @returns the user
   */
  async validate(payload: IToken) {
    return this.userService.getUser({
      id: payload.id,
    });
  }
}
