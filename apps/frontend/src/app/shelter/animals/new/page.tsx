"use client";

import "../../../globals.css";
import "./newAnimalPage.css";
import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import NavigationBar from "@/components/navigationBar";
import AnimalForm, {ANIMAL_FORM_ID} from "@/components/animalForm";
import {
    createAnimal,
    emptyAnimalForm,
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

const ANIMALS_PATH = "/shelter/animals";

type LoadState = "loading" | "ready" | "error";

export default function NewAnimalPage() {
    const router = useRouter();

    const [values, setValues] = useState<AnimalFormValues>(emptyAnimalForm);
    const [errors, setErrors] = useState<AnimalFormErrors>({});

    const [species, setSpecies] = useState<Species[]>([]);
    const [tagGroups, setTagGroups] = useState<TagGroup[]>([]);
    const [loadState, setLoadState] = useState<LoadState>("loading");
    const [reloadKey, setReloadKey] = useState(0);

    const [breeds, setBreeds] = useState<Breed[]>([]);
    const [isLoadingBreeds, setIsLoadingBreeds] = useState(false);
    const [breedsError, setBreedsError] = useState<string>();
    const breedsRequestId = useRef(0);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    useEffect(() => {
        let cancelled = false;
        Promise.all([fetchSpecies(), fetchTagGroups()])
            .then(([loadedSpecies, loadedTagGroups]) => {
                if (cancelled) return;
                setSpecies(loadedSpecies);
                setTagGroups(loadedTagGroups);
                setLoadState("ready");
            })
            .catch(() => {
                if (!cancelled) setLoadState("error");
            });
        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    function handleRetry() {
        setLoadState("loading");
        setReloadKey((key) => key + 1);
    }

    async function handleSpeciesChange(speciesId: string) {
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
        if (isSubmittingRef.current) return;

        const validationErrors = validateAnimalForm(values);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        isSubmittingRef.current = true;
        setIsSubmitting(true);
        setErrors({});

        const result = await createAnimal(values);

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

    return (
        <main>
            <NavigationBar userType="shelter"/>

            <div className="newAnimalPage">
                <Link href={ANIMALS_PATH} className="newAnimalBackLink">← Zurück zu allen Tieren</Link>

                <header className="newAnimalHeader">
                    <div>
                        <p className="newAnimalEyebrow">Neues Tierprofil</p>
                        <h1 className="newAnimalTitle">Neues Profil erstellen</h1>
                        <p className="newAnimalSubtitle">
                            Trage die Daten des Tieres ein, um sein Profil zu veröffentlichen.
                        </p>
                    </div>
                    <button
                        type="submit"
                        form={ANIMAL_FORM_ID}
                        className="newAnimalHeaderButton"
                        disabled={isSubmitting || loadState !== "ready" || species.length === 0}
                    >
                        {isSubmitting ? "Wird gespeichert…" : "Profil erstellen"}
                    </button>
                </header>

                {loadState === "loading" && (
                    <p className="newAnimalStatus" role="status">Formulardaten werden geladen…</p>
                )}

                {loadState === "error" && (
                    <div className="newAnimalStatus newAnimalStatusError" role="alert">
                        <p>Die Formulardaten konnten nicht geladen werden. Bitte prüfe deine Verbindung.</p>
                        <button type="button" className="newAnimalRetry" onClick={handleRetry}>Erneut versuchen</button>
                    </div>
                )}

                {loadState === "ready" && species.length === 0 && (
                    <div className="newAnimalStatus newAnimalStatusError" role="alert">
                        Es sind noch keine Tierarten hinterlegt. Ein Tierprofil kann deshalb gerade nicht angelegt werden.
                    </div>
                )}

                {loadState === "ready" && species.length > 0 && (
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
                        onSpeciesChange={handleSpeciesChange}
                    />
                )}
            </div>
        </main>
    );
}