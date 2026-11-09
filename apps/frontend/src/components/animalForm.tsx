"use client";

import {useEffect, useState, type FormEvent, type ReactNode} from "react";
import {
    EXPERIENCE_LABELS,
    categoryLabel,
    GENDER_LABELS,
    fetchBreeds,
    fetchSpecies,
    fetchTags,
    idOf,
    type Animal,
    type Breed,
    type ExperienceLevel,
    type Gender,
    type Species,
    type Tag,
} from "@/lib/animals";

/** Alle Formularwerte als Text bzw. ID-Liste, so wie sie in den Feldern stehen. */
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

export const EMPTY_ANIMAL_FORM_VALUES: AnimalFormValues = {
    name: "",
    speciesId: "",
    breedId: "",
    birthYear: "",
    gender: "",
    requiredExperience: "",
    description: "",
    tagIds: [],
};

/** Wandelt ein Tier vom Backend in Formularwerte um (Edit-Modus). */
export function animalToFormValues(animal: Animal): AnimalFormValues {
    return {
        name: animal.name,
        speciesId: idOf(animal.species),
        breedId: idOf(animal.breed),
        birthYear: String(animal.birthYear),
        gender: animal.gender,
        requiredExperience: animal.requiredExperience,
        description: animal.description,
        tagIds: (animal.tags ?? []).map((tag) => tag.id),
    };
}

type AnimalFormProps = {
    /** "create" = neues Tier, "edit" = vorhandenes Tier bearbeiten */
    mode: "create" | "edit";
    initialValues?: AnimalFormValues;
    /** Wird mit den geprüften Werten aufgerufen. Wirft sie einen Fehler, wird er im Formular angezeigt. */
    onSubmit: (values: AnimalFormValues) => Promise<void> | void;
    /** Abbrechen: verwirft die lokalen Änderungen, der Aufrufer navigiert zurück. */
    onCancel: () => void;
    /** Optionaler Bereich rechts neben den Feldern (z. B. die Fotos). Auf dem Handy steht er darunter. */
    aside?: ReactNode;
};

const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900";
const INPUT_BASE = `bg-white border border-gray-200 rounded-xl placeholder-gray-400 w-full px-3 text-gray-900 ${FOCUS_RING} disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed aria-[invalid=true]:border-red-500`;
const INPUT = `${INPUT_BASE} h-11`;
const TEXTAREA = `${INPUT_BASE} py-2 resize-y`;
const LABEL = "text-sm font-medium text-gray-600";
const FIELD = "flex flex-col gap-1.5 min-w-0";
const ERROR = "text-sm text-red-600";

function SectionTitle({overline, title}: {overline: string; title: string}) {
    return (
        <div className="flex flex-col gap-0.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{overline}</p>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
    );
}

type MasterData = { species: Species[]; tags: Tag[] };
type BreedsState = { speciesId: string; items: Breed[] | null }; // items null = Laden fehlgeschlagen
type FieldName = keyof AnimalFormValues;
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_IDS: Record<FieldName, string> = {
    name: "animal-name",
    speciesId: "animal-species",
    breedId: "animal-breed",
    birthYear: "animal-birth-year",
    gender: "animal-gender",
    requiredExperience: "animal-experience",
    description: "animal-description",
    tagIds: "animal-tags",
};

export default function AnimalForm({mode, initialValues = EMPTY_ANIMAL_FORM_VALUES, onSubmit, onCancel, aside}: AnimalFormProps) {

    const [values, setValues] = useState<AnimalFormValues>(initialValues);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Stammdaten (Tierarten + Tags) und Rassen der gewählten Tierart
    const [masterData, setMasterData] = useState<MasterData | "error" | null>(null);
    const [masterDataAttempt, setMasterDataAttempt] = useState(0);
    const [breedsState, setBreedsState] = useState<BreedsState | null>(null);
    const [breedsAttempt, setBreedsAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        Promise.all([fetchSpecies(), fetchTags()])
            .then(([species, tags]) => { if (!cancelled) setMasterData({species, tags}); })
            .catch(() => { if (!cancelled) setMasterData("error"); });
        return () => { cancelled = true; };
    }, [masterDataAttempt]);

    useEffect(() => {
        if (!values.speciesId) return;
        const speciesId = values.speciesId;
        let cancelled = false;
        fetchBreeds(speciesId)
            .then((items) => { if (!cancelled) setBreedsState({speciesId, items}); })
            .catch(() => { if (!cancelled) setBreedsState({speciesId, items: null}); });
        return () => { cancelled = true; };
    }, [values.speciesId, breedsAttempt]);

    const breedsLoaded = breedsState !== null && breedsState.speciesId === values.speciesId;
    const breeds = breedsLoaded ? breedsState.items : null;
    const breedsLoading = values.speciesId !== "" && !breedsLoaded;
    const breedsFailed = breedsLoaded && breedsState.items === null;

    function retryMasterData() {
        setMasterData(null);
        setMasterDataAttempt((attempt) => attempt + 1);
    }

    function retryBreeds() {
        setBreedsState(null);
        setBreedsAttempt((attempt) => attempt + 1);
    }

    function update<K extends FieldName>(field: K, value: AnimalFormValues[K]) {
        setValues((current) => ({...current, [field]: value}));
        setErrors((current) => ({...current, [field]: undefined}));
    }

    function changeSpecies(speciesId: string) {
        // andere Tierart -> bisherige Rasse passt nicht mehr
        setValues((current) => ({...current, speciesId, breedId: ""}));
        setErrors((current) => ({...current, speciesId: undefined, breedId: undefined}));
    }

    function toggleTag(tag: Tag, allTags: Tag[]) {
        if (values.tagIds.includes(tag.id)) {
            update("tagIds", values.tagIds.filter((id) => id !== tag.id));
            return;
        }
        // Pro Kategorie ist nur ein Tag möglich: andere Tags derselben Kategorie werden abgewählt
        const sameCategory = tag.category
            ? allTags.filter((other) => other.category === tag.category).map((other) => other.id)
            : [];
        update("tagIds", [...values.tagIds.filter((id) => !sameCategory.includes(id)), tag.id]);
    }

    function validate(): FieldErrors {
        const result: FieldErrors = {};
        const currentYear = new Date().getFullYear();
        const year = Number(values.birthYear);

        if (!values.name.trim()) result.name = "Bitte gib einen Namen an.";
        if (!values.speciesId) result.speciesId = "Bitte wähle eine Tierart.";
        if (!values.birthYear.trim()) {
            result.birthYear = "Bitte gib das Geburtsjahr an.";
        } else if (!Number.isInteger(year) || year < currentYear - 40 || year > currentYear) {
            result.birthYear = `Das Geburtsjahr muss zwischen ${currentYear - 40} und ${currentYear} liegen.`;
        }
        if (!values.gender) result.gender = "Bitte wähle ein Geschlecht.";
        if (!values.requiredExperience) result.requiredExperience = "Bitte wähle die benötigte Erfahrung.";
        if (!values.description.trim()) result.description = "Bitte gib eine Beschreibung an.";
        return result;
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setSubmitError("");

        const validationErrors = validate();
        setErrors(validationErrors);

        const firstInvalid = (Object.keys(FIELD_IDS) as FieldName[]).find((field) => validationErrors[field]);
        if (firstInvalid) {
            document.getElementById(FIELD_IDS[firstInvalid])?.focus();
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                ...values,
                name: values.name.trim(),
                description: values.description.trim(),
            });
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "Speichern fehlgeschlagen.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (masterData === null) {
        return <p role="status" className="text-sm text-gray-500 py-6 text-center">Formular wird geladen...</p>;
    }

    if (masterData === "error") {
        return (
            <div role="alert" className="text-sm text-gray-500 py-6 text-center">
                <p className="text-red-500">Tierarten und Tags konnten nicht geladen werden.</p>
                <button type="button" className={`mt-3 h-10 px-5 bg-white text-gray-800 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 ${FOCUS_RING}`} onClick={retryMasterData}>
                    Erneut versuchen
                </button>
            </div>
        );
    }

    // Tags nach Kategorie gruppieren (Reihenfolge wie vom Backend geliefert)
    const tagGroups = new Map<string, Tag[]>();
    for (const tag of masterData.tags) {
        const group = tag.category ?? "";
        tagGroups.set(group, [...(tagGroups.get(group) ?? []), tag]);
    }

    function describedBy(field: FieldName, hintId?: string): string | undefined {
        const ids = [errors[field] ? `${FIELD_IDS[field]}-error` : undefined, hintId].filter(Boolean);
        return ids.length ? ids.join(" ") : undefined;
    }

    function fieldError(field: FieldName) {
        return errors[field]
            ? <p id={`${FIELD_IDS[field]}-error`} className={ERROR}>{errors[field]}</p>
            : null;
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">

            <div className={aside ? "grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10" : ""}>

                {/* ---------- linke Spalte: Felder ---------- */}
                <div className="flex flex-col gap-8 min-w-0">

                    <section className="flex flex-col gap-5" aria-label="Grunddaten">
                        <SectionTitle overline="Grunddaten" title="Profildetails"/>

                        <div className={FIELD}>
                            <label htmlFor={FIELD_IDS.name} className={LABEL}>Name *</label>
                            <input
                                id={FIELD_IDS.name}
                                type="text"
                                className={INPUT}
                                placeholder="z. B. Bello"
                                value={values.name}
                                onChange={(e) => update("name", e.target.value)}
                                aria-invalid={errors.name ? true : undefined}
                                aria-describedby={describedBy("name")}
                            />
                            {fieldError("name")}
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className={FIELD}>
                                <label htmlFor={FIELD_IDS.speciesId} className={LABEL}>Tierart *</label>
                                <select
                                    id={FIELD_IDS.speciesId}
                                    className={INPUT}
                                    value={values.speciesId}
                                    onChange={(e) => changeSpecies(e.target.value)}
                                    aria-invalid={errors.speciesId ? true : undefined}
                                    aria-describedby={describedBy("speciesId")}
                                >
                                    <option value="">Bitte wählen</option>
                                    {masterData.species.map((species) => (
                                        <option key={species.id} value={species.id}>{species.name}</option>
                                    ))}
                                </select>
                                {fieldError("speciesId")}
                            </div>

                            <div className={FIELD}>
                                <label htmlFor={FIELD_IDS.breedId} className={LABEL}>Rasse</label>
                                <select
                                    id={FIELD_IDS.breedId}
                                    className={INPUT}
                                    value={values.breedId}
                                    onChange={(e) => update("breedId", e.target.value)}
                                    disabled={!values.speciesId || breedsLoading || breedsFailed}
                                    aria-invalid={errors.breedId ? true : undefined}
                                    aria-describedby={describedBy("breedId", "animal-breed-hint")}
                                >
                                    <option value="">
                                        {!values.speciesId ? "Zuerst Tierart wählen" : breedsLoading ? "Rassen werden geladen..." : "Keine Angabe"}
                                    </option>
                                    {(breeds ?? []).map((breed) => (
                                        <option key={breed.id} value={breed.id}>{breed.name}</option>
                                    ))}
                                </select>
                                {breedsFailed && (
                                    <p id="animal-breed-hint" role="alert" className={ERROR}>
                                        Rassen konnten nicht geladen werden.{" "}
                                        <button type="button" className="underline text-emerald-900 cursor-pointer" onClick={retryBreeds}>Erneut versuchen</button>
                                    </p>
                                )}
                                {fieldError("breedId")}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <div className={FIELD}>
                                <label htmlFor={FIELD_IDS.birthYear} className={LABEL}>Geburtsjahr *</label>
                                <input
                                    id={FIELD_IDS.birthYear}
                                    type="number"
                                    inputMode="numeric"
                                    className={INPUT}
                                    placeholder="z. B. 2021"
                                    value={values.birthYear}
                                    onChange={(e) => update("birthYear", e.target.value)}
                                    aria-invalid={errors.birthYear ? true : undefined}
                                    aria-describedby={describedBy("birthYear")}
                                />
                                {fieldError("birthYear")}
                            </div>

                            <div className={FIELD}>
                                <label htmlFor={FIELD_IDS.gender} className={LABEL}>Geschlecht *</label>
                                <select
                                    id={FIELD_IDS.gender}
                                    className={INPUT}
                                    value={values.gender}
                                    onChange={(e) => update("gender", e.target.value as Gender | "")}
                                    aria-invalid={errors.gender ? true : undefined}
                                    aria-describedby={describedBy("gender")}
                                >
                                    <option value="">Bitte wählen</option>
                                    {(Object.keys(GENDER_LABELS) as Gender[]).map((gender) => (
                                        <option key={gender} value={gender}>{GENDER_LABELS[gender]}</option>
                                    ))}
                                </select>
                                {fieldError("gender")}
                            </div>

                            <div className={FIELD}>
                                <label htmlFor={FIELD_IDS.requiredExperience} className={LABEL}>Benötigte Erfahrung *</label>
                                <select
                                    id={FIELD_IDS.requiredExperience}
                                    className={INPUT}
                                    value={values.requiredExperience}
                                    onChange={(e) => update("requiredExperience", e.target.value as ExperienceLevel | "")}
                                    aria-invalid={errors.requiredExperience ? true : undefined}
                                    aria-describedby={describedBy("requiredExperience")}
                                >
                                    <option value="">Bitte wählen</option>
                                    {(Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]).map((level) => (
                                        <option key={level} value={level}>{EXPERIENCE_LABELS[level]}</option>
                                    ))}
                                </select>
                                {fieldError("requiredExperience")}
                            </div>
                        </div>

                        <div className={FIELD}>
                            <label htmlFor={FIELD_IDS.description} className={LABEL}>Beschreibung *</label>
                            <textarea
                                id={FIELD_IDS.description}
                                rows={5}
                                className={TEXTAREA}
                                placeholder="Erzähl etwas über das Tier: Charakter, Vorgeschichte, Besonderheiten..."
                                value={values.description}
                                onChange={(e) => update("description", e.target.value)}
                                aria-invalid={errors.description ? true : undefined}
                                aria-describedby={describedBy("description")}
                            />
                            {fieldError("description")}
                        </div>
                    </section>

                    <section className="flex flex-col gap-4" aria-label="Eigenschaften">
                        <SectionTitle overline="Eigenschaften" title="Tags"/>
                        <p id="animal-tags-hint" className="text-sm text-gray-500 -mt-2">
                            Pro Kategorie kannst du einen Tag auswählen. Ein erneuter Klick wählt ihn wieder ab.
                        </p>

                        {masterData.tags.length === 0 ? (
                            <p className="text-sm text-gray-500">Es sind noch keine Tags vorhanden.</p>
                        ) : (
                            <div id={FIELD_IDS.tagIds} tabIndex={-1} className="flex flex-col gap-4">
                                {[...tagGroups.entries()].map(([group, tags]) => (
                                    <fieldset key={group || "all"} className="flex flex-col gap-2 border-0 p-0 m-0 min-w-0" aria-describedby="animal-tags-hint">
                                        <legend className={`${LABEL} mb-2`}>{group ? categoryLabel(group) : "Weitere Tags"}</legend>
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag) => (
                                                <label key={tag.id} className="relative cursor-pointer">
                                                    <input
                                                        className="peer absolute opacity-0 w-full h-full m-0 cursor-pointer"
                                                        type="checkbox"
                                                        checked={values.tagIds.includes(tag.id)}
                                                        onChange={() => toggleTag(tag, masterData.tags)}
                                                    />
                                                    <span className="inline-block rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm text-gray-700 transition-colors hover:border-emerald-900 peer-checked:bg-emerald-900 peer-checked:border-emerald-900 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-900">
                                                        {tag.name}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* ---------- rechte Spalte (z. B. Fotos) ---------- */}
                {aside && (
                    <aside className="flex flex-col gap-4 min-w-0 lg:border-l lg:border-gray-100 lg:pl-10">
                        {aside}
                    </aside>
                )}
            </div>

            {submitError && (
                <p role="alert" className={ERROR}>{submitError}</p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
                <button type="button" className={`h-11 px-6 bg-white text-gray-800 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 ${FOCUS_RING} disabled:opacity-60 disabled:cursor-not-allowed`} onClick={onCancel} disabled={isSubmitting}>
                    Abbrechen
                </button>
                <button type="submit" className={`h-11 px-6 bg-emerald-900 text-white rounded-xl cursor-pointer hover:bg-emerald-800 ${FOCUS_RING} disabled:opacity-60 disabled:cursor-not-allowed`} disabled={isSubmitting}>
                    {isSubmitting ? "Wird gespeichert..." : mode === "edit" ? "Änderungen speichern" : "Tier anlegen"}
                </button>
            </div>
        </form>
    );
}
