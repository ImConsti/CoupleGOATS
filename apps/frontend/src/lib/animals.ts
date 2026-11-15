import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Gender = "male" | "female" | "unknown";
export type ExperienceLevel = "beginner" | "experienced" | "expert";

export type Species = { id: string; name: string };
export type Breed = { id: string; species: string; name: string };
export type Tag = { id: string; name: string; category?: string };

export type AnimalPicture = { id: string; showOnCard: boolean; url: string };

export type Animal = {
    id: string;
    name: string;
    species: Species | string;
    breed: Breed | string | null;
    birthYear: number;
    gender: Gender;
    requiredExperience: ExperienceLevel;
    description: string;
    tags?: Tag[];
    pictures?: AnimalPicture[];
};

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
        response = await fetch(`${API_URL}/api/v1${path}`, { headers });
    } catch {
        throw new ApiError(0, "Der Server ist nicht erreichbar.");
    }

    if (!response.ok) {
        throw new ApiError(response.status, `Anfrage fehlgeschlagen (${response.status})`);
    }
    return response.json() as Promise<T>;
}

export function fetchMyAnimals(): Promise<Animal[]> {
    return apiGet<Animal[]>("/shelters/me/animals", true);
}

export function fetchMyAnimal(animalId: string): Promise<Animal> {
    return apiGet<Animal>(`/shelters/me/animals/${encodeURIComponent(animalId)}`, true);
}

export function fetchSpecies(): Promise<Species[]> {
    return apiGet<Species[]>("/species", false);
}

export function fetchBreeds(speciesId: string): Promise<Breed[]> {
    return apiGet<Breed[]>(`/species/${encodeURIComponent(speciesId)}/breeds`, false);
}

type GroupedTags = { category: string; tags: Tag[] };

export async function fetchTags(): Promise<Tag[]> {
    const data = await apiGet<(Tag | GroupedTags)[]>("/tags", false);
    return data.flatMap((entry) =>
        "tags" in entry
            ? entry.tags.map((tag) => ({ ...tag, category: tag.category ?? entry.category }))
            : [entry],
    );
}

export function nameOf(value: Species | Breed | string | null): string {
    return value === null || typeof value === "string" ? "" : value.name;
}

export function idOf(value: Species | Breed | string | null): string {
    if (value === null) return "";
    return typeof value === "string" ? value : value.id;
}