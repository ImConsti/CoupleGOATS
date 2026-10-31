import {
  type Breed,
  findBreedsBySpecies,
} from "../repositories/breedRepository.js";
import { NotFoundError } from "../errors/errors.js";
import { speciesExistsById } from "../repositories/speciesRepository.js";

export async function getBreedsBySpecies(speciesId: string): Promise<Breed[]> {
  const speciesExists = await speciesExistsById(speciesId);
  if (!speciesExists) {
    throw new NotFoundError("Species not found");
  }
  const breeds = await findBreedsBySpecies(speciesId);
  return breeds.sort((a, b) => a.name.localeCompare(b.name, "de"));
}
