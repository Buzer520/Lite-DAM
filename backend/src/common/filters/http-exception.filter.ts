import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    let message = '';
    let error = '';

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      error = exception.message;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      message = (exceptionResponse as any).message || exception.message;
      error = (exceptionResponse as any).error || '';
    } else {
      message = exception.message;
      error = '';
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      error: error || HttpStatus[status]?.replace('_', ' ') || 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}