"use client";

import "./animalsPage.css";
import { useEffect, useRef, useState } from "react";
import NavigationBar from "@/components/navigationBar";
import AnimalForm, {
  EMPTY_ANIMAL_FORM,
  validateAnimalForm,
  type AnimalFormErrors,
  type AnimalFormValues,
  type Breed,
  type Species,
  type TagGroup,
} from "@/components/animalForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const API = `${API_URL}/api/v1`;

const USE_MOCK_SPECIES = true;
const MOCK_SPECIES: Species[] = [
  { id: "mock-dog", name: "Hund" },
  { id: "mock-cat", name: "Katze" },
];
const MOCK_BREEDS: Breed[] = [
  { id: "mock-breed-1", name: "Mischling" },
  { id: "mock-breed-2", name: "Rasse B" },
];

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`);
  if (!response.ok) throw new Error("request failed");
  return response.json();
}

function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function AnimalsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [values, setValues] = useState<AnimalFormValues>(EMPTY_ANIMAL_FORM);
  const [errors, setErrors] = useState<AnimalFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [species, setSpecies] = useState<Species[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoadingBreeds, setIsLoadingBreeds] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);
  const breedRequest = useRef(0);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      USE_MOCK_SPECIES
        ? Promise.resolve(MOCK_SPECIES)
        : getJson<Species[]>("/species"),
      getJson<TagGroup[]>("/tags"),
    ])
      .then(([s, t]) => {
        if (ignore) return;
        setSpecies(s);
        setTagGroups(t);
        setLoadError(false);
      })
      .catch(() => {
        if (!ignore) setLoadError(true);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  function retryLoad() {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  }

  function openModal() {
    setSuccessMessage(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setValues(EMPTY_ANIMAL_FORM);
    setErrors({});
    setFormError(null);
    setBreeds([]);
    setIsLoadingBreeds(false);
    breedRequest.current++;
  }

  useEffect(() => {
    if (!isModalOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitLock.current) closeModal();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

  async function loadBreeds(speciesId: string) {
    const requestId = ++breedRequest.current;
    setBreeds([]);
    if (!speciesId) {
      setIsLoadingBreeds(false);
      return;
    }
    if (USE_MOCK_SPECIES) {
      setBreeds(MOCK_BREEDS);
      return;
    }
    setIsLoadingBreeds(true);
    try {
      const result = await getJson<Breed[]>(`/species/${speciesId}/breeds`);
      if (requestId === breedRequest.current) setBreeds(result);
    } catch {
      if (requestId === breedRequest.current) {
        setFormError("Die Rassen konnten nicht geladen werden.");
      }
    } finally {
      if (requestId === breedRequest.current) setIsLoadingBreeds(false);
    }
  }

  function handleChange(patch: Partial<AnimalFormValues>) {
    const speciesChanged =
      patch.speciesId !== undefined && patch.speciesId !== values.speciesId;

    setValues((prev) => ({
      ...prev,
      ...patch,
      ...(speciesChanged ? { breedId: "" } : {}),
    }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch) as (keyof AnimalFormValues)[]) {
        delete next[key];
      }
      return next;
    });

    if (speciesChanged) void loadBreeds(patch.speciesId as string);
  }

  async function handleSubmit() {
    if (submitLock.current) return;

    const validationErrors = validateAnimalForm(values);
    setErrors(validationErrors);
    setFormError(null);
    if (Object.keys(validationErrors).length > 0) return;

    submitLock.current = true;
    setIsSubmitting(true);

    const body = {
      name: values.name.trim(),
      speciesId: values.speciesId,
      ...(values.breedId ? { breedId: values.breedId } : {}),
      birthYear: Number(values.birthYear),
      gender: values.gender,
      requiredExperience: values.requiredExperience,
      description: values.description.trim(),
      tagIds: values.tagIds,
    };

    try {
      const response = await fetch(`${API}/shelters/me/animals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        submitLock.current = false;
        setIsSubmitting(false);
        closeModal();
        setSuccessMessage("Das Tierprofil wurde erstellt.");
        return;
      }

      if (response.status === 401 || response.status === 403) {
        setFormError("Du bist nicht angemeldet. Bitte melde dich erneut an.");
      } else {
        const data = await response.json().catch(() => null);
        setFormError(
          data?.error?.message
            ? `Das Profil konnte nicht gespeichert werden: ${data.error.message}`
            : "Das Profil konnte nicht gespeichert werden.",
        );
      }
    } catch {
      setFormError(
        "Netzwerkfehler. Bitte prüfe deine Verbindung und versuche es erneut.",
      );
    }

    submitLock.current = false;
    setIsSubmitting(false);
  }

  return (
    <div className="animalsPage">
      <NavigationBar userType="shelter" />

      <main className="animalsMain">
        <header className="animalsHeader">
          <div>
            <p className="animalsEyebrow">Tierprofile</p>
            <h1 className="animalsTitle">Alle Tiere</h1>
            <p className="animalsSubtitle">
              Erstelle und bearbeite deine Tierprofile.
            </p>
          </div>

          <button type="button" onClick={openModal} className="primaryButton">
            <PlusIcon className="btnIcon" />
            Neues Tier
          </button>
        </header>

        {successMessage && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-[#e6efe7] px-4 py-3 text-sm text-[#1f3a2e]"
          >
            {successMessage}
          </p>
        )}
      </main>

      {isModalOpen && (
        <div
          className="modalOverlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) closeModal();
          }}
        >
          <div
            className="modalWrapper"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !isSubmitting) closeModal();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-profile-title"
              className="modalDialog"
            >
              <div className="modalHeader">
                <div>
                  <h2 id="create-profile-title" className="modalTitle">
                    Neues Profil erstellen
                  </h2>
                  <p className="modalSubtitle">
                    Felder mit * sind Pflicht.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  aria-label="Schließen"
                  className="closeButton"
                >
                  <CloseIcon className="closeIcon" />
                </button>
              </div>

              {isLoading ? (
                <p className="modalSubtitle" role="status">
                  Daten werden geladen …
                </p>
              ) : loadError ? (
                <div className="animalForm" role="alert">
                  <p className="animalFormError">
                    Die Stammdaten konnten nicht geladen werden.
                  </p>
                  <div className="animalFormActions">
                    <button
                      type="button"
                      onClick={retryLoad}
                      className="animalFormSubmit"
                    >
                      Erneut versuchen
                    </button>
                  </div>
                </div>
              ) : species.length === 0 ? (
                <div className="animalForm" role="alert">
                  <p className="animalFormError">
                    Es sind noch keine Tierarten hinterlegt. Ein Tier kann erst
                    angelegt werden, wenn Tierarten vorhanden sind.
                  </p>
                </div>
              ) : (
                <AnimalForm
                  values={values}
                  errors={errors}
                  formError={formError}
                  species={species}
                  breeds={breeds}
                  tagGroups={tagGroups}
                  isLoadingBreeds={isLoadingBreeds}
                  isSubmitting={isSubmitting}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  onCancel={closeModal}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}