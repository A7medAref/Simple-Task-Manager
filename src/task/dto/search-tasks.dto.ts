import { IsOptional, IsString } from 'class-validator';

import { PaginationDto } from './pagination.dto';

export class SearchTasksDto extends PaginationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
