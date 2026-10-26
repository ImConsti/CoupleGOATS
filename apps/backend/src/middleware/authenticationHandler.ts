import type { NextFunction, Request, Response } from "express";
import { AuthenticationError } from "../errors/errors.js";
import { type JwtPayloadInput, verifyToken } from "../utils/jwt.js";

export type AuthRequest  = Request & {
  auth?: JwtPayloadInput;
}

export function authenticationHandler(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")
    ) {
      throw new AuthenticationError(
        "Missing or malformed authorization header",
      );
    }
    const token = req.headers.authorization.slice("Bearer ".length);
    req.auth = verifyToken(token);
    next();
  } catch (error) {
    next(error);
  }
}
