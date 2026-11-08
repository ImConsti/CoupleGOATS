import { db } from "../db/db.js";
import { animals, animalsTags } from "../db/schema.js";
import { mapDatabaseError } from "../errors/map-database-error.js";
import { DatabaseError } from "../errors/errors.js";
import { and, eq, asc, desc, sql, like, SQL, count } from "drizzle-orm";
import type {
  Animal,
  AnimalCreateFields,
  AnimalFilters,
  AnimalListParams,
  AnimalProfile,
  AnimalRow,
  AnimalUpdateFields,
  DbOrTrx,
} from "../types.js";

const animalProfileWith = {
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
} as const;

export async function insertAnimal(
  shelterId: string,
  data: AnimalCreateFields,
  exec: DbOrTrx = db,
): Promise<Animal> {
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
      with: animalProfileWith,
    });
    if (!animal) {
      return undefined;
    }
    return toAnimalProfile(animal);
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}

export async function findAnimalProfilesByShelterId(
  shelterId: string,
  params: AnimalListParams,
): Promise<AnimalProfile[]> {
  try {
    const { offset, limit, sort, order, filters = {} } = params;
    const dir = order === "asc" ? asc : desc;
    const rows = await db.query.animals.findMany({
      where: buildAnimalWhere(shelterId, filters),
      with: animalProfileWith,
      orderBy: [
        dir(
          sort === "name"
            ? sql`${animals.name} COLLATE NOCASE`
            : animals.createdAt,
        ),
        asc(animals.id),
      ],
      limit,
      offset,
    });
    return rows.map((animal) => toAnimalProfile(animal));
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}

export async function countAnimalsByShelterId(
  shelterId: string,
  filters: AnimalFilters = {},
): Promise<number> {
  try {
    const [result] = await db
      .select({ total: count() })
      .from(animals)
      .where(buildAnimalWhere(shelterId, filters));

    return result?.total ?? 0;
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
      .set({ ...data})
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

function toAnimalProfile(animal: AnimalRow): AnimalProfile {
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
}

function buildAnimalWhere(
  shelterId: string,
  filters: AnimalFilters = {},
): SQL | undefined {
  return and(
    eq(animals.animalShelterId, shelterId),
    filters.speciesId ? eq(animals.speciesId, filters.speciesId) : undefined,
    filters.search ? like(animals.name, `%${filters.search}%`) : undefined,
  );
}
