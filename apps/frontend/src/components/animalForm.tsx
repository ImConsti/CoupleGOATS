"use client";

import "./animalForm.css";
import type { FormEvent } from "react";

export type Species = { id: string; name: string };
export type Breed = { id: string; name: string };
export type Tag = { id: string; name: string; category: string };
export type TagGroup = { category: string; tags: Tag[] };

export type AnimalFormValues = {
  name: string;
  speciesId: string;
  breedId: string;
  birthYear: string;
  gender: string;
  requiredExperience: string;
  description: string;
  tagIds: string[];
};

export type AnimalFormErrors = Partial<Record<keyof AnimalFormValues, string>>;

export const EMPTY_ANIMAL_FORM: AnimalFormValues = {
  name: "",
  speciesId: "",
  breedId: "",
  birthYear: "",
  gender: "",
  requiredExperience: "",
  description: "",
  tagIds: [],
};

const GENDERS = [
  { value: "male", label: "Männlich" },
  { value: "female", label: "Weiblich" },
  { value: "unknown", label: "Unbekannt" },
];

const EXPERIENCE = [
  { value: "beginner", label: "Anfänger" },
  { value: "experienced", label: "Erfahren" },
  { value: "expert", label: "Experte" },
];

const CATEGORY_LABELS: Record<string, string> = {
  personality: "Persönlichkeit",
  "energy level": "Energielevel",
  "training & experience": "Training & Erfahrung",
  "living environment": "Wohnumfeld",
  "social behavior": "Sozialverhalten",
  "time & attention": "Zeit & Aufmerksamkeit",
  "special needs": "Besondere Bedürfnisse",
  lifestyle: "Lebensstil",
};

// Aus diesen Kategorien darf nur ein Tag gewählt werden.
const SINGLE_SELECT_CATEGORIES = ["energy level"];

export function validateAnimalForm(values: AnimalFormValues): AnimalFormErrors {
  const errors: AnimalFormErrors = {};
  const year = Number(values.birthYear);
  const currentYear = new Date().getFullYear();

  if (!values.name.trim()) errors.name = "Bitte gib einen Namen ein.";
  else if (values.name.trim().length > 100)
    errors.name = "Der Name darf maximal 100 Zeichen lang sein.";
  if (!values.speciesId) errors.speciesId = "Bitte wähle eine Tierart.";
  if (!values.birthYear.trim()) errors.birthYear = "Bitte gib ein Geburtsjahr ein.";
  else if (!Number.isInteger(year) || year < 1900 || year > currentYear)
    errors.birthYear = `Bitte gib ein Jahr zwischen 1900 und ${currentYear} ein.`;
  if (!values.gender) errors.gender = "Bitte wähle ein Geschlecht.";
  if (!values.requiredExperience)
    errors.requiredExperience = "Bitte wähle die benötigte Erfahrung.";
  if (!values.description.trim()) errors.description = "Bitte gib eine Beschreibung ein.";
  else if (values.description.trim().length > 2000)
    errors.description = "Die Beschreibung darf maximal 2000 Zeichen lang sein.";

  return errors;
}

type Props = {
  values: AnimalFormValues;
  errors?: AnimalFormErrors;
  formError?: string | null;
  species: Species[];
  breeds: Breed[];
  tagGroups: TagGroup[];
  isLoadingBreeds?: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
  onChange: (patch: Partial<AnimalFormValues>) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function AnimalForm({
  values,
  errors = {},
  formError,
  species,
  breeds,
  tagGroups,
  isLoadingBreeds = false,
  isSubmitting = false,
  submitLabel = "Profil erstellen",
  onChange,
  onSubmit,
  onCancel,
}: Props) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit();
  }

  function toggleTag(group: TagGroup, tagId: string) {
    const selected = values.tagIds.includes(tagId);
    let next = values.tagIds.filter((id) => id !== tagId);
    if (!selected) {
      if (SINGLE_SELECT_CATEGORIES.includes(group.category)) {
        const sameCategory = group.tags.map((t) => t.id);
        next = next.filter((id) => !sameCategory.includes(id));
      }
      next.push(tagId);
    }
    onChange({ tagIds: next });
  }

  function inputClass(field: keyof AnimalFormValues) {
    return errors[field]
      ? "animalFormInput animalFormInputError"
      : "animalFormInput";
  }

  function fieldProps(field: keyof AnimalFormValues) {
    return {
      id: field,
      "aria-required": true,
      "aria-invalid": errors[field] ? true : undefined,
      "aria-describedby": errors[field] ? `${field}-error` : undefined,
    } as const;
  }

  function renderError(field: keyof AnimalFormValues) {
    return errors[field] ? (
      <p id={`${field}-error`} className="animalFormError" role="alert">
        {errors[field]}
      </p>
    ) : null;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="animalForm">
      {formError && (
        <div className="animalFormBanner" role="alert">
          {formError}
        </div>
      )}

      <div className="animalFormGrid">
        <div className="animalFormField">
          <label htmlFor="name" className="animalFormLabel">
            Name *
          </label>
          <input
            {...fieldProps("name")}
            type="text"
            maxLength={100}
            value={values.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className={inputClass("name")}
          />
          {renderError("name")}
        </div>

        <div className="animalFormField">
          <label htmlFor="birthYear" className="animalFormLabel">
            Geburtsjahr *
          </label>
          <input
            {...fieldProps("birthYear")}
            type="number"
            inputMode="numeric"
            min={1900}
            max={new Date().getFullYear()}
            value={values.birthYear}
            onChange={(e) => onChange({ birthYear: e.target.value })}
            className={inputClass("birthYear")}
          />
          {renderError("birthYear")}
        </div>

        <div className="animalFormField">
          <label htmlFor="speciesId" className="animalFormLabel">
            Tierart *
          </label>
          <select
            {...fieldProps("speciesId")}
            value={values.speciesId}
            onChange={(e) => onChange({ speciesId: e.target.value })}
            className={inputClass("speciesId")}
          >
            <option value="">Bitte wählen</option>
            {species.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {renderError("speciesId")}
        </div>

        <div className="animalFormField">
          <label htmlFor="breedId" className="animalFormLabel">
            Rasse
          </label>
          <select
            id="breedId"
            value={values.breedId}
            onChange={(e) => onChange({ breedId: e.target.value })}
            disabled={!values.speciesId || isLoadingBreeds}
            className="animalFormInput"
          >
            <option value="">
              {!values.speciesId
                ? "Zuerst Tierart wählen"
                : isLoadingBreeds
                  ? "Rassen werden geladen …"
                  : "Keine Angabe"}
            </option>
            {breeds.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="animalFormField">
          <label htmlFor="gender" className="animalFormLabel">
            Geschlecht *
          </label>
          <select
            {...fieldProps("gender")}
            value={values.gender}
            onChange={(e) => onChange({ gender: e.target.value })}
            className={inputClass("gender")}
          >
            <option value="">Bitte wählen</option>
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          {renderError("gender")}
        </div>

        <div className="animalFormField">
          <label htmlFor="requiredExperience" className="animalFormLabel">
            Benötigte Erfahrung *
          </label>
          <select
            {...fieldProps("requiredExperience")}
            value={values.requiredExperience}
            onChange={(e) => onChange({ requiredExperience: e.target.value })}
            className={inputClass("requiredExperience")}
          >
            <option value="">Bitte wählen</option>
            {EXPERIENCE.map((x) => (
              <option key={x.value} value={x.value}>
                {x.label}
              </option>
            ))}
          </select>
          {renderError("requiredExperience")}
        </div>
      </div>

      <div className="animalFormField">
        <label htmlFor="description" className="animalFormLabel">
          Beschreibung *
        </label>
        <textarea
          {...fieldProps("description")}
          rows={5}
          maxLength={2000}
          value={values.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Beschreibe Charakter, Lieblingsbeschäftigungen und das ideale Zuhause."
          className={`${inputClass("description")} resize-y`}
        />
        {renderError("description")}
      </div>

      {tagGroups.length === 0 ? (
        <p className="animalFormHint">Keine Eigenschaften verfügbar.</p>
      ) : (
        tagGroups.map((group) => {
          const single = SINGLE_SELECT_CATEGORIES.includes(group.category);
          return (
            <fieldset key={group.category} className="animalFormFieldset">
              <legend className="animalFormLegend">
                {CATEGORY_LABELS[group.category] ?? group.category}
                {single && " (eine Auswahl)"}
              </legend>
              <div className="animalFormTags">
                {group.tags.map((tag) => {
                  const active = values.tagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleTag(group, tag.id)}
                      className={
                        active
                          ? "animalFormTag animalFormTagActive"
                          : "animalFormTag"
                      }
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })
      )}

      <div className="animalFormActions">
        <button type="button" onClick={onCancel} className="animalFormSecondary">
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="animalFormSubmit"
        >
          {isSubmitting ? "Wird gespeichert …" : submitLabel}
        </button>
      </div>
    </form>
  );
}