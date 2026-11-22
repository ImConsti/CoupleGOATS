"use client";

import "../../globals.css";
import "./animalsPage.css";
import {useEffect, useState} from "react";
import Link from "next/link";
import NavigationBar from "@/components/navigationBar";
import {EXPERIENCE_OPTIONS, GENDER_OPTIONS, fetchSpecies, type Species} from "@/lib/animals";
import {
    ApiError,
    fetchMyAnimals,
    type AnimalList,
    type AnimalSort,
    type SortOrder,
} from "@/lib/shelterAnimals";

const PAGE_SIZE = 12;
const MAX_VISIBLE_TAGS = 3;

type LoadState = "loading" | "ready" | "error";

function labelOf(options: {value: string; label: string}[], value: string): string {
    return options.find((option) => option.value === value)?.label ?? value;
}

export default function AnimalsPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [speciesId, setSpeciesId] = useState("");
    const [sortKey, setSortKey] = useState<`${AnimalSort}:${SortOrder}`>("name:asc");
    const [page, setPage] = useState(1);

    const [speciesList, setSpeciesList] = useState<Species[]>([]);
    const [list, setList] = useState<AnimalList | null>(null);
    const [loadState, setLoadState] = useState<LoadState>("loading");
    const [errorText, setErrorText] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        fetchSpecies().then(setSpeciesList).catch(() => setSpeciesList([]));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        let cancelled = false;
        const [sort, order] = sortKey.split(":") as [AnimalSort, SortOrder];
        setLoadState("loading");
        fetchMyAnimals({page, limit: PAGE_SIZE, sort, order, speciesId, search: debouncedSearch})
            .then((result) => {
                if (cancelled) return;
                setList(result);
                setLoadState("ready");
            })
            .catch((error) => {
                if (cancelled) return;
                setErrorText(
                    error instanceof ApiError && (error.status === 401 || error.status === 403)
                        ? "Deine Sitzung ist abgelaufen oder du hast keine Berechtigung. Bitte melde dich als Tierheim an."
                        : "Die Tiere konnten nicht geladen werden. Bitte prüfe deine Verbindung."
                );
                setLoadState("error");
            });
        return () => {
            cancelled = true;
        };
    }, [page, speciesId, sortKey, debouncedSearch, reloadKey]);

    const total = list?.meta.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const hasFilter = debouncedSearch.trim() !== "" || speciesId !== "";

    return (
        <main>
            <NavigationBar userType="shelter"/>

            <div className="animalsPage">
                <header className="animalsHeader">
                    <div>
                        <p className="animalsEyebrow">Tierprofile</p>
                        <h1 className="animalsTitle">Alle Tiere</h1>
                        <p className="animalsSubtitle">Verwalte alle Tierprofile und halte die Vermittlungsdaten aktuell.</p>
                    </div>
                    <Link href="/shelter/animals/new" className="animalsAddButton">
                        <span aria-hidden="true">+</span> Tier hinzufügen
                    </Link>
                </header>

                <div className="animalsToolbar">
                    <input
                        type="search"
                        className="animalsInput animalsSearch"
                        placeholder="Nach Namen suchen…"
                        aria-label="Nach Namen suchen"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="animalsInput"
                        aria-label="Nach Tierart filtern"
                        value={speciesId}
                        onChange={(e) => { setSpeciesId(e.target.value); setPage(1); }}
                    >
                        <option value="">Alle Tierarten</option>
                        {speciesList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select
                        className="animalsInput"
                        aria-label="Sortierung"
                        value={sortKey}
                        onChange={(e) => { setSortKey(e.target.value as typeof sortKey); setPage(1); }}
                    >
                        <option value="name:asc">Name A–Z</option>
                        <option value="name:desc">Name Z–A</option>
                        <option value="createdAt:desc">Neueste zuerst</option>
                        <option value="createdAt:asc">Älteste zuerst</option>
                    </select>
                </div>

                {loadState === "loading" && !list && (
                    <p className="animalsStatus" role="status">Tiere werden geladen…</p>
                )}

                {loadState === "error" && (
                    <div className="animalsStatus animalsStatusError" role="alert">
                        <p>{errorText}</p>
                        <button type="button" className="animalsRetry" onClick={() => setReloadKey((k) => k + 1)}>
                            Erneut versuchen
                        </button>
                    </div>
                )}

                {loadState !== "error" && list && list.items.length === 0 && (
                    <div className="animalsStatus">
                        {hasFilter
                            ? "Keine Tiere gefunden. Passe Suche oder Filter an."
                            : "Du hast noch keine Tiere angelegt. Lege jetzt das erste Tierprofil an."}
                    </div>
                )}

                {loadState !== "error" && list && list.items.length > 0 && (
                    <>
                        <p className="animalsCount" aria-live="polite">
                            {total} {total === 1 ? "Tier" : "Tiere"}
                        </p>

                        <ul className={loadState === "loading" ? "animalsGrid animalsGridLoading" : "animalsGrid"}>
                            {list.items.map((animal) => {
                                const visibleTags = animal.tags.slice(0, MAX_VISIBLE_TAGS);
                                const hiddenTags = animal.tags.length - visibleTags.length;
                                return (
                                    <li key={animal.id} className="animalCard">
                                        <div className="animalCardHeader">
                                            <div className="animalCardAvatar" aria-hidden="true">
                                                <img src="/paw2.svg" alt="" className="w-6 h-6"/>
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="animalCardName">{animal.name}</h2>
                                                <p className="animalCardSub">
                                                    {animal.species.name}{animal.breed ? ` · ${animal.breed.name}` : ""}
                                                </p>
                                            </div>
                                        </div>

                                        <dl className="animalCardFacts">
                                            <div><dt>Geburtsjahr</dt><dd>{animal.birthYear}</dd></div>
                                            <div><dt>Geschlecht</dt><dd>{labelOf(GENDER_OPTIONS, animal.gender)}</dd></div>
                                            <div><dt>Erfahrung</dt><dd>{labelOf(EXPERIENCE_OPTIONS, animal.requiredExperience)}</dd></div>
                                        </dl>

                                        {animal.tags.length > 0 && (
                                            <div className="animalCardTags">
                                                {visibleTags.map((tag) => <span key={tag.id} className="animalCardTag">{tag.name}</span>)}
                                                {hiddenTags > 0 && <span className="animalCardTag">+{hiddenTags}</span>}
                                            </div>
                                        )}

                                        <div className="animalCardActions">
                                            <Link href={`/shelter/animals/${animal.id}/edit`} className="animalCardEdit">
                                                Bearbeiten
                                            </Link>
                                            {/* TODO: Löschen ist noch nicht angebunden (deleteMyAnimal in lib/shelterAnimals.ts ist vorbereitet). */}
                                            <button
                                                type="button"
                                                className="animalCardDelete"
                                                disabled
                                                title="Löschen ist noch nicht verfügbar"
                                            >
                                                Löschen
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        {totalPages > 1 && (
                            <nav className="animalsPagination" aria-label="Seiten">
                                <button
                                    type="button"
                                    className="animalsPageButton"
                                    disabled={page <= 1 || loadState === "loading"}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    ← Zurück
                                </button>
                                <span className="animalsPageInfo">Seite {page} von {totalPages}</span>
                                <button
                                    type="button"
                                    className="animalsPageButton"
                                    disabled={page >= totalPages || loadState === "loading"}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Weiter →
                                </button>
                            </nav>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
