import { db } from "../db/db.js";
import { animalShelters } from "../db/schema.js";
import { mapDatabaseError } from "../errors/map-database-error.js";
import { DatabaseError } from "../errors/errors.js";

export async function getShelterByEmail(
  email: string,
): Promise<{ id: string; passwordHash: string } | undefined> {
  try {
    const shelter = await db.query.animalShelters.findFirst({
      where: (shelter, { eq }) => eq(shelter.email, email),
      columns: {
        id: true,
        passwordHash: true,
      },
    });
    if (!shelter) {
      return undefined;
    }
    return shelter;
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}

export async function shelterExistsById(id: string): Promise<boolean> {
  try {
    const shelter = await db.query.animalShelters.findFirst({
      where: (shelter, { eq }) => eq(shelter.id, id),
      columns: {
        id: true,
      },
    });
    return shelter !== undefined;
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}

export async function createShelter(
  shelter: typeof animalShelters.$inferInsert,
): Promise<{ id: string }> {
  try {
    const [created] = await db
      .insert(animalShelters)
      .values(shelter)
      .returning({ id: animalShelters.id });
    if (!created) {
      throw new DatabaseError("failed to create shelter");
    }
    return created;
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}
