import type { NextFunction, Response } from "express";
import { ForbiddenError } from "../errors/errors.js";
import type { roles } from "../validation/schemas.js";
import type { AuthRequest } from "./authenticationHandler.js";

type Role = (typeof roles)[number];

export function checkRole(...allowed: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    const role = req.auth?.role;
    if (role && (role === "admin" || allowed.includes(role))) {
      next();
    } else {
      next(new ForbiddenError("Forbidden"));
    }
  };
}
