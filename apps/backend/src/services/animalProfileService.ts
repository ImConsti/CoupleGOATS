import { findBreedById } from "../repositories/breedRepository.js";
import {
  NotFoundError,
  UnprocessableEntityError,
} from "../errors/errors.js";
import {
  animalExistsForShelter,
  deleteAnimalTags,
  findAnimalProfileById,
  insertAnimal,
  insertAnimalTags,
  updateAnimal,
} from "../repositories/animalRepository.js";
import { findTagsByIds } from "../repositories/tagRepository.js";
import { db } from "../db/db.js";
import { findSpeciesById } from "../repositories/speciesRepository.js";
import type {
  AnimalProfile,
  AnimalProfileRelations,
  CreateAnimalProfileInput,
  DbOrTrx,
  Tag,
  UpdateAnimalProfileInput,
} from "../types.js";

export async function createAnimalProfile(
  shelterId: string,
  request: CreateAnimalProfileInput,
): Promise<AnimalProfile> {
  const { tagIds, ...animalFields } = request;
  await resolveAnimalRelations(animalFields.speciesId, tagIds, animalFields.breedId );

  return await db.transaction(async (trx) => {
    const animal  = await insertAnimal(
      shelterId,
      animalFields,
      trx,
    );
    await insertAnimalTags(animal.id, tagIds, trx);
    return await loadProfile(animal.id, shelterId, trx);
  });
}

async function resolveAnimalRelations(speciesId: string, tagIds: string[], breedId: string | null = null): Promise<AnimalProfileRelations> {
  let breed: AnimalProfileRelations["breed"] | null = null;
  const species = await findSpeciesById(speciesId);
  if (!species) {
    throw new UnprocessableEntityError("Species does not exist");
  }

  if (breedId) {
    const foundBreed = await findBreedById(breedId);
    if (!foundBreed) {
      throw new UnprocessableEntityError("Breed does not exist");
    }
    if (foundBreed.speciesId !== speciesId) {
      throw new UnprocessableEntityError("Breed does not belong to species");
    }
    breed = { id: foundBreed.id, name: foundBreed.name };
  }

  const tags = await findTagsByIds(tagIds);
  if (tags.length !== tagIds.length) {
    throw new UnprocessableEntityError("One or more tags do not exist");
  }
  return {species, breed, tags}
}

export async function getAnimalProfile(
  shelterId: string,
  animalId: string,
): Promise<AnimalProfile> {
  const animalProfile = await findAnimalProfileById(animalId, shelterId);
  if (!animalProfile) {
    throw new NotFoundError("Animal not found");
  }
  return animalProfile;
}

export async function updateAnimalProfile(
  shelterId: string,
  animalId: string,
  request: UpdateAnimalProfileInput,
): Promise<AnimalProfile> {
  const current = await getAnimalProfile(shelterId, animalId);
  const { tagIds, ...animalFields } = request;

  const relationsChanged =
    animalFields.speciesId !== undefined ||
    animalFields.breedId !== undefined ||
    tagIds !== undefined;
  if (relationsChanged) {
    const speciesId = animalFields.speciesId ?? current.species.id;
    const breedId =
      animalFields.breedId !== undefined
        ? animalFields.breedId
        : (current.breed?.id ?? null);
    await resolveAnimalRelations(speciesId, tagIds ?? [], breedId);
  }

  return await db.transaction(async (trx) => {
    const updated = await updateAnimal(animalId, shelterId, animalFields, trx);
    if (!updated) {
      throw new NotFoundError("Animal not found");
    }
    if (tagIds !== undefined) {
      await replaceTags(animalId, tagIds, trx);
    }
    return await loadProfile(animalId, shelterId, trx);
  });
}

export async function replaceAnimalTags(
  shelterId: string,
  animalId: string,
  tagIds: string[],
): Promise<Tag[]> {
  if (!(await animalExistsForShelter(animalId, shelterId))) {
    throw new NotFoundError("Animal not found");
  }
  const tags = await findTagsByIds(tagIds);
  if (tags.length !== tagIds.length) {
    throw new UnprocessableEntityError("One or more tags do not exist");
  }

  return await db.transaction(async (trx) => {
    const updated = await updateAnimal(animalId, shelterId, {}, trx);
    if (!updated) {
      throw new NotFoundError("Animal not found");
    }
    await replaceTags(animalId, tagIds, trx);
    return (await loadProfile(animalId, shelterId, trx)).tags;
  });
}

async function replaceTags(
  animalId: string,
  tagIds: string[],
  trx: DbOrTrx,
): Promise<void> {
  await deleteAnimalTags(animalId, trx);
  await insertAnimalTags(animalId, tagIds, trx);
}

async function loadProfile(
  animalId: string,
  shelterId: string,
  trx: DbOrTrx,
): Promise<AnimalProfile> {
  const animalProfile = await findAnimalProfileById(animalId, shelterId, trx);
  if (!animalProfile) {
    throw new NotFoundError("Animal not found");
  }
  return animalProfile;
}

