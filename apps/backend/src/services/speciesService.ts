import { findAllSpecies } from "../repositories/speciesRepository.js";
import type { Species } from "../types.js";

export async function getAllSpecies(): Promise<Species[]> {
  const species = await findAllSpecies();
  return species.sort((a, b) => a.name.localeCompare(b.name, "de"));
}
