/**
 * DEMO-DATEN: Das Frontend ohne Backend ausprobieren.
 * Diese Datei wird nur von src/lib/animals.ts benutzt (Markierung DEMO-ZEILE / DEMO-ANFANG).
 * Zum Ausstieg aus der Demo: diese Datei löschen (siehe demo_anleitung.md).
 *
 * Test-IDs:  demo-1 (Bello), demo-2 (Minka), demo-3 (Schnuffel, ohne Rasse)
 *            fremdes-tier -> "Keine Berechtigung" (403), alles andere -> "Tier nicht gefunden" (404)
 */
import {ApiError, type Animal, type AnimalPicture, type Breed, type Species, type Tag} from "@/lib/animals";

const DEMO_SPECIES: Species[] = [
    {id: "species-dog", name: "Hund"},
    {id: "species-cat", name: "Katze"},
    {id: "species-rabbit", name: "Kaninchen"},
];

const DEMO_BREEDS: Breed[] = [
    {id: "breed-labrador", species: "species-dog", name: "Labrador"},
    {id: "breed-shepherd", species: "species-dog", name: "Deutscher Schäferhund"},
    {id: "breed-beagle", species: "species-dog", name: "Beagle"},
    {id: "breed-mainecoon", species: "species-cat", name: "Maine Coon"},
    {id: "breed-bkh", species: "species-cat", name: "Britisch Kurzhaar"},
    {id: "breed-dwarf", species: "species-rabbit", name: "Zwergkaninchen"},
];

const DEMO_TAGS: Tag[] = [
    {id: "tag-cuddly", name: "verschmust", category: "personality"},
    {id: "tag-playful", name: "verspielt", category: "personality"},
    {id: "tag-shy", name: "schüchtern", category: "personality"},
    {id: "tag-calm", name: "ruhig", category: "energy level"},
    {id: "tag-active", name: "sehr aktiv", category: "energy level"},
    {id: "tag-kids", name: "kinderlieb", category: "social behavior"},
    {id: "tag-dogs", name: "verträgt andere Hunde", category: "social behavior"},
    {id: "tag-garden", name: "braucht Garten", category: "living environment"},
    {id: "tag-medication", name: "braucht Medikamente", category: "special needs"},
];

/** Platzhalter-Foto (gezeichnete Pfote auf Farbverlauf), damit die Galerie etwas anzeigt. */
function demoPicture(id: string, from: string, to: string, showOnCard = false): AnimalPicture {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><g fill="white" fill-opacity="0.85"><ellipse cx="200" cy="185" rx="55" ry="45"/><circle cx="135" cy="125" r="20"/><circle cx="180" cy="100" r="20"/><circle cx="220" cy="100" r="20"/><circle cx="265" cy="125" r="20"/></g></svg>`;
    return {id, showOnCard, url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`};
}

const tag = (id: string) => DEMO_TAGS.find((t) => t.id === id)!;

const DEMO_ANIMALS: Animal[] = [
    {
        id: "demo-1",
        name: "Bello",
        species: DEMO_SPECIES[0],
        breed: DEMO_BREEDS[1],
        birthYear: 2020,
        gender: "male",
        requiredExperience: "experienced",
        description: "Bello ist ein freundlicher Schäferhund-Rüde, der viel Auslauf braucht. Er ist gut erzogen und läuft sehr gern neben dem Fahrrad.",
        tags: [tag("tag-cuddly"), tag("tag-active"), tag("tag-kids"), tag("tag-garden")],
        pictures: [
            demoPicture("pic-1a", "#065f46", "#34d399", true),
            demoPicture("pic-1b", "#9a3412", "#fb923c"),
            demoPicture("pic-1c", "#1e3a8a", "#60a5fa"),
        ],
    },
    {
        id: "demo-2",
        name: "Minka",
        species: DEMO_SPECIES[1],
        breed: DEMO_BREEDS[3],
        birthYear: 2023,
        gender: "female",
        requiredExperience: "beginner",
        description: "Minka ist eine verspielte junge Katze. Sie liebt Kratzbäume und Federspielzeug und ist auch für Anfänger gut geeignet.",
        tags: [tag("tag-playful"), tag("tag-kids")],
        pictures: [demoPicture("pic-2a", "#9d174d", "#f472b6", true)],
    },
    {
        id: "demo-3",
        name: "Schnuffel",
        species: DEMO_SPECIES[2],
        breed: null, // Rasse ist optional
        birthYear: 2022,
        gender: "unknown",
        requiredExperience: "beginner",
        description: "Schnuffel ist ein ruhiges, etwas schüchternes Kaninchen und sucht ein Zuhause mit Artgenossen.",
        tags: [tag("tag-shy"), tag("tag-calm")],
    },
];

/** Künstliche Wartezeit, damit man auch die Ladeanzeigen sieht. */
function delay<T>(value: T, ms = 400): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function demo_fetchMyAnimals(): Promise<Animal[]> {
    return delay(DEMO_ANIMALS);
}

export async function demo_fetchMyAnimal(animalId: string): Promise<Animal> {
    await delay(null);
    if (animalId === "fremdes-tier") throw new ApiError(403, "Demo: fremdes Tier");
    const animal = DEMO_ANIMALS.find((a) => a.id === animalId);
    if (!animal) throw new ApiError(404, "Demo: Tier nicht gefunden");
    return animal;
}

export function demo_fetchSpecies(): Promise<Species[]> {
    return delay(DEMO_SPECIES);
}

export function demo_fetchBreeds(speciesId: string): Promise<Breed[]> {
    return delay(DEMO_BREEDS.filter((b) => b.species === speciesId), 200);
}

export function demo_fetchTags(): Promise<Tag[]> {
    return delay(DEMO_TAGS);
}
