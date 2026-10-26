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
import { createUser } from "../repositories/userRepository.js";
import { hashPassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";
import { InternalServerError } from "../errors/errors.js";
import { createShelter } from "../repositories/shelterRepository.js";
import {
  authenticationHandler,
  type AuthRequest,
} from "../middleware/authenticationHandler.js";
import { login } from "../services/authService.js";

export const router = express.Router({ mergeParams: true });

router.post(
  "/register/user",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { password, ...request } = zodValidation(
        registerUserSchema,
        req.body,
      );
      const user = await createUser({
        ...request,
        passwordHash: await hashPassword(password),
      });
      res.status(201).json({
        token: generateToken(user.id, "user"),
        role: "user",
        id: user.id,
      });
    } catch (error: unknown) {
      next(error);
    }
  },
);

router.post(
  "/register/shelter",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { password, ...request } = zodValidation(
        createAnimalShelterSchema,
        req.body,
      );
      const shelter = await createShelter({
        ...request,
        passwordHash: await hashPassword(password),
      });
      res.status(201).json({
        token: generateToken(shelter.id, "shelter"),
        role: "shelter",
        id: shelter.id,
      });
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
      if (!req.auth?.sub || !req.auth?.role){
        throw new InternalServerError("An internal server error occurred");
      }
      res.status(200).json({
        id: req.auth.sub,
        role: req.auth.role,
      });
    } catch (error) {
      next(error);
    }
  },
);
