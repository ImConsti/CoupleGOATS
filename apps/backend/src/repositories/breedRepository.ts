import { db } from "../db/db.js";
import type { InferSelectModel } from "drizzle-orm";
import type { breeds } from "../db/schema.js";
import { mapDatabaseError } from "../errors/map-database-error.js";

export type Breed = Omit<InferSelectModel<typeof breeds>, "createdAt" | "updatedAt">

export async function findBreedsBySpecies(speciesId: string): Promise<Breed[]>{
  try {
    return await db.query.breeds.findMany({
      where: (breed, {eq}) => eq(breed.speciesId, speciesId),
      columns: {
        id: true,
        speciesId: true,
        name: true,
      }
    })
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}