import type { z } from "zod";
import type {
  createAnimalProfileSchema,
  updateAnimalProfileSchema,
} from "../validation/schemas.js";
import { db, type DbOrTrx } from "../db/db.js";
import { animals, animalsTags } from "../db/schema.js";
import { mapDatabaseError } from "../errors/map-database-error.js";
import { DatabaseError } from "../errors/errors.js";
import { and, eq, type InferSelectModel } from "drizzle-orm";
import type { Breed } from "./breedRepository.js";
import type { Species } from "./speciesRepository.js";
import type { Tag } from "./tagRepository.js";

export type AnimalProfileRelations = {
  species: Species;
  breed: Omit<Breed, "speciesId"> | null;
  tags: Tag[];
};

export type AnimalProfile = Omit<
  InferSelectModel<typeof animals>,
  "breedId" | "speciesId"
> &
  AnimalProfileRelations;

export type AnimalUpdateFields = Omit<
  z.infer<typeof updateAnimalProfileSchema>,
  "tagIds"
>;

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

export async function findAnimalProfileById(
  animalId: string,
  shelterId: string,
  exec: DbOrTrx = db,
): Promise<AnimalProfile | undefined> {
  try {
    const animal = await exec.query.animals.findFirst({
      where: (animal, { and, eq }) =>
        and(eq(animal.id, animalId), eq(animal.animalShelterId, shelterId)),
      with: {
        species: { columns: { id: true, name: true } },
        breed: { columns: { id: true, name: true } },
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
      },
    });
    if (!animal) {
      return undefined;
    }
    return {
      id: animal.id,
      animalShelterId: animal.animalShelterId,
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      birthYear: animal.birthYear,
      gender: animal.gender,
      requiredExperience: animal.requiredExperience,
      description: animal.description,
      createdAt: animal.createdAt,
      updatedAt: animal.updatedAt,
      tags: animal.animalsTags
        .map((animalTag) => animalTag.tag)
        .sort((a, b) => a.name.localeCompare(b.name, "de")),
    };
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}

export async function animalExistsForShelter(
  animalId: string,
  shelterId: string,
  exec: DbOrTrx = db,
): Promise<boolean> {
  try {
    const animal = await exec.query.animals.findFirst({
      where: (animal, { and, eq }) =>
        and(eq(animal.id, animalId), eq(animal.animalShelterId, shelterId)),
      columns: { id: true },
    });
    return animal !== undefined;
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}

export async function updateAnimal(
  animalId: string,
  shelterId: string,
  data: AnimalUpdateFields,
  exec: DbOrTrx = db,
): Promise<boolean> {
  try {
    const updated = await exec
      .update(animals)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(
        and(eq(animals.id, animalId), eq(animals.animalShelterId, shelterId)),
      )
      .returning({ id: animals.id });
    return updated.length > 0;
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}

export async function deleteAnimalTags(
  animalId: string,
  exec: DbOrTrx = db,
): Promise<void> {
  try {
    await exec.delete(animalsTags).where(eq(animalsTags.animalId, animalId));
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}
