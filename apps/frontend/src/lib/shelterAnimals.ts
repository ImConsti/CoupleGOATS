/**
 * API-Funktionen für die Tierverwaltung eines Tierheims (Liste, Einzelansicht, Bearbeiten, Löschen).
 * Das Erstellen (createAnimal) bleibt unverändert in "@/lib/animals".
 *
 * Backend-Endpunkte (alle: Rolle "shelter", Bearer-Token):
 *   GET    /api/v1/shelters/me/animals            -> Liste (paginiert)
 *   GET    /api/v1/shelters/me/animals/:id        -> ein Tier
 *   PATCH  /api/v1/shelters/me/animals/:id        -> Tier ändern (inkl. tagIds)
 *   DELETE /api/v1/shelters/me/animals/:id        -> Tier löschen (204)
 */
import {getToken} from "@/lib/auth";
import {
    emptyAnimalForm,
    type AnimalFormErrors,
    type AnimalFormValues,
    type ExperienceLevel,
    type Gender,
    type Tag,
} from "@/lib/animals";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const ANIMALS_URL = `${API_URL}/api/v1/shelters/me/animals`;

/** So liefert das Backend ein Tierprofil. */
export type AnimalProfile = {
    id: string;
    animalShelterId: string;
    name: string;
    species: {id: string; name: string};
    breed: {id: string; name: string} | null;
    birthYear: number;
    gender: Gender;
    requiredExperience: ExperienceLevel;
    description: string;
    createdAt: string;
    updatedAt: string;
    tags: Tag[];
};

export type AnimalSort = "name" | "createdAt";
export type SortOrder = "asc" | "desc";

export type AnimalListParams = {
    page?: number;
    limit?: number;
    sort?: AnimalSort;
    order?: SortOrder;
    speciesId?: string;
    search?: string;
};

export type AnimalList = {
    items: AnimalProfile[];
    meta: {page: number; limit: number; total: number};
};

export class ApiError extends Error {
    status: number;
    constructor(status: number, message = `Request failed with ${status}`) {
        super(message);
        this.status = status;
    }
}

function authHeaders(): Record<string, string> {
    return {Authorization: `Bearer ${getToken() ?? ""}`};
}

async function request(url: string, init: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, {
        ...init,
        headers: {...authHeaders(), ...(init.headers ?? {})},
    });
    if (!response.ok) {
        const data = await response.clone().json().catch(() => null);
        throw new ApiError(response.status, data?.error?.message);
    }
    return response;
}

export async function fetchMyAnimals(params: AnimalListParams = {}): Promise<AnimalList> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.sort) query.set("sort", params.sort);
    if (params.order) query.set("order", params.order);
    if (params.speciesId) query.set("speciesId", params.speciesId);
    if (params.search?.trim()) query.set("search", params.search.trim());
    const suffix = query.toString() ? `?${query}` : "";
    const response = await request(`${ANIMALS_URL}${suffix}`);
    return response.json() as Promise<AnimalList>;
}

export async function fetchMyAnimal(animalId: string): Promise<AnimalProfile> {
    const response = await request(`${ANIMALS_URL}/${animalId}`);
    return response.json() as Promise<AnimalProfile>;
}

/** Backend-Tier -> Werte für das (bestehende) Tierformular. */
export function animalToFormValues(animal: AnimalProfile): AnimalFormValues {
    return {
        ...emptyAnimalForm,
        name: animal.name,
        speciesId: animal.species.id,
        breedId: animal.breed?.id ?? "",
        birthYear: String(animal.birthYear),
        gender: animal.gender,
        requiredExperience: animal.requiredExperience,
        description: animal.description,
        tagIds: animal.tags.map((tag) => tag.id),
    };
}

export type UpdateAnimalResult =
    | {ok: true; animal: AnimalProfile}
    | {ok: false; kind: "validation" | "auth" | "notFound" | "server" | "network"; errors: AnimalFormErrors};

const FIELD_NAMES = Object.keys(emptyAnimalForm) as (keyof AnimalFormValues)[];

function mapValidationMessage(message: string): AnimalFormErrors {
    const errors: AnimalFormErrors = {};
    for (const part of message.split(";")) {
        const field = part.trim().replace(/^invalid\s+/, "").split(",")[0].trim() as keyof AnimalFormValues;
        if (FIELD_NAMES.includes(field)) errors[field] = "Dieser Wert wurde vom Server abgelehnt. Bitte prüfe deine Eingabe.";
    }
    if (Object.keys(errors).length === 0) {
        errors.form = "Das Tierprofil konnte nicht gespeichert werden. Bitte prüfe deine Eingaben.";
    }
    return errors;
}

export async function updateMyAnimal(animalId: string, values: AnimalFormValues): Promise<UpdateAnimalResult> {
    const body = {
        name: values.name.trim(),
        speciesId: values.speciesId,
        breedId: values.breedId || null, // null = Rasse entfernen
        birthYear: Number(values.birthYear),
        gender: values.gender,
        requiredExperience: values.requiredExperience,
        description: values.description.trim(),
        tagIds: values.tagIds,
    };

    let response: Response;
    try {
        response = await fetch(`${ANIMALS_URL}/${animalId}`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json", ...authHeaders()},
            body: JSON.stringify(body),
        });
    } catch {
        return {
            ok: false,
            kind: "network",
            errors: {form: "Der Server ist nicht erreichbar. Bitte prüfe deine Verbindung und versuche es erneut."},
        };
    }

    if (response.ok) return {ok: true, animal: (await response.json()) as AnimalProfile};

    if (response.status === 401 || response.status === 403) {
        return {
            ok: false,
            kind: "auth",
            errors: {form: "Deine Sitzung ist abgelaufen oder du hast keine Berechtigung. Bitte melde dich erneut an."},
        };
    }
    if (response.status === 404) {
        return {ok: false, kind: "notFound", errors: {form: "Dieses Tierprofil existiert nicht mehr."}};
    }

    const data = await response.json().catch(() => null);
    const message: string = data?.error?.message ?? "";

    if (response.status === 400) {
        return {ok: false, kind: "validation", errors: mapValidationMessage(message)};
    }
    if (response.status === 422) {
        return {
            ok: false,
            kind: "validation",
            errors: {form: "Tierart, Rasse oder ein Tag existiert nicht mehr. Bitte lade die Seite neu und wähle erneut."},
        };
    }
    return {
        ok: false,
        kind: "server",
        errors: {form: "Beim Speichern ist ein Serverfehler aufgetreten. Bitte versuche es später erneut."},
    };
}

/**
 * Löscht ein Tier (Backend: DELETE /shelters/me/animals/:id -> 204).
 * TODO: Noch nirgends verwendet. Die Löschen-Buttons sind absichtlich deaktiviert;
 *       zum Aktivieren hier aufrufen (mit Bestätigungsdialog) und danach die Liste neu laden.
 */
export async function deleteMyAnimal(animalId: string): Promise<void> {
    await request(`${ANIMALS_URL}/${animalId}`, {method: "DELETE"});
}
