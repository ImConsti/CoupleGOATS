import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import {
  createAnimalShelterSchema,
  loginSchema,
  registerUserSchema
} from "../validation/schemas.js";
import { zodValidation } from "../validation/zod-validation.js";
import {
  authenticationHandler,
  getAuth,
} from "../middleware/authenticationHandler.js";
import type { AuthRequest } from "../types.js";
import { login, registerShelter, registerUser } from "../services/authService.js";

export const router = express.Router({ mergeParams: true });

router.post(
  "/register/user",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = zodValidation(
        registerUserSchema,
        req.body,
      );
      const result = await registerUser(request);
      res.status(201).json(result);
    } catch (error: unknown) {
      next(error);
    }
  },
);

router.post(
  "/register/shelter",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = zodValidation(
        createAnimalShelterSchema,
        req.body,
      );
      const result = await registerShelter(request);
      res.status(201).json(result);
    } catch (error: unknown) {
      next(error);
    }
  },
);

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = zodValidation(loginSchema, req.body);
      const result = await login(request);
      res.status(200).json({ id: result.id, role: result.role, token: result.token });
    } catch (error: unknown) {
      next(error);
    }
  },
);

router.post("/logout", authenticationHandler, (_req: AuthRequest, res: Response) => {
  res.status(204).send();
});

router.get(
  "/me",
  authenticationHandler,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      res.status(200).json({
        id: auth.sub,
        role: auth.role,
      });
    } catch (error) {
      next(error);
    }
  },
);
