import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { getAllTagsGroupedByCategory } from "../services/tagService.js";

export const router = express.Router({ mergeParams: true });

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await getAllTagsGroupedByCategory();
    res.status(200).json(tags);
  } catch (error: unknown) {
    next(error);
  }
});
