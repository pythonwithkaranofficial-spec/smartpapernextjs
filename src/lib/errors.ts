import { NextResponse } from 'next/server';

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class AuthError extends AppError {
  constructor(message: string, statusCode = 401, code = 'UNAUTHENTICATED') {
    super(message, statusCode, code);
    this.name = 'AuthError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, statusCode = 500, code = 'DATABASE_ERROR') {
    super(message, statusCode, code);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, statusCode = 400, code = 'VALIDATION_ERROR') {
    super(message, statusCode, code);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, statusCode = 404, code = 'NOT_FOUND') {
    super(message, statusCode, code);
    this.name = 'NotFoundError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]:', error);

  // Database errors carry raw SQL/driver messages: keep them in the logs only.
  if (error instanceof DatabaseError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: 'A database error occurred. Please try again.',
        },
      },
      { status: error.statusCode }
    );
  }

  // Other AppError subclasses carry messages written for end users.
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON' } },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again.',
      },
    },
    { status: 500 }
  );
}
