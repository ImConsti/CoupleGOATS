import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { loginSchema, jwtPayloadInputSchema } from "../validation/schemas.js";
import { zodValidation } from "../validation/zod-validation.js";
import { getUserByEmail } from "../repositories/users.js";
import { verifyPassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";
import { AuthenticationError, InternalServerError } from "../errors/errors.js";
import { getShelterByEmail } from "../repositories/shelters.js";
import {
  authorizationHandler,
  type AuthRequest,
} from "../middleware/authorizationHandler.js";

export const router = express.Router({ mergeParams: true });

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = zodValidation(loginSchema, req.body);
      let token: string;
      switch (request.role) {
        case "user": {
          const user = await getUserByEmail(request.email);
          if (!user) {
            throw new AuthenticationError("Invalid credentials");
          }
          await verifyPassword(request.password, user.passwordHash);
          token = generateToken(user.id, user.isAdmin ? "admin" : "user");
          break;
        }

        case "shelter": {
          const shelter = await getShelterByEmail(request.email);
          if (!shelter) {
            throw new AuthenticationError("Invalid credentials");
          }
          await verifyPassword(request.password, shelter.passwordHash);
          token = generateToken(shelter.id, "shelter");
          break;
        }

        default: {
          throw new InternalServerError("An internal server error occurred");
        }
      }
      res.status(200).json({ token });
    } catch (error: unknown) {
      next(error);
    }
  },
);

router.post("/logout", authorizationHandler, (_req: Request, res: Response) => {
  res.status(204).send();
});

router.get(
  "/me",
  authorizationHandler,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authInfo = zodValidation(jwtPayloadInputSchema, req.auth);
      res.status(200).json(authInfo);
    } catch (error) {
      next(error);
    }
  },
);
