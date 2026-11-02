import {
  findAllSpecies,
  type Species,
} from "../repositories/speciesRepository.js";

export async function getAllSpecies(): Promise<Species[]> {
  const species = await findAllSpecies();
  return species.sort((a, b) => a.name.localeCompare(b.name, "de"));
}
