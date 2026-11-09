import {getToken} from "@/lib/auth";
import {demo_fetchBreeds, demo_fetchMyAnimal, demo_fetchMyAnimals, demo_fetchSpecies, demo_fetchTags} from "@/lib/demo_data"; // DEMO-ZEILE

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Gender = "male" | "female" | "unknown";
export type ExperienceLevel = "beginner" | "experienced" | "expert";

export type Species = { id: string; name: string };
export type Breed = { id: string; species: string; name: string };
export type Tag = { id: string; name: string; category?: string };

/** Foto eines Tieres (aus AnimalDetail.pictures). */
export type AnimalPicture = { id: string; showOnCard: boolean; url: string };

/** Tierprofil, wie es das Backend liefert (GET /shelters/me/animals/{id}). */
export type Animal = {
    id: string;
    name: string;
    // laut openapi.yaml Objekte, zur Sicherheit werden auch reine IDs akzeptiert
    species: Species | string;
    breed: Breed | string | null; // Rasse ist optional
    birthYear: number;
    gender: Gender;
    requiredExperience: ExperienceLevel;
    description: string;
    tags?: Tag[];
    pictures?: AnimalPicture[];
};

/** Deutsche Namen der Tag-Kategorien (die Schlüssel kommen so aus dem Backend). */
export const TAG_CATEGORY_LABELS: Record<string, string> = {
    "personality": "Persönlichkeit",
    "energy level": "Energielevel",
    "training & experience": "Training & Erfahrung",
    "living environment": "Wohnumgebung",
    "social behavior": "Sozialverhalten",
    "time & attention": "Zeit & Aufmerksamkeit",
    "special needs": "Besondere Bedürfnisse",
    "lifestyle": "Lebensstil",
};

export function categoryLabel(category: string): string {
    return TAG_CATEGORY_LABELS[category] ?? category;
}

/** Bild-URL fürs <img>: Backend-Pfade (/api/...) bekommen die API-Adresse davor. */
export function pictureSrc(url: string): string {
    return url.startsWith("/api/") ? `${API_URL}${url}` : url;
}

export const GENDER_LABELS: Record<Gender, string> = {
    male: "Männlich",
    female: "Weiblich",
    unknown: "Unbekannt",
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
    beginner: "Anfänger",
    experienced: "Erfahren",
    expert: "Experte",
};

/** Fehler mit HTTP-Status (0 = Server nicht erreichbar). */
export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

async function apiGet<T>(path: string, withAuth: boolean): Promise<T> {
    const headers: Record<string, string> = {};
    const token = getToken();
    if (withAuth && token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response: Response;
    try {
        response = await fetch(`${API_URL}/api/v1${path}`, {headers});
    } catch {
        throw new ApiError(0, "Der Server ist nicht erreichbar.");
    }

    if (!response.ok) {
        throw new ApiError(response.status, `Anfrage fehlgeschlagen (${response.status})`);
    }
    return response.json() as Promise<T>;
}

/** Alle eigenen Tiere des angemeldeten Tierheims. */
export function fetchMyAnimals(): Promise<Animal[]> {
    // DEMO-ANFANG
    return demo_fetchMyAnimals();
    // DEMO-ENDE
    // NORMAL-ANFANG
    // return apiGet<Animal[]>("/shelters/me/animals", true);
    // NORMAL-ENDE
}

/** Ein eigenes Tier (403 = fremdes Tier, 404 = gibt es nicht). */
export function fetchMyAnimal(animalId: string): Promise<Animal> {
    // DEMO-ANFANG
    return demo_fetchMyAnimal(animalId);
    // DEMO-ENDE
    // NORMAL-ANFANG
    // return apiGet<Animal>(`/shelters/me/animals/${encodeURIComponent(animalId)}`, true);
    // NORMAL-ENDE
}

export function fetchSpecies(): Promise<Species[]> {
    // DEMO-ANFANG
    return demo_fetchSpecies();
    // DEMO-ENDE
    // NORMAL-ANFANG
    // return apiGet<Species[]>("/species", false);
    // NORMAL-ENDE
}

export function fetchBreeds(speciesId: string): Promise<Breed[]> {
    // DEMO-ANFANG
    return demo_fetchBreeds(speciesId);
    // DEMO-ENDE
    // NORMAL-ANFANG
    // return apiGet<Breed[]>(`/species/${encodeURIComponent(speciesId)}/breeds`, false);
    // NORMAL-ENDE
}

type GroupedTags = { category: string; tags: Tag[] };

/**
 * Das Backend liefert die Tags nach Kategorie gruppiert ([{category, tags: [...]}]).
 * Hier werden sie zu einer flachen Liste, in der jeder Tag seine Kategorie kennt.
 * Eine bereits flache Liste wird ebenfalls akzeptiert.
 */
export async function fetchTags(): Promise<Tag[]> {
    // DEMO-ANFANG
    return demo_fetchTags();
    // DEMO-ENDE
    // NORMAL-ANFANG
    // const data = await apiGet<(Tag | GroupedTags)[]>("/tags", false);
    // return data.flatMap((entry) =>
    //     "tags" in entry
    //         ? entry.tags.map((tag) => ({...tag, category: tag.category ?? entry.category}))
    //         : [entry],
    // );
    // NORMAL-ENDE
}

/** Name der Tierart bzw. Rasse für die Anzeige. */
export function nameOf(value: Species | Breed | string | null): string {
    return value === null || typeof value === "string" ? "" : value.name;
}

/** ID der Tierart bzw. Rasse. */
export function idOf(value: Species | Breed | string | null): string {
    if (value === null) return "";
    return typeof value === "string" ? value : value.id;
}
