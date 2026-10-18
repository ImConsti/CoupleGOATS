import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import {
  createAnimalShelterSchema,
  loginSchema,
  registerUserSchema,
  roles,
} from "../validation/schemas.js";
import { zodValidation } from "../validation/zod-validation.js";
import { createUser, getUserByEmail } from "../repositories/users.js";
import { hashPassword, verifyPassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";
import { AuthenticationError, InternalServerError } from "../errors/errors.js";
import { createShelter, getShelterByEmail } from "../repositories/shelters.js";
import {
  authenticationHandler,
  type AuthRequest,
} from "../middleware/authenticationHandler.js";

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
      let id: string;
      let role: (typeof roles)[number];
      switch (request.role) {
        case "user": {
          const user = await getUserByEmail(request.email);
          if (!user) {
            throw new AuthenticationError("Invalid credentials");
          }
          await verifyPassword(request.password, user.passwordHash);
          id = user.id;
          role = user.isAdmin ? "admin" : "user";
          break;
        }

        case "shelter": {
          const shelter = await getShelterByEmail(request.email);
          if (!shelter) {
            throw new AuthenticationError("Invalid credentials");
          }
          await verifyPassword(request.password, shelter.passwordHash);
          id = shelter.id;
          role = "shelter";
          break;
        }

        default: {
          throw new InternalServerError("An internal server error occurred");
        }
      }
      res.status(200).json({ token: generateToken(id, role), role, id });
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
