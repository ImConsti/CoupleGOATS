import type { NextFunction, Request, Response } from "express";
import { AuthenticationError } from "../errors/errors.js";
import { zodValidation } from "../validation/zod-validation.js";
import { z } from "zod";
import { type JwtPayloadInput, verifyToken } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  auth?: JwtPayloadInput;
}

export function authorizationHandler(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void {
  try {
    if (
      !req.headers.authorization ||
      !/^Bearer .+$/.test(req.headers.authorization)
    ) {
      throw new AuthenticationError(
        "Missing or malformed authorization header",
      );
    }
    const token = zodValidation(
      z.string().transform((header) => header.slice("Bearer ".length)),
      req.headers.authorization,
    );
    req.auth = verifyToken(token);
    next();
  } catch (error) {
    next(error);
  }
}
