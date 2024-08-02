import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { AuthenticatingDto } from './dto/authenticating.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ description: 'Login user to his account' })
  @ApiCreatedResponse({
    description: 'Authorized Successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Wrong email or password' })
  @Post('login')
  login(@Body() dto: AuthenticatingDto, @Res() res: Response) {
    return this.authService.login(dto, res);
  }

  @ApiOperation({ description: 'register a new user' })
  @ApiCreatedResponse({
    description: 'User created successfully',
  })
  @Post('register')
  register(@Body() dto: AuthenticatingDto, @Res() res: Response) {
    return this.authService.register(dto, res);
  }
}
