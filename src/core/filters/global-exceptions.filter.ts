import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  catch(exception, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.BAD_REQUEST;

    const httpResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const responseBody =
      httpResponse instanceof Object
        ? httpResponse
        : { message: exception.message };

    if (exception.code === '23503') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Foreign key constraint error',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    response.status(status).json({
      ...responseBody,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
