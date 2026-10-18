import {
  DatabaseError,
  AppError,
  UnprocessableEntityError,
  ConflictError,
} from "./errors.js";

type dbError = {
  cause: {
    rawCode: number;
  };
};

export function mapDatabaseError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  } else {
    const dbError: dbError = error as dbError;
    switch (dbError?.cause?.rawCode) {
      case 2067:
        return new ConflictError("resource already exists");
      case 787:
        return new UnprocessableEntityError("invalid reference");
      default:
        return new DatabaseError("unknown database error");
    }
  }
}
