# CoupleGOATS

Tinder, but for adopting animals. Animal shelters upload profiles of the animals they're looking to rehome, and users swipe through them. When a user matches with an animal, they can book a visit at the shelter to meet it in person before adopting.

## Team

| Name       | GitHub                                     |
| ---------- | ------------------------------------------ |
| Carolin    | [@lin-m5](https://github.com/lin-m5)       |
| Mika       | [@mika630](https://github.com/mika630)     |
| Aaron      | [@brdly06](https://github.com/brdly06)     |
| Constantin | [@ImConsti](https://github.com/ImConsti)   |

## Features

- **Swipe**: browse animals and swipe to match
- **Animal detail view**: full profile of a single animal
- **Animal profiles with tags**: shelters create and edit animal profiles
- **User and shelter profiles**: create and edit profiles for both
- **Meet & greet**: book a visit with an animal, with views for both the user and the shelter
- **Shelter dashboard**: overview for shelters

Possible extras:

- System admin with its own view
- Map view
- Authorization

## Tech stack

**Frontend:** React, Next.js, TypeScript, Tailwind

**Backend:** TypeScript, Express, SQLite

## Project structure

Monorepo:

```
apps/
  frontend/   Next.js 16 (App Router, Tailwind)  → http://localhost:3000
  backend/    Express 5 + SQLite (node:sqlite)  → http://localhost:4000
```
