import type { NextFunction, Response } from "express";
import { AuthenticationError, InternalServerError } from "../errors/errors.js";
import { verifyToken } from "../utils/jwt.js";
import { userExistsById } from "../repositories/userRepository.js";
import { shelterExistsById } from "../repositories/shelterRepository.js";
import type { AuthRequest, JwtPayloadOutput, Role } from "../types.js";

export async function authenticationHandler(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.headers.authorization?.startsWith("Bearer ")) {
      throw new AuthenticationError(
        "Missing or malformed authorization header",
      );
    }
    const token = req.headers.authorization.slice("Bearer ".length);
    const authInfos = verifyToken(token);
    const exists = await accountExists(authInfos.sub, authInfos.role);
    if (!exists) {
      throw new AuthenticationError("Invalid credentials");
    }
    req.auth = authInfos;
    next();
  } catch (error) {
    next(error);
  }
}

async function accountExists(
  id: string,
  role: Role,
): Promise<boolean> {
  switch (role) {
    case "admin":
    case "user": {
      return await userExistsById(id);
    }
    case "shelter": {
      return await shelterExistsById(id);
    }
    default: {
      throw new AuthenticationError("Invalid credentials");
    }
  }
}

export function getAuth(req: AuthRequest): JwtPayloadOutput {
  if (!req.auth) {
    throw new InternalServerError("An internal server error occurred");
  }
  return req.auth;
}