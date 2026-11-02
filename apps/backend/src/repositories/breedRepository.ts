import { db } from "../db/db.js";
import type { Breed } from "../types.js";
import { mapDatabaseError } from "../errors/map-database-error.js";

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

export async function findBreedById(breedId: string): Promise<Breed | undefined> {
  try {
    return await db.query.breeds.findFirst({
      where: (breed, { eq }) => eq(breed.id, breedId),
      columns: {
        id: true,
        speciesId: true,
        name: true,
      },
    });
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}