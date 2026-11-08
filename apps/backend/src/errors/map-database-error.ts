import {
  DatabaseError,
  AppError,
  UnprocessableEntityError,
  ConflictError,
} from "./errors.js";
import type { DbError } from "../types.js";

export function mapDatabaseError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  } else {
    const dbError = error as DbError;
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
