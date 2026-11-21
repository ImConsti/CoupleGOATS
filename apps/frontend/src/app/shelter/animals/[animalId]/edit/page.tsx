"use client";

import "../../../../globals.css";
import "./editAnimalPage.css";
import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import NavigationBar from "@/components/navigationBar";
import AnimalForm, {ANIMAL_FORM_ID} from "@/components/animalForm";
import {
    fetchBreeds,
    fetchSpecies,
    fetchTagGroups,
    validateAnimalForm,
    type AnimalFormErrors,
    type AnimalFormValues,
    type Breed,
    type Species,
    type TagGroup,
} from "@/lib/animals";
import {
    animalToFormValues,
    ApiError,
    fetchMyAnimal,
    updateMyAnimal,
    type AnimalProfile,
} from "@/lib/shelterAnimals";

const ANIMALS_PATH = "/shelter/animals";

type LoadState = "loading" | "ready" | "error";
type ErrorKind = "unauthorized" | "notFound" | "failed";

function errorKindOf(error: unknown): ErrorKind {
    if (error instanceof ApiError) {
        if (error.status === 401 || error.status === 403) return "unauthorized";
        if (error.status === 404) return "notFound";
    }
    return "failed";
}

const ERROR_TEXTS: Record<ErrorKind, string> = {
    unauthorized: "Deine Sitzung ist abgelaufen oder du hast keine Berechtigung. Bitte melde dich erneut an.",
    notFound: "Dieses Tierprofil existiert nicht (mehr) oder gehört nicht zu deinem Tierheim.",
    failed: "Das Tierprofil konnte nicht geladen werden. Bitte prüfe deine Verbindung.",
};

export default function EditAnimalPage() {
    const router = useRouter();
    const {animalId} = useParams<{animalId: string}>();

    const [animal, setAnimal] = useState<AnimalProfile | null>(null);
    const [values, setValues] = useState<AnimalFormValues | null>(null);
    const [errors, setErrors] = useState<AnimalFormErrors>({});

    const [species, setSpecies] = useState<Species[]>([]);
    const [tagGroups, setTagGroups] = useState<TagGroup[]>([]);
    const [loadState, setLoadState] = useState<LoadState>("loading");
    const [errorKind, setErrorKind] = useState<ErrorKind>("failed");
    const [reloadKey, setReloadKey] = useState(0);

    const [breeds, setBreeds] = useState<Breed[]>([]);
    const [isLoadingBreeds, setIsLoadingBreeds] = useState(false);
    const [breedsError, setBreedsError] = useState<string>();
    const breedsRequestId = useRef(0);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    useEffect(() => {
        let cancelled = false;
        Promise.all([fetchMyAnimal(animalId), fetchSpecies(), fetchTagGroups()])
            .then(([loadedAnimal, loadedSpecies, loadedTagGroups]) => {
                if (cancelled) return;
                setAnimal(loadedAnimal);
                setValues(animalToFormValues(loadedAnimal));
                setSpecies(loadedSpecies);
                setTagGroups(loadedTagGroups);
                setLoadState("ready");
                void loadBreeds(loadedAnimal.species.id);
            })
            .catch((error) => {
                if (cancelled) return;
                setErrorKind(errorKindOf(error));
                setLoadState("error");
            });
        return () => {
            cancelled = true;
        };
    }, [animalId, reloadKey]);

    function handleRetry() {
        setLoadState("loading");
        setReloadKey((key) => key + 1);
    }

    async function loadBreeds(speciesId: string) {
        const requestId = ++breedsRequestId.current;
        setBreeds([]);
        setBreedsError(undefined);
        if (!speciesId) {
            setIsLoadingBreeds(false);
            return;
        }
        setIsLoadingBreeds(true);
        try {
            const loadedBreeds = await fetchBreeds(speciesId);
            if (requestId === breedsRequestId.current) setBreeds(loadedBreeds);
        } catch {
            if (requestId === breedsRequestId.current) {
                setBreedsError("Die Rassen konnten nicht geladen werden. Bitte wähle die Tierart erneut.");
            }
        } finally {
            if (requestId === breedsRequestId.current) setIsLoadingBreeds(false);
        }
    }

    async function handleSubmit() {
        if (isSubmittingRef.current || !values) return;

        const validationErrors = validateAnimalForm(values);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        isSubmittingRef.current = true;
        setIsSubmitting(true);
        setErrors({});

        const result = await updateMyAnimal(animalId, values);

        if (result.ok) {
            router.push(ANIMALS_PATH);
            return;
        }

        setErrors(result.errors);
        isSubmittingRef.current = false;
        setIsSubmitting(false);
    }

    function handleCancel() {
        router.push(ANIMALS_PATH);
    }

    const canSubmit = loadState === "ready" && species.length > 0;

    return (
        <main>
            <NavigationBar userType="shelter"/>

            <div className="editAnimalPage">
                <Link href={ANIMALS_PATH} className="editAnimalBackLink">← Zurück zu allen Tieren</Link>

                <header className="editAnimalHeader">
                    <div>
                        <p className="editAnimalEyebrow">Tierprofil bearbeiten</p>
                        <h1 className="editAnimalTitle">{animal ? `${animal.name} bearbeiten` : "Profil bearbeiten"}</h1>
                        <p className="editAnimalSubtitle">
                            Halte die Daten des Tieres aktuell, damit passende Adoptierende es finden.
                        </p>
                    </div>
                    <div className="editAnimalHeaderActions">
                        {/* TODO: Löschen ist noch nicht angebunden (API-Funktion deleteMyAnimal in lib/shelterAnimals.ts ist vorbereitet). */}
                        <button
                            type="button"
                            className="editAnimalDeleteButton"
                            disabled
                            title="Löschen ist noch nicht verfügbar"
                        >
                            Tier löschen
                        </button>
                        <button
                            type="submit"
                            form={ANIMAL_FORM_ID}
                            className="editAnimalHeaderButton"
                            disabled={isSubmitting || !canSubmit}
                        >
                            {isSubmitting ? "Wird gespeichert…" : "Änderungen speichern"}
                        </button>
                    </div>
                </header>

                {loadState === "loading" && (
                    <p className="editAnimalStatus" role="status">Tierprofil wird geladen…</p>
                )}

                {loadState === "error" && (
                    <div className="editAnimalStatus editAnimalStatusError" role="alert">
                        <p>{ERROR_TEXTS[errorKind]}</p>
                        {errorKind === "failed" && (
                            <button type="button" className="editAnimalRetry" onClick={handleRetry}>Erneut versuchen</button>
                        )}
                        {errorKind === "unauthorized" && (
                            <Link href="/auth/login" className="editAnimalRetry">Zur Anmeldung</Link>
                        )}
                    </div>
                )}

                {loadState === "ready" && species.length === 0 && (
                    <div className="editAnimalStatus editAnimalStatusError" role="alert">
                        Es sind noch keine Tierarten hinterlegt. Das Tierprofil kann deshalb gerade nicht bearbeitet werden.
                    </div>
                )}

                {canSubmit && values && (
                    <AnimalForm
                        values={values}
                        onChange={setValues}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        species={species}
                        breeds={breeds}
                        tagGroups={tagGroups}
                        errors={errors}
                        isSubmitting={isSubmitting}
                        isLoadingBreeds={isLoadingBreeds}
                        breedsError={breedsError}
                        onSpeciesChange={loadBreeds}
                        submitLabel="Änderungen speichern"
                    />
                )}
            </div>
        </main>
    );
}
