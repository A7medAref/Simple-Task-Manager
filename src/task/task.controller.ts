import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { UserDecorator } from '../common/decorators/user.decorator';
import { UserGuard } from '../common/guards/user.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksWithFilterDto } from './dto/get-tasks-with-filter.dto';
import { PaginationDto } from './dto/pagination.dto';
import { SearchTasksDto } from './dto/search-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './task.service';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiOperation({ description: 'Create a new task' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiForbiddenResponse({
    description: 'You are not allowed to access this task',
  })
  @UseGuards(UserGuard)
  @Post()
  create(@Body() taskDto: CreateTaskDto, @UserDecorator('id') userId: string) {
    return this.taskService.createTask(taskDto, userId);
  }

  @ApiOperation({ description: 'Get all tasks' })
  @UseGuards(UserGuard)
  @Get()
  getTasks(
    @UserDecorator('id') userId: string,
    @Query() { limit, page }: PaginationDto,
  ) {
    return this.taskService.getTasks(userId, {}, limit, page);
  }

  @ApiOperation({ description: 'Get tasks with filter' })
  @UseGuards(UserGuard)
  @Get('filter')
  getTasksWithFilter(
    @UserDecorator('id') userId: string,
    @Query() { limit, page, ...filter }: GetTasksWithFilterDto,
  ) {
    return this.taskService.getTasks(userId, filter, limit, page);
  }

  @ApiOperation({ description: 'Search tasks by title or description' })
  @UseGuards(UserGuard)
  @Get('search')
  searchTasks(
    @UserDecorator('id') userId: string,
    @Query() { limit, page, title, description }: SearchTasksDto,
  ) {
    return this.taskService.searchTasks(
      userId,
      title,
      description,
      limit,
      page,
    );
  }

  @ApiOperation({ description: 'Get a task by id' })
  @UseGuards(UserGuard)
  @Get(':id')
  getTaskById(
    @UserDecorator('id') userId: string,
    @Param('id') taskId: string,
  ) {
    return this.taskService.getTaskById(taskId, userId);
  }

  @ApiOperation({ description: 'Update a task by id' })
  @UseGuards(UserGuard)
  @Put(':id')
  updateTask(
    @UserDecorator('id') userId: string,
    @Param('id') taskId: string,
    @Body() taskDto: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(taskId, taskDto, userId);
  }

  @ApiOperation({ description: 'Delete a task by id' })
  @UseGuards(UserGuard)
  @Delete(':id')
  deleteTask(@UserDecorator('id') userId: string, @Param('id') taskId: string) {
    return this.taskService.deleteTask(taskId, userId);
  }
}
