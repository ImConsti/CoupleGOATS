# CoupleGOATS — API-Endpunkte

Übersicht aller geplanten REST-Endpunkte des Backends. Abgeleitet aus dem DB-Schema
(`apps/backend/src/db/schema.ts`), den Zod-Schemas (`apps/backend/src/validation/schemas.ts`),
UC-02, UC-03 und den Use Cases im README.

Die maschinenlesbare Spezifikation liegt in [`apps/backend/openapi.yaml`](../apps/backend/openapi.yaml).
Bei laufendem Backend ist sie als Swagger UI unter <http://localhost:3001/api/docs> erreichbar.

## Konventionen

- Alle Pfade haben das Präfix `/api`.
- Request- und Response-Bodies sind JSON. Ausnahme: Bild-Uploads (`multipart/form-data`) und Bild-Downloads (`image/*`).
- `me` steht immer für das eingeloggte Konto. IDs von Tierheimen werden nie aus dem Body übernommen, sondern aus dem Token gelesen.
- Auth-Spalte: `–` öffentlich · `User` Adoptierende · `Shelter` Tierheim · `Admin` User mit `isAdmin`.
- Fehler: `400` Validierung · `401` nicht eingeloggt · `403` fremde Ressource · `404` nicht vorhanden oder nicht veröffentlicht.

## Auth

| Methode | Pfad | Auth | Zweck |
| ------- | ---- | ---- | ----- |
| POST | `/auth/register/user` | – | Adoptierenden-Konto anlegen |
| POST | `/auth/register/shelter` | – | Tierheim-Konto anlegen |
| POST | `/auth/login` | – | Login für beide Rollen, liefert Token |
| POST | `/auth/logout` | User/Shelter | Logout |
| GET | `/auth/me` | User/Shelter | Eingeloggtes Konto und Rolle |

## Nutzerprofil

| Methode | Pfad | Auth | Zweck |
| ------- | ---- | ---- | ----- |
| GET | `/users/me` | User | Eigenes Profil abrufen |
| PATCH | `/users/me` | User | Profil bearbeiten (Wohnsituation, Garten, Kinder …) |
| DELETE | `/users/me` | User | Konto löschen |
| PUT | `/users/me/picture` | User | Profilbild hochladen |
| DELETE | `/users/me/picture` | User | Profilbild entfernen |
| GET | `/users/{id}` | Shelter | Profil eines Anfragenden (nur bei bestehendem Interest) |
| GET | `/users/{id}/picture` | User/Shelter | Profilbild abrufen |

## Suchfilter

| Methode | Pfad | Auth | Zweck |
| ------- | ---- | ---- | ----- |
| GET | `/users/me/filters` | User | Eigene Filter auflisten |
| POST | `/users/me/filters` | User | Filter anlegen |
| PATCH | `/users/me/filters/{id}` | User | Filter ändern |
| DELETE | `/users/me/filters/{id}` | User | Filter löschen |

## Discovery / Swipe

| Methode | Pfad | Auth | Zweck |
| ------- | ---- | ---- | ----- |
| GET | `/discovery?limit=` | User | Nächste Tierkarten: veröffentlicht, gefiltert, noch nicht geswipt |
| POST | `/animals/{id}/swipe` | User | `{ liked }` → Interest `user_liked` / `user_disliked` |

## Tiere und Tierheime (öffentliche Ansicht, UC-02)

| Methode | Pfad | Auth | Zweck |
| ------- | ---- | ---- | ----- |
| GET | `/animals/{id}` | User | Tierprofil inkl. Tags, Bild-IDs, Tierheimname; `404` wenn nicht veröffentlicht |
| GET | `/animals/{id}/pictures/{pictureId}` | – | Bild als Binärdaten |
| GET | `/shelters/{id}` | User | Öffentliches Tierheimprofil |
| GET | `/shelters/{id}/animals` | User | Veröffentlichte Tiere eines Tierheims |

## Tierheimprofil und Tierverwaltung (UC-03)

| Methode | Pfad | Auth | Zweck |
| ------- | ---- | ---- | ----- |
| GET | `/shelters/me` | Shelter | Eigenes Tierheimprofil |
| PATCH | `/shelters/me` | Shelter | Tierheimprofil bearbeiten |
| DELETE | `/shelters/me` | Shelter | Tierheimkonto löschen |
| GET | `/shelters/me/animals` | Shelter | Alle eigenen Tiere inkl. unveröffentlichter (Dashboard) |
| POST | `/shelters/me/animals` | Shelter | Tier anlegen |
| GET | `/shelters/me/animals/{id}` | Shelter | Eigenes Tier zum Bearbeiten laden |
| PATCH | `/shelters/me/animals/{id}` | Shelter | Tier bearbeiten; `403` bei fremdem Tier |
| DELETE | `/shelters/me/animals/{id}` | Shelter | Tier löschen (Bilder per Cascade) |
| PUT | `/shelters/me/animals/{id}/tags` | Shelter | `{ tagIds }` ersetzt alle Tags |
| POST | `/shelters/me/animals/{id}/pictures` | Shelter | Foto hochladen |
| PATCH | `/shelters/me/animals/{id}/pictures/{pictureId}` | Shelter | Als Hauptbild setzen; andere verlieren `showOnCard` |
| DELETE | `/shelters/me/animals/{id}/pictures/{pictureId}` | Shelter | Foto löschen |

## Interessen / Meet & Greet

Status-Ablauf: `user_liked` → `user_requested` → `shelter_deadline` (Termin gesetzt) → `shelter_completed`.
`user_disliked` ist ein Endzustand und blendet das Tier in der Discovery aus.

| Methode | Pfad | Auth | Zweck |
| ------- | ---- | ---- | ----- |
| GET | `/users/me/interests?status=` | User | Eigene Likes und Anfragen |
| POST | `/users/me/interests/{animalId}/request` | User | Besuch anfragen → `user_requested` |
| DELETE | `/users/me/interests/{animalId}` | User | Like/Anfrage zurückziehen |
| GET | `/shelters/me/interests?status=&animalId=` | Shelter | Eingegangene Anfragen |
| PATCH | `/shelters/me/interests/{animalId}/{userId}` | Shelter | Termin setzen (`shelter_deadline` + `appointmentAt`) oder `shelter_completed` |

## Stammdaten

| Methode | Pfad | Auth | Zweck |
| ------- | ---- | ---- | ----- |
| GET | `/species` | – | Tierarten für Dropdowns/Filter |
| POST | `/species` | Admin | Tierart anlegen |
| PATCH | `/species/{id}` | Admin | Tierart umbenennen |
| DELETE | `/species/{id}` | Admin | Tierart löschen |
| GET | `/species/{id}/breeds` | – | Rassen einer Tierart |
| POST | `/breeds` | Admin | Rasse anlegen |
| PATCH | `/breeds/{id}` | Admin | Rasse ändern |
| DELETE | `/breeds/{id}` | Admin | Rasse löschen |
| GET | `/tags` | – | Alle Tags |
| POST | `/tags` | Admin | Tag anlegen |
| PATCH | `/tags/{id}` | Admin | Tag umbenennen |
| DELETE | `/tags/{id}` | Admin | Tag löschen |

## Optional (Erweiterungen laut README)

| Methode | Pfad | Auth | Zweck |
| ------- | ---- | ---- | ----- |
| GET | `/shelters/me/dashboard` | Shelter | Kennzahlen: Tiere, offene Anfragen, nächste Termine |
| GET | `/shelters?near=` | – | Tierheime für Kartenansicht |
| GET/PATCH/DELETE | `/admin/users[/{id}]`, `/admin/shelters[/{id}]` | Admin | Systemadministration |

## Offene Punkte im Schema

1. **Sichtbarkeit:** UC-02/UC-03 verlangen veröffentlichte bzw. vollständige Profile, `animals` hat dafür keine Spalte. Entweder `isPublished` ergänzen oder Vollständigkeit bei der Abfrage berechnen (z. B. mindestens ein Bild mit `showOnCard`).
2. **`passwordHash` in den Create-Schemas:** Der Client sollte `password` schicken, das Backend hasht.
3. **`shelter_deadline`:** Hier als „Termin gesetzt“ interpretiert. Soll der User den Termin bestätigen können, fehlt ein Status.
4. **Termin-Slots:** Sollen Tierheime freie Zeiten anbieten, braucht es eine eigene Tabelle plus `/shelters/me/slots`.
