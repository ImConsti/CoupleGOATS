"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import "./editAnimalPage.css";
import "../../../../globals.css";
import NavigationBar from "@/components/navigationBar";
import AnimalForm, {animalToFormValues, type AnimalFormValues} from "@/components/animalForm";
import AnimalGallery from "@/components/animalGallery";
import {ApiError, fetchMyAnimal, type Animal} from "@/lib/animals";

type ErrorKind = "unauthorized" | "forbidden" | "notFound" | "failed";

type LoadState =
    | { status: "loading" }
    | { status: "ready"; animal: Animal }
    | { status: "error"; kind: ErrorKind };

const ERROR_TEXTS: Record<ErrorKind, { title: string; text: string }> = {
    unauthorized: {
        title: "Anmeldung abgelaufen",
        text: "Bitte melde dich erneut an, um dieses Tier zu bearbeiten.",
    },
    forbidden: {
        title: "Keine Berechtigung",
        text: "Dieses Tier gehört nicht zu deinem Tierheim. Du kannst es deshalb nicht bearbeiten.",
    },
    notFound: {
        title: "Tier nicht gefunden",
        text: "Dieses Tierprofil existiert nicht (mehr). Vielleicht wurde es gelöscht.",
    },
    failed: {
        title: "Tier konnte nicht geladen werden",
        text: "Es ist ein Fehler aufgetreten. Prüfe deine Verbindung und versuche es erneut.",
    },
};

function errorKindOf(error: unknown): ErrorKind {
    if (error instanceof ApiError) {
        if (error.status === 401) return "unauthorized";
        if (error.status === 403) return "forbidden";
        if (error.status === 404) return "notFound";
    }
    return "failed";
}

export default function EditAnimalPage() {

    const router = useRouter();
    const {animalId} = useParams<{animalId: string}>();

    const [state, setState] = useState<LoadState>({status: "loading"});
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        fetchMyAnimal(animalId)
            .then((animal) => { if (!cancelled) setState({status: "ready", animal}); })
            .catch((error) => { if (!cancelled) setState({status: "error", kind: errorKindOf(error)}); });
        return () => { cancelled = true; };
    }, [animalId, attempt]);

    function retry() {
        setState({status: "loading"});
        setAttempt((current) => current + 1);
    }

    function goBack() {
        // verwirft alle lokalen Änderungen (der Formularzustand lebt nur im Browser)
        router.push("/shelter/animals");
    }

    async function handleSubmit(values: AnimalFormValues) {
        // Das Speichern (PATCH /shelters/me/animals/{animalId} und PUT .../tags) wird im
        // Mika-Sub-Issue umgesetzt. Bis dahin zeigt das Formular diese Meldung an.
        void values;
        throw new Error("Speichern ist noch nicht angebunden.");
    }

    return (
        <main>
            <NavigationBar userType="shelter"/>

            <div className="editAnimalPage">
                <Link href="/shelter/animals" className="editAnimalBackLink">← Zurück zu meinen Tieren</Link>

                <header className="editAnimalIntro">
                    <p className="editAnimalEyebrow">Tierprofil</p>
                    <h1 className="editAnimalHeader">
                        {state.status === "ready" ? `${state.animal.name} bearbeiten` : "Tier bearbeiten"}
                    </h1>
                    <p className="editAnimalSubtitle">Halte die Angaben zum Tier aktuell.</p>
                </header>

                {state.status === "loading" && (
                    <div className="editAnimalCard editAnimalCardNarrow">
                        <p role="status" className="editAnimalStatus">Tierprofil wird geladen...</p>
                    </div>
                )}

                {state.status === "error" && (
                    <div className="editAnimalCard editAnimalCardNarrow">
                        <div role="alert" className="editAnimalStatus">
                            <h2 className="editAnimalErrorTitle">{ERROR_TEXTS[state.kind].title}</h2>
                            <p>{ERROR_TEXTS[state.kind].text}</p>
                            <div className="editAnimalErrorActions">
                                {state.kind === "failed" && (
                                    <button type="button" className="editAnimalButton" onClick={retry}>Erneut versuchen</button>
                                )}
                                {state.kind === "unauthorized" ? (
                                    <Link href="/auth/login" className="editAnimalButton">Zur Anmeldung</Link>
                                ) : (
                                    <Link href="/shelter/animals" className="editAnimalButton">Zu meinen Tieren</Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {state.status === "ready" && (
                    <div className="editAnimalCard">
                        <AnimalForm
                            mode="edit"
                            initialValues={animalToFormValues(state.animal)}
                            onSubmit={handleSubmit}
                            onCancel={goBack}
                            aside={<AnimalGallery pictures={state.animal.pictures ?? []} animalName={state.animal.name}/>}
                        />
                    </div>
                )}
            </div>
        </main>
    );
}
