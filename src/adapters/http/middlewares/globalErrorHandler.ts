import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
  DomainException,
  TaskNotFoundException,
  UnauthorizedException,
  InvalidTaskException,
} from '../../../core';

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export function globalErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error.message);

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'ValidationError',
      message: error.errors.map((e) => e.message).join(', '),
      statusCode: 400,
    } as ErrorResponse);
  }

  if (error instanceof TaskNotFoundException) {
    return res.status(404).json({
      error: error.name,
      message: error.message,
      statusCode: 404,
    } as ErrorResponse);
  }

  if (error instanceof UnauthorizedException) {
    return res.status(403).json({
      error: error.name,
      message: error.message,
      statusCode: 403,
    } as ErrorResponse);
  }

  if (error instanceof InvalidTaskException) {
    return res.status(400).json({
      error: error.name,
      message: error.message,
      statusCode: 400,
    } as ErrorResponse);
  }

  if (error instanceof DomainException) {
    return res.status(400).json({
      error: error.name,
      message: error.message,
      statusCode: 400,
    } as ErrorResponse);
  }

  return res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
    statusCode: 500,
  } as ErrorResponse);
}
