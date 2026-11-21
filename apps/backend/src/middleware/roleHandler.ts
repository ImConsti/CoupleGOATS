import type { NextFunction, Response } from "express";
import { ForbiddenError } from "../errors/errors.js";
import type { AuthRequest, Role } from "../types.js";

export function checkRole(...allowed: Role[]) {
  return createRoleHandler(allowed, true);
}

export function checkExactRole(...allowed: Role[]) {
  return createRoleHandler(allowed, false);
}

function createRoleHandler(allowed: Role[], allowAdmin: boolean) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    const role = req.auth?.role;
    if (role && (allowed.includes(role) || (allowAdmin && role === "admin"))) {
      next();
    } else {
      next(new ForbiddenError("Forbidden"));
    }
  };
}
