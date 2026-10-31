import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { zodValidation } from "../validation/zod-validation.js";
import { z } from "zod";
import { getBreedsBySpecies } from "../services/breedService.js";

export const router = express.Router({ mergeParams: true });

router.get("/:speciesId/breeds", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const speciesId = zodValidation(z.uuid(), req.params.speciesId);
    const breeds = await getBreedsBySpecies(speciesId);
    res.status(200).json(breeds);
  } catch (error: unknown) {
    next(error);
  }
});
