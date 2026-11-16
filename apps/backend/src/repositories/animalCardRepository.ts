import { db } from "../db/db.js";
import { mapDatabaseError } from "../errors/map-database-error.js";
import type { AnimalCardRow } from "../types.js";

export async function findAnimalCardRowsByIds(
  animalIds: string[],
): Promise<AnimalCardRow[]> {
  if (animalIds.length === 0) {
    return [];
  }
  try {
    return await db.query.animals.findMany({
      where: (animal, { inArray }) => inArray(animal.id, animalIds),
      columns: { id: true, name: true, birthYear: true, gender: true },
      with: {
        species: { columns: { id: true, name: true } },
        breed: { columns: { id: true, name: true } },
        animalShelter: { columns: { id: true, name: true, city: true } },
        animalsTags: {
          columns: {},
          with: {
            tag: {
              columns: {
                id: true,
                name: true,
                category: true,
                affectsMatching: true,
                isCritical: true,
              },
            },
          },
        },
        animalPictures: {
          columns: { id: true },
          where: (picture, { eq }) => eq(picture.showOnCard, true),
          limit: 1,
        },
      },
    });
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}
