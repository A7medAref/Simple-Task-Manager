import { ApiProperty } from '@nestjs/swagger';

export class AuthenticatingResponseDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  id: string;
}
