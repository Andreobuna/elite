import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err instanceof AppError ? err.statusCode : err.statusCode || 500;

  logger.error(err.message, { stack: err.stack, path: req.originalUrl });

  // Never leak stack traces or internal details to the client.
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Something went wrong. Please try again later.' : err.message,
  });
}
