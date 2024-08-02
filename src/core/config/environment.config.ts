import { IsNotEmpty, IsOptional } from 'class-validator';

export class EnvironmentConfig {
  @IsOptional()
  API_PORT = 3000;

  @IsNotEmpty()
  DATABASE_URL: string;

  @IsNotEmpty()
  JWT_SECRET: string;
}
