import {getToken} from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Species = {id: string; name: string};
export type Breed = {id: string; name: string; speciesId?: string};
export type Tag = {
    id: string;
    name: string;
    category: string;
    affectsMatching: boolean;
    isCritical: boolean;
};
export type TagGroup = {category: string; tags: Tag[]};

export type Gender = "male" | "female" | "unknown";
export type ExperienceLevel = "beginner" | "experienced" | "expert";

export type AnimalFormValues = {
    name: string;
    speciesId: string;
    breedId: string;
    birthYear: string;
    gender: Gender | "";
    requiredExperience: ExperienceLevel | "";
    description: string;
    tagIds: string[];
};

export type AnimalFormErrors = Partial<Record<keyof AnimalFormValues, string>> & {form?: string};

export const emptyAnimalForm: AnimalFormValues = {
    name: "",
    speciesId: "",
    breedId: "",
    birthYear: "",
    gender: "",
    requiredExperience: "",
    description: "",
    tagIds: [],
};

export const GENDER_OPTIONS: {value: Gender; label: string}[] = [
    {value: "female", label: "Weiblich"},
    {value: "male", label: "Männlich"},
    {value: "unknown", label: "Unbekannt"},
];

export const EXPERIENCE_OPTIONS: {value: ExperienceLevel; label: string}[] = [
    {value: "beginner", label: "Anfänger geeignet"},
    {value: "experienced", label: "Erfahrung nötig"},
    {value: "expert", label: "Experte nötig"},
];

export const ENERGY_CATEGORY = "energy level";

export const CATEGORY_LABELS: Record<string, string> = {
    "personality": "Persönlichkeit",
    "energy level": "Energielevel",
    "training & experience": "Training & Erfahrung",
    "living environment": "Wohnumgebung",
    "social behavior": "Sozialverhalten",
    "time & attention": "Zeit & Aufmerksamkeit",
    "special needs": "Besondere Bedürfnisse",
    "lifestyle": "Lebensstil",
};

export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_NAME_LENGTH = 100;

export function validateAnimalForm(values: AnimalFormValues): AnimalFormErrors {
    const errors: AnimalFormErrors = {};
    const currentYear = new Date().getFullYear();

    const name = values.name.trim();
    if (!name) errors.name = "Bitte gib einen Namen ein.";
    else if (name.length > MAX_NAME_LENGTH) errors.name = `Der Name darf höchstens ${MAX_NAME_LENGTH} Zeichen lang sein.`;

    if (!values.speciesId) errors.speciesId = "Bitte wähle eine Tierart.";

    const year = values.birthYear.trim();
    if (!year) errors.birthYear = "Bitte gib ein Geburtsjahr ein.";
    else if (!/^\d{4}$/.test(year)) errors.birthYear = "Bitte gib ein vierstelliges Jahr ein, z. B. 2021.";
    else if (Number(year) < 1900 || Number(year) > currentYear) {
        errors.birthYear = `Das Geburtsjahr muss zwischen 1900 und ${currentYear} liegen.`;
    }

    if (!values.gender) errors.gender = "Bitte wähle ein Geschlecht.";
    if (!values.requiredExperience) errors.requiredExperience = "Bitte wähle die benötigte Erfahrung.";

    const description = values.description.trim();
    if (!description) errors.description = "Bitte beschreibe das Tier.";
    else if (description.length > MAX_DESCRIPTION_LENGTH) {
        errors.description = `Die Beschreibung darf höchstens ${MAX_DESCRIPTION_LENGTH} Zeichen lang sein.`;
    }

    return errors;
}

async function getJson<T>(path: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`);
    if (!response.ok) throw new Error(`Request ${path} failed with ${response.status}`);
    return response.json() as Promise<T>;
}

export const fetchSpecies = () => getJson<Species[]>("/api/v1/species");
export const fetchBreeds = (speciesId: string) => getJson<Breed[]>(`/api/v1/species/${speciesId}/breeds`);
export const fetchTagGroups = () => getJson<TagGroup[]>("/api/v1/tags");

export type CreateAnimalResult =
    | {ok: true}
    | {ok: false; kind: "validation" | "auth" | "server" | "network"; errors: AnimalFormErrors};

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

export async function createAnimal(values: AnimalFormValues): Promise<CreateAnimalResult> {
    const body = {
        name: values.name.trim(),
        speciesId: values.speciesId,
        ...(values.breedId ? {breedId: values.breedId} : {}),
        birthYear: Number(values.birthYear),
        gender: values.gender,
        requiredExperience: values.requiredExperience,
        description: values.description.trim(),
        tagIds: values.tagIds,
    };

    let response: Response;
    try {
        response = await fetch(`${API_URL}/api/v1/shelters/me/animals`, {
            method: "POST",
            headers: {"Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}`},
            body: JSON.stringify(body),
        });
    } catch {
        return {
            ok: false,
            kind: "network",
            errors: {form: "Der Server ist nicht erreichbar. Bitte prüfe deine Verbindung und versuche es erneut."},
        };
    }

    if (response.ok) return {ok: true};

    if (response.status === 401 || response.status === 403) {
        return {
            ok: false,
            kind: "auth",
            errors: {form: "Deine Sitzung ist abgelaufen oder du hast keine Berechtigung. Bitte melde dich erneut an."},
        };
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

// TEMPORÄR:
export type AnimalPicture = {
    id: string;
    url: string;
    showOnCard: boolean;
};

export function pictureSrc(url: string): string {
    return url;
}
