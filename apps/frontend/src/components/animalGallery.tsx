"use client";

import {pictureSrc, type AnimalPicture} from "@/lib/animals";

type AnimalGalleryProps = {
    pictures: AnimalPicture[];
    animalName: string;
};

/**
 * Fotobereich des Tierprofils.
 * Zeigt die vorhandenen Fotos (Titelbild groß) und eine Kachel "Fotos hinzufügen".
 * Hochladen, Titelbild ändern und Löschen werden im Foto-Issue (#31) angebunden –
 * dort wird die Kachel unten zu einem echten Upload-Button.
 */
export default function AnimalGallery({pictures, animalName}: AnimalGalleryProps) {

    const cover = pictures.find((picture) => picture.showOnCard) ?? pictures[0];
    const others = pictures.filter((picture) => picture !== cover);

    return (
        <section aria-labelledby="gallery-title" className="flex flex-col gap-4">
            <div>
                <p className="text-xs font-semibold tracking-widest text-emerald-900/70 uppercase">Galerie</p>
                <h2 id="gallery-title" className="text-xl font-semibold text-gray-900">Fotos</h2>
            </div>

            {cover ? (
                <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-[4/3]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pictureSrc(cover.url)} alt={`Titelbild von ${animalName}`} className="h-full w-full object-cover"/>
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-900 shadow-sm">
                        Titelbild
                    </span>
                </div>
            ) : (
                <p className="rounded-2xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                    Für {animalName} gibt es noch keine Fotos.
                </p>
            )}

            <div className="grid grid-cols-2 gap-3">
                {others.map((picture, index) => (
                    <div key={picture.id} className="overflow-hidden rounded-2xl bg-gray-100 aspect-square">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={pictureSrc(picture.url)} alt={`Foto ${index + 2} von ${animalName}`} className="h-full w-full object-cover"/>
                    </div>
                ))}

                <button
                    type="button"
                    disabled
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-emerald-900/40 bg-emerald-50 px-2 text-center text-emerald-900 disabled:cursor-not-allowed disabled:opacity-80"
                >
                    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 16V4"/>
                        <path d="m7 9 5-5 5 5"/>
                        <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>
                    </svg>
                    <span className="text-sm font-semibold">Fotos hinzufügen</span>
                    <span className="text-xs text-gray-500">JPG oder PNG</span>
                </button>
            </div>

            <p className="text-xs text-gray-500">
                Das Hochladen und Ändern von Fotos ist bald möglich. Nutze später helle, klare Bilder, die den Charakter des Tieres zeigen.
            </p>
        </section>
    );
}
