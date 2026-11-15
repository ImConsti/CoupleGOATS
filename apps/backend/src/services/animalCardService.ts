import { findAnimalCardRowsByIds } from "../repositories/animalCardRepository.js";
import type { AnimalCard, AnimalCardRow } from "../types.js";

export async function getAnimalCards(animalIds: string[]): Promise<AnimalCard[]> {
  const rows = await findAnimalCardRowsByIds(animalIds);
  const cardsById = new Map(rows.map((row) => [row.id, toAnimalCard(row)]));
  return animalIds.flatMap((id) => {
    const card = cardsById.get(id);
    return card ? [card] : [];
  });
}

function toAnimalCard(row: AnimalCardRow): AnimalCard {
  return {
    id: row.id,
    name: row.name,
    species: row.species,
    breed: row.breed,
    birthYear: row.birthYear,
    gender: row.gender,
    tags: row.animalsTags
      .map((animalTag) => animalTag.tag)
      .sort((a, b) => a.name.localeCompare(b.name, "de")),
    cardPictureId: row.animalPictures[0]?.id ?? null,
    shelter: row.animalShelter,
  };
}
