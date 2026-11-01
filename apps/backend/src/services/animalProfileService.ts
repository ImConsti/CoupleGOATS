import type { z } from "zod";
import type { createAnimalProfileSchema } from "../validation/schemas.js";
import { type Breed, findBreedById } from "../repositories/breedRepository.js";
import { UnprocessableEntityError } from "../errors/errors.js";
import {
  insertAnimal,
  insertAnimalTags,
} from "../repositories/animalRepository.js";
import { findTagsByIds, type Tag } from "../repositories/tagRepository.js";
import type { InferSelectModel } from "drizzle-orm";
import { animals } from "../db/schema.js";
import { db } from "../db/db.js";
import {
  findSpeciesById,
  type Species,
} from "../repositories/speciesRepository.js";

type AnimalProfileRelations = { species: Species; breed: Omit<Breed, "speciesId"> | null; tags: Tag[] };

type AnimalProfile = Omit<
  InferSelectModel<typeof animals>,
  "breedId" | "speciesId"
> & AnimalProfileRelations;

export async function createAnimalProfile(
  shelterId: string,
  request: z.infer<typeof createAnimalProfileSchema>,
): Promise<AnimalProfile> {
  const { tagIds, ...animalFields } = request;
  const {species, breed, tags} = await resolveAnimalRelations(animalFields.speciesId, tagIds, animalFields.breedId );

  return await db.transaction(async (trx) => {
    const animal  = await insertAnimal(
      shelterId,
      animalFields,
      trx,
    );
    await insertAnimalTags(animal.id, tags.map((tag) => tag.id), trx);
    return {
      id: animal.id,
      animalShelterId: animal.animalShelterId,
      name: animal.name,
      species,
      breed,
      birthYear: animal.birthYear,
      gender: animal.gender,
      requiredExperience: animal.requiredExperience,
      description: animal.description,
      createdAt: animal.createdAt,
      updatedAt: animal.updatedAt,
      tags,
    };
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