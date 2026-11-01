import express, { type Response, type NextFunction } from "express";
import {
  authenticationHandler,
  type AuthRequest,
  getAuth,
} from "../middleware/authenticationHandler.js";
import { checkRole } from "../middleware/roleHandler.js";
import { zodValidation } from "../validation/zod-validation.js";
import { createAnimalProfileSchema } from "../validation/schemas.js";
import { createAnimalProfile } from "../services/animalProfileService.js";

export const router = express.Router({ mergeParams: true });

router.post(
  "/me/animals",
  authenticationHandler,
  checkRole("shelter"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const request = zodValidation(createAnimalProfileSchema, req.body);
      const animalProfile = await createAnimalProfile(auth.sub, request);
      res.status(201).json(animalProfile);
    } catch (error: unknown) {
      next(error);
    }
  },
);
