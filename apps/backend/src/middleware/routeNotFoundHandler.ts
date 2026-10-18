import type {Request, Response, NextFunction} from "express";
import { NotFoundError } from "../errors/errors.js";

export function routeNotFoundHandler(
  _request: Request,
  _response: Response,
  next: NextFunction,
): void {
  next(new NotFoundError("Route not found"));
}
