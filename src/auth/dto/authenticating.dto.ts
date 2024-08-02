import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AuthenticatingDto {
  @ApiProperty({ description: 'The username of the account', required: true })
  @Length(2, 30)
  @IsString()
  readonly username: string;

  @ApiProperty({ description: 'The password of the account', required: true })
  @IsNotEmpty()
  @Length(8, 128)
  readonly password: string;
}
