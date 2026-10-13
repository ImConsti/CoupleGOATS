export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  protected constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

export class AuthenticationError extends AppError {
  statusCode: number = 401;
  code: string = "UNAUTHORIZED";
  constructor(message: string) {
    super(message, "AuthenticationError");
  }
}

export class ValidationError extends AppError {
  statusCode: number = 400;
  code: string = "VALIDATION_ERROR";
  constructor(message: string) {
    super(message, "ValidationError");
  }
}

export class NotFoundError extends AppError {
  statusCode: number = 404;
  code: string = "NOT_FOUND";
  constructor(message: string) {
    super(message, "NotFoundError");
  }
}

export class ConflictError extends AppError {
  statusCode: number = 409;
  code: string = "CONFLICT_ERROR";
  constructor(message: string) {
    super(message, "ConflictError");
  }
}

export class UnprocessableEntityError extends AppError {
  statusCode: number = 422;
  code: string = "UNPROCESSABLE_ENTITY";
  constructor(message: string) {
    super(message, "UnprocessableEntityError");
  }
}

export class DatabaseError extends AppError {
  statusCode: number = 500;
  code: string = "DATABASE_ERROR";
  constructor(message: string) {
    super(message, "DatabaseError");
  }
}
