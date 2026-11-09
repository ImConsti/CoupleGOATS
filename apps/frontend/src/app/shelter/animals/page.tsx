"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import "./animalsPage.css";
import "../../globals.css";
import NavigationBar from "@/components/navigationBar";
import {GENDER_LABELS, fetchMyAnimals, nameOf, type Animal} from "@/lib/animals";

type LoadState =
    | { status: "loading" }
    | { status: "error" }
    | { status: "ready"; animals: Animal[] };

export default function AnimalsPage() {

    const [state, setState] = useState<LoadState>({status: "loading"});
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        fetchMyAnimals()
            .then((animals) => { if (!cancelled) setState({status: "ready", animals}); })
            .catch(() => { if (!cancelled) setState({status: "error"}); });
        return () => { cancelled = true; };
    }, [attempt]);

    function retry() {
        setState({status: "loading"});
        setAttempt((current) => current + 1);
    }

    return (
        <main>
            <NavigationBar userType="shelter"/>

            <div className="animalsPage">
                <h1 className="animalsHeader">Meine Tiere</h1>

                {state.status === "loading" && (
                    <p role="status" className="animalsStatus">Tiere werden geladen...</p>
                )}

                {state.status === "error" && (
                    <div role="alert" className="animalsStatus">
                        <p className="text-red-500">Die Tiere konnten nicht geladen werden.</p>
                        <button type="button" className="animalsEditButton mt-3" onClick={retry}>Erneut versuchen</button>
                    </div>
                )}

                {state.status === "ready" && state.animals.length === 0 && (
                    <p className="animalsStatus">Du hast noch keine Tiere angelegt.</p>
                )}

                {state.status === "ready" && state.animals.length > 0 && (
                    <ul className="animalsList">
                        {state.animals.map((animal) => {
                            const age = new Date().getFullYear() - animal.birthYear;
                            return (
                                <li key={animal.id} className="animalsCard">
                                    <div className="animalsCardInfo">
                                        <h2 className="animalsCardName">{animal.name}</h2>
                                        <p className="animalsCardMeta">
                                            {[nameOf(animal.species), nameOf(animal.breed)].filter(Boolean).join(" · ")}
                                        </p>
                                        <p className="animalsCardMeta">
                                            {GENDER_LABELS[animal.gender]} · geboren {animal.birthYear} ({age} {age === 1 ? "Jahr" : "Jahre"})
                                        </p>
                                        {(animal.tags ?? []).length > 0 && (
                                            <ul className="animalsTags" aria-label="Tags">
                                                {(animal.tags ?? []).map((tag) => (
                                                    <li key={tag.id} className="animalsTag">{tag.name}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <Link
                                        href={`/shelter/animals/${animal.id}/edit`}
                                        className="animalsEditButton"
                                        aria-label={`${animal.name} bearbeiten`}
                                    >
                                        <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 20h9"/>
                                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                                        </svg>
                                        Bearbeiten
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </main>
    );
}
