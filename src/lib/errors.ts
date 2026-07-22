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

  if (error && typeof error === 'object' && ('statusCode' in error || 'code' in error)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appErr = error as any;
    const statusCode = typeof appErr.statusCode === 'number' ? appErr.statusCode : 500;
    const code = appErr.code || 'ERROR';
    const message = appErr.message || 'An error occurred';

    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message,
        },
      },
      { status: statusCode }
    );
  }

  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
      },
    },
    { status: 500 }
  );
}
