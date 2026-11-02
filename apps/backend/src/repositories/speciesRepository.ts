import { db } from "../db/db.js";
import { mapDatabaseError } from "../errors/map-database-error.js";
import type { Species } from "../types.js";

export async function speciesExistsById(id: string): Promise<boolean>{
  try {
    const species = await db.query.species.findFirst({
      where: (s, {eq} ) => eq(s.id, id),
      columns: {
        id: true,
      }
    })
    return species !== undefined;
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}

export async function findSpeciesById(id: string): Promise<Species | undefined>{
  try {

    return await db.query.species.findFirst({
      where: (species, { eq }) => eq(species.id, id),
      columns: {
        id: true,
        name: true,
      },
    });
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}

export async function findAllSpecies(): Promise<Species[]> {
  try {
    return await db.query.species.findMany({
      columns: {
        id: true,
        name: true,
      },
    });
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}
