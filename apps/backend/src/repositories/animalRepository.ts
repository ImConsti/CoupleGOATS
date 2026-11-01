import type { z } from "zod";
import type { createAnimalProfileSchema } from "../validation/schemas.js";
import { db, type DbOrTrx } from "../db/db.js";
import { animals, animalsTags } from "../db/schema.js";
import { mapDatabaseError } from "../errors/map-database-error.js";
import { DatabaseError } from "../errors/errors.js";
import type { InferSelectModel } from "drizzle-orm";

export async function insertAnimal(
  shelterId: string,
  data: Omit<z.infer<typeof createAnimalProfileSchema>, "tagIds">,
  exec: DbOrTrx = db,
): Promise<InferSelectModel<typeof animals>> {
  try {
    const [animal] = await exec
      .insert(animals)
      .values({ ...data, animalShelterId: shelterId })
      .returning();
    if (!animal) {
      throw new DatabaseError("Failed to create animal");
    }
    return animal;
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}

export async function insertAnimalTags(
  animalId: string,
  tagIds: string[],
  exec: DbOrTrx = db,
): Promise<void> {
  try {
    if (tagIds.length > 0) {
      const tagsOfAnimal = await exec
        .insert(animalsTags)
        .values(tagIds.map((tagId) => ({ animalId, tagId })))
        .returning();
      if (tagsOfAnimal.length !== tagIds.length) {
        throw new DatabaseError("Failed to assign all tags to animal");
      }
    }
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}
