"use client";

import {useId, type FormEvent} from "react";
import "./animalForm.css";
import {
    CATEGORY_LABELS,
    ENERGY_CATEGORY,
    EXPERIENCE_OPTIONS,
    GENDER_OPTIONS,
    MAX_DESCRIPTION_LENGTH,
    MAX_NAME_LENGTH,
    type AnimalFormErrors,
    type AnimalFormValues,
    type Breed,
    type Species,
    type TagGroup,
} from "@/lib/animals";

export const ANIMAL_FORM_ID = "animal-form";

type AnimalFormProps = {
    values: AnimalFormValues;
    onChange: (values: AnimalFormValues) => void;
    onSubmit: () => void;
    onCancel: () => void;
    species: Species[];
    breeds: Breed[];
    tagGroups: TagGroup[];
    errors?: AnimalFormErrors;
    isSubmitting?: boolean;
    isLoadingBreeds?: boolean;
    breedsError?: string;
    onSpeciesChange?: (speciesId: string) => void;
    submitLabel?: string;
    formId?: string;
};

export default function AnimalForm({
    values,
    onChange,
    onSubmit,
    onCancel,
    species,
    breeds,
    tagGroups,
    errors = {},
    isSubmitting = false,
    isLoadingBreeds = false,
    breedsError,
    onSpeciesChange,
    submitLabel = "Profil erstellen",
    formId = ANIMAL_FORM_ID,
}: AnimalFormProps) {
    const uid = useId();
    const id = (field: string) => `${uid}-${field}`;

    function update<K extends keyof AnimalFormValues>(field: K, value: AnimalFormValues[K]) {
        onChange({...values, [field]: value});
    }

    function handleSpeciesChange(speciesId: string) {
        onChange({...values, speciesId, breedId: ""});
        onSpeciesChange?.(speciesId);
    }

    function toggleTag(tagId: string, groupTagIds: string[], single: boolean) {
        const selected = values.tagIds.includes(tagId);
        const base = single ? values.tagIds.filter((t) => !groupTagIds.includes(t)) : values.tagIds.filter((t) => t !== tagId);
        update("tagIds", selected ? base : [...base, tagId]);
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!isSubmitting) onSubmit();
    }

    const breedDisabled = !values.speciesId || isLoadingBreeds || isSubmitting;
    const breedPlaceholder = !values.speciesId
        ? "Zuerst Tierart wählen"
        : isLoadingBreeds
            ? "Rassen werden geladen…"
            : breeds.length === 0
                ? "Keine Rassen vorhanden"
                : "Keine Angabe";

    const describedBy = (field: keyof AnimalFormValues) => (errors[field] ? `${id(field)}-error` : undefined);

    return (
        <form id={formId} className="animalForm" onSubmit={handleSubmit} noValidate>
            {errors.form && (
                <div className="animalFormAlert" role="alert">{errors.form}</div>
            )}

            <section className="animalFormCard" aria-labelledby={id("basic-title")}>
                <p className="animalFormEyebrow">Grunddaten</p>
                <h2 id={id("basic-title")} className="animalFormTitle">Profildetails</h2>
                <p className="animalFormHint"><span aria-hidden="true">*</span> Pflichtfeld</p>

                <div className="animalFormGrid">
                    <div className="animalFormField">
                        <label htmlFor={id("name")} className="animalFormLabel">Name <span aria-hidden="true">*</span></label>
                        <input
                            id={id("name")} type="text" className="animalFormInput" required aria-required="true"
                            maxLength={MAX_NAME_LENGTH} autoComplete="off" value={values.name} disabled={isSubmitting}
                            aria-invalid={!!errors.name} aria-describedby={describedBy("name")}
                            onChange={(e) => update("name", e.target.value)}
                        />
                        {errors.name && <p id={`${id("name")}-error`} className="animalFormError">{errors.name}</p>}
                    </div>

                    <div className="animalFormField">
                        <label htmlFor={id("speciesId")} className="animalFormLabel">Tierart <span aria-hidden="true">*</span></label>
                        <select
                            id={id("speciesId")} className="animalFormInput" required aria-required="true"
                            value={values.speciesId} disabled={isSubmitting}
                            aria-invalid={!!errors.speciesId} aria-describedby={describedBy("speciesId")}
                            onChange={(e) => handleSpeciesChange(e.target.value)}
                        >
                            <option value="">Bitte wählen</option>
                            {species.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        {errors.speciesId && <p id={`${id("speciesId")}-error`} className="animalFormError">{errors.speciesId}</p>}
                    </div>

                    <div className="animalFormField">
                        <label htmlFor={id("breedId")} className="animalFormLabel">Rasse</label>
                        <select
                            id={id("breedId")} className="animalFormInput" value={values.breedId} disabled={breedDisabled}
                            aria-invalid={!!errors.breedId} aria-describedby={breedsError ? `${id("breedId")}-error` : describedBy("breedId")}
                            onChange={(e) => update("breedId", e.target.value)}
                        >
                            <option value="">{breedPlaceholder}</option>
                            {breeds.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        {(breedsError || errors.breedId) && (
                            <p id={`${id("breedId")}-error`} className="animalFormError">{breedsError ?? errors.breedId}</p>
                        )}
                    </div>

                    <div className="animalFormField">
                        <label htmlFor={id("birthYear")} className="animalFormLabel">Geburtsjahr <span aria-hidden="true">*</span></label>
                        <input
                            id={id("birthYear")} type="text" inputMode="numeric" pattern="\d{4}" maxLength={4}
                            placeholder="z. B. 2021" className="animalFormInput" required aria-required="true"
                            value={values.birthYear} disabled={isSubmitting}
                            aria-invalid={!!errors.birthYear} aria-describedby={describedBy("birthYear")}
                            onChange={(e) => update("birthYear", e.target.value.replace(/\D/g, ""))}
                        />
                        {errors.birthYear && <p id={`${id("birthYear")}-error`} className="animalFormError">{errors.birthYear}</p>}
                    </div>

                    <div className="animalFormField">
                        <label htmlFor={id("gender")} className="animalFormLabel">Geschlecht <span aria-hidden="true">*</span></label>
                        <select
                            id={id("gender")} className="animalFormInput" required aria-required="true"
                            value={values.gender} disabled={isSubmitting}
                            aria-invalid={!!errors.gender} aria-describedby={describedBy("gender")}
                            onChange={(e) => update("gender", e.target.value as AnimalFormValues["gender"])}
                        >
                            <option value="">Bitte wählen</option>
                            {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        {errors.gender && <p id={`${id("gender")}-error`} className="animalFormError">{errors.gender}</p>}
                    </div>

                    <div className="animalFormField">
                        <label htmlFor={id("requiredExperience")} className="animalFormLabel">Benötigte Erfahrung <span aria-hidden="true">*</span></label>
                        <select
                            id={id("requiredExperience")} className="animalFormInput" required aria-required="true"
                            value={values.requiredExperience} disabled={isSubmitting}
                            aria-invalid={!!errors.requiredExperience} aria-describedby={describedBy("requiredExperience")}
                            onChange={(e) => update("requiredExperience", e.target.value as AnimalFormValues["requiredExperience"])}
                        >
                            <option value="">Bitte wählen</option>
                            {EXPERIENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        {errors.requiredExperience && (
                            <p id={`${id("requiredExperience")}-error`} className="animalFormError">{errors.requiredExperience}</p>
                        )}
                    </div>
                </div>

                <div className="animalFormField animalFormFieldFull">
                    <label htmlFor={id("description")} className="animalFormLabel">Beschreibung <span aria-hidden="true">*</span></label>
                    <textarea
                        id={id("description")} rows={5} className="animalFormInput animalFormTextarea" required aria-required="true"
                        maxLength={MAX_DESCRIPTION_LENGTH} value={values.description} disabled={isSubmitting}
                        placeholder="Beschreibe Persönlichkeit, Lieblingsbeschäftigungen und das ideale Zuhause."
                        aria-invalid={!!errors.description} aria-describedby={describedBy("description")}
                        onChange={(e) => update("description", e.target.value)}
                    />
                    <div className="animalFormMeta">
                        {errors.description
                            ? <p id={`${id("description")}-error`} className="animalFormError">{errors.description}</p>
                            : <span />}
                        <span className="animalFormCounter">{values.description.length} / {MAX_DESCRIPTION_LENGTH}</span>
                    </div>
                </div>
            </section>

            <section className="animalFormCard" aria-labelledby={id("tags-title")}>
                <p className="animalFormEyebrow">Eigenschaften</p>
                <h2 id={id("tags-title")} className="animalFormTitle">Energielevel & Tags</h2>

                {tagGroups.length === 0 && (
                    <p className="animalFormHint">Es sind noch keine Tags vorhanden.</p>
                )}

                {errors.tagIds && <p className="animalFormError" role="alert">{errors.tagIds}</p>}

                {tagGroups.map((group) => {
                    const single = group.category === ENERGY_CATEGORY;
                    const groupTagIds = group.tags.map((t) => t.id);
                    const label = CATEGORY_LABELS[group.category] ?? group.category;
                    return (
                        <fieldset key={group.category} className="animalFormTagGroup" disabled={isSubmitting}>
                            <legend className="animalFormLabel">
                                {label}
                                {single && <span className="animalFormLegendHint"> (eine Auswahl)</span>}
                            </legend>
                            <div className="animalFormChips">
                                {group.tags.map((tag) => {
                                    const selected = values.tagIds.includes(tag.id);
                                    return (
                                        <button
                                            key={tag.id} type="button" aria-pressed={selected}
                                            className={selected ? "animalFormChip animalFormChipSelected" : "animalFormChip"}
                                            onClick={() => toggleTag(tag.id, groupTagIds, single)}
                                        >
                                            {tag.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </fieldset>
                    );
                })}
            </section>

            <div className="animalFormActions">
                <button type="button" className="animalFormButtonSecondary" onClick={onCancel} disabled={isSubmitting}>
                    Abbrechen
                </button>
                <button type="submit" className="animalFormButtonPrimary" disabled={isSubmitting}>
                    {isSubmitting ? "Wird gespeichert…" : submitLabel}
                </button>
            </div>
        </form>
    );
}