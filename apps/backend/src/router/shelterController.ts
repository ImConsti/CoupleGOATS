import express, { type Response, type NextFunction } from "express";
import {
  authenticationHandler,
  getAuth,
} from "../middleware/authenticationHandler.js";
import type { AuthRequest } from "../types.js";
import { checkRole } from "../middleware/roleHandler.js";
import { zodValidation } from "../validation/zod-validation.js";
import { ForbiddenError } from "../errors/errors.js";
import { z } from "zod";
import {
  createAnimalProfileSchema,
  listShelterAnimalsQuerySchema,
  replaceAnimalTagsSchema,
  updateAnimalProfileSchema,
} from "../validation/schemas.js";
import {
  createAnimalProfile,
  getAnimalProfile,
  getAnimalProfilesByShelter,
  replaceAnimalTags,
  updateAnimalProfile,
} from "../services/animalProfileService.js";

export const router = express.Router({ mergeParams: true });

router.get(
  "/me/animals",
  authenticationHandler,
  checkRole("shelter"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      // checkRole also allows admins; this endpoint is restricted to shelters.
      if (auth.role !== "shelter") {
        throw new ForbiddenError("Forbidden");
      }

      const { page, limit, sort, order, speciesId, search } = zodValidation(
        listShelterAnimalsQuerySchema,
        req.query,
      );
      const result = await getAnimalProfilesByShelter(
        auth.sub,
        page,
        limit,
        sort,
        order,
        { speciesId, search },
      );
      res.status(200).json(result);
    } catch (error: unknown) {
      next(error);
    }
  },
);

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

router.get(
  "/me/animals/:animalId",
  authenticationHandler,
  checkRole("shelter"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const animalId = zodValidation(z.uuid(), req.params.animalId);
      const animalProfile = await getAnimalProfile(auth.sub, animalId);
      res.status(200).json(animalProfile);
    } catch (error: unknown) {
      next(error);
    }
  },
);

router.patch(
  "/me/animals/:animalId",
  authenticationHandler,
  checkRole("shelter"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const animalId = zodValidation(z.uuid(), req.params.animalId);
      const request = zodValidation(updateAnimalProfileSchema, req.body);
      const animalProfile = await updateAnimalProfile(
        auth.sub,
        animalId,
        request,
      );
      res.status(200).json(animalProfile);
    } catch (error: unknown) {
      next(error);
    }
  },
);

router.put(
  "/me/animals/:animalId/tags",
  authenticationHandler,
  checkRole("shelter"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const animalId = zodValidation(z.uuid(), req.params.animalId);
      const { tagIds } = zodValidation(replaceAnimalTagsSchema, req.body);
      const tags = await replaceAnimalTags(auth.sub, animalId, tagIds);
      res.status(200).json(tags);
    } catch (error: unknown) {
      next(error);
    }
  },
);

