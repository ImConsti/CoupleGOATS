import type { NextFunction, Request, Response } from "express";
import { AuthenticationError } from "../errors/errors.js";
import { type JwtPayloadOutput, verifyToken } from "../utils/jwt.js";
import { userExistsById } from "../repositories/userRepository.js";
import { shelterExistsById } from "../repositories/shelterRepository.js";
import type { roles } from "../validation/schemas.js";

export type AuthRequest = Request & {
  auth?: JwtPayloadOutput;
};

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
  role: (typeof roles)[number],
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
