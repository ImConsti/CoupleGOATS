# CoupleGOATS

Tinder, aber für die Vermittlung von Tieren. Tierheime laden Profile der Tiere hoch, für die sie ein neues Zuhause suchen, und Nutzende swipen durch diese Profile. Kommt es zu einem „Match“ zwischen Nutzendem und Tier, kann ein Besuchstermin im Tierheim gebucht werden, um das Tier vor der Adoption kennenzulernen.

## Team

| Name       | GitHub                                     |
| ---------- | ------------------------------------------ |
| Carolin    | [@lin-m5](https://github.com/lin-m5)       |
| Mika       | [@mika630](https://github.com/mika630)     |
| Aaron      | [@brdly06](https://github.com/brdly06)     |
| Constantin | [@ImConsti](https://github.com/ImConsti)   |

## Use Cases

- **Swipe**: Tiere durchstöbern und per Swipe matchen
- **Tier-Detailansicht**: vollständiges Profil eines einzelnen Tieres
- **Tierprofile mit Tags**: Tierheime erstellen und bearbeiten Tierprofile
- **Nutzer- und Tierheimprofile**: Erstellung und Bearbeitung von Profilen für beide Rollen
- **Meet & greet**: Besuch bei einem Tier buchen, mit jeweils eigenen Ansichten für Nutzer*innen und Tierheim
- **Tierheim-Dashboard**: Übersicht für Tierheime

Mögliche Erweiterungen:

- Systemadministration mit eigener Ansicht
- Kartenansicht
- Authorization

## Tech stack

**Frontend:** React, Next.js, TypeScript, Tailwind

**Backend:** TypeScript, Express, SQLite

## Projektstruktur

Monorepo:

```
apps/
  frontend/   Next.js 16 (App Router, Tailwind)  → http://localhost:3000
  backend/    Express 5 + SQLite (node:sqlite)  → http://localhost:4000
```
