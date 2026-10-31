import { db } from "../db/db.js";
import { mapDatabaseError } from "../errors/map-database-error.js";

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