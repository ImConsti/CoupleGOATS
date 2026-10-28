# CoupleGOATS — Software Architecture Document

<!--
HOW TO USE THIS TEMPLATE
- Copy this file into the docs/ folder of your repository, next to SRS.md.
- Replace every [placeholder] in square brackets. Comments like this one are guidance: they
  are invisible on GitHub, and you may delete them once a section is done.
- Keep every heading and its number. Sections marked "Lecture 7" or later stay as they are
  until that lecture. If a section does not apply, write "Not applicable" and one sentence why.
- Every section you write names its author: in the "Author" line below its heading, or in
  the Author column of a table.
- Put every diagram into docs/diagrams/, the image together with its source file.
- Structure after the RUP template "Software Architecture Document":
  https://cin.ufpe.br/~if682/RUP/webtmpl/templates/a_and_d/rup_sad.htm
-->

| Team | Version | Last change |
| ---- | ------- | ----------- |
| CoupleGOATS | 0.1 | 28.10.2026 |

The Git history of this file is the revision history.

## Table of contents

1. [Introduction](#1-introduction)
2. [Architectural representation](#2-architectural-representation)
3. [Architectural goals and constraints](#3-architectural-goals-and-constraints)
4. [Use-case view](#4-use-case-view)
5. [Logical view](#5-logical-view)
6. [Process view](#6-process-view)
7. [Deployment view](#7-deployment-view)
8. [Implementation view](#8-implementation-view)
9. [Data view](#9-data-view)
10. [Size and performance](#10-size-and-performance)
11. [Quality](#11-quality)

## 1 Introduction

### 1.1 Purpose

*Author: Mika*

<!-- One paragraph: what this document describes and who reads it — your team, the developer
     who takes the project over, and the lecturer as investor. -->

Dieses Dokument beschreibt die Architektur der Webanwendung CoupleGOATS: aus welchen Teilen die Anwendung besteht, wie diese miteinander verbunden sind und wo sie laufen.

Es richtet sich an das Entwicklungsteam als gemeinsame Grundlage für Entwurfsentscheidungen, an Entwickelnde, die das Projekt später übernehmen und sich schnell einen Überblick über den Aufbau verschaffen müssen, sowie an den Dozenten als Investor, der die Architektur nachvollziehen und bewerten möchte. Die Anforderungen, aus denen sich die Architektur ableitet, stehen in der [SRS](SRS.md); dieses Dokument beschreibt, wie sie technisch umgesetzt werden.



### 1.2 Scope

*Author: Mika*

<!-- One or two sentences: which software this document covers, e.g., the whole application
     with frontend, backend, and database. The functional scope is in SRS 1.2 — link it. -->

Dieses Dokument umfasst die gesamte Anwendung CoupleGOATS: das Frontend (Next.js), das Backend (Express) mit seiner REST-API und die SQLite-Datenbank, die gemeinsam im Monorepo unter `apps/frontend` und `apps/backend` liegen. Nicht Teil dieses Dokuments sind externe Softwaredienste, da die Anwendung derzeit keine nutzt (siehe [SRS 3.9.3](SRS.md#393-software-interfaces)). Der funktionale Umfang ist in [SRS 1.2](SRS.md#12-scope) beschrieben.


### 1.3 Definitions, acronyms and abbreviations

*Author: Mika*

<!-- Terms of the domain are in the SRS and in your domain model. Add only the technical terms
     a reader of this document needs. -->

| Term | Meaning |
| ---- | ------- |
| SAD | Software Architecture Document |
| SRS | Software Requirements Specification |
| UCR | Use-case realization |
| UML | Unified Modeling Language, Notation für die Architekturdiagramme dieses Dokuments |
| REST | Representational State Transfer, Architekturstil der HTTP-Schnittstelle zwischen Frontend und Backend |
| JSON | JavaScript Object Notation, Datenformat, in dem Frontend und Backend Nutzdaten austauschen |
| HTTPS | HTTP über TLS, verschlüsselter Übertragungsweg zwischen Browser und Server |
| JWT | JSON Web Token, signiertes Token, mit dem sich ein angemeldetes Konto gegenüber geschützten Endpunkten ausweist |
| Next.js | React-Framework, mit dem das Frontend gebaut wird (App Router) |
| Express | Web-Framework für Node.js, auf dem das Backend und seine REST-API aufbauen |
| Zod | TypeScript-Bibliothek zur Validierung eingehender Anfragen im Backend |
| ORM | Object-Relational Mapping; im Projekt Drizzle ORM für Datenzugriff, Schema und Migrationen |
| SQLite / libSQL | Dateibasierte relationale Datenbank bzw. der Client, über den das Backend darauf zugreift |
| OpenAPI | Standardformat zur Beschreibung von REST-Schnittstellen, hier in `openapi.yaml` |
| Repository (Entwurfsmuster) | Klasse, die den Datenzugriff auf eine Datenbankentität kapselt; nicht zu verwechseln mit dem Git-Repository |
| Service | Backend-Klasse, die die fachliche Logik eines Anwendungsfalls enthält |
| Docker | Container-Technik, mit der Frontend und Backend als Images ausgeliefert werden |
| GitHub Actions | CI/CD-Dienst von GitHub, der bei jedem Push auf `main` die Docker-Images baut |
| Monorepo | Ein Git-Repository, das mehrere Anwendungen enthält, hier Frontend und Backend |

Begriffe der Fachdomäne stehen in [SRS 1.3](SRS.md#13-definitions-acronyms-and-abbreviations) und im [Domain model](domain_model.md).



### 1.4 References

*Author: Mika*

| Title | Link |
| ----- | ---- |
| SRS | [SRS.md](SRS.md) |
| Domain model | [domain_model.md](domain_model.md) |
| Repository | [ImConsti/CoupleGOATS](https://github.com/ImConsti/CoupleGOATS) |
| Board | [CoupleGoats Board](https://github.com/users/ImConsti/projects/1) |
| Laufende Anwendung | [couplegoats.85.215.100.89.nip.io](https://couplegoats.85.215.100.89.nip.io/) |
| Use-Case-Realisierungen | [use_case_realizations/](use_case_realizations/) |
| API-Endpunkte | [api-endpoints.md](api-endpoints.md) |
| OpenAPI-Spezifikation | [openapi.yaml](../apps/backend/openapi.yaml) |
| RUP-Vorlage SAD | [rup_sad.htm](https://cin.ufpe.br/~if682/RUP/webtmpl/templates/a_and_d/rup_sad.htm) |

### 1.5 Overview

Section 2 names the views this document uses. Sections 3 to 11 describe the architecture view
by view, following the RUP template.

## 2 Architectural representation

*Author: Mika*

<!-- Which views you use and which diagram shows each. The table is prefilled with the views of
     Lecture 6 — adjust it if you add or drop a view. Later lectures add your architectural
     style and your architecture decisions here. -->

Die Architektur von CoupleGOATS wird in fünf Sichten beschrieben, die den Sichten der RUP-Vorlage entsprechen. Jede Sicht beantwortet eine eigene Frage und stützt sich auf die Diagramme, die das Team im Repository unter `docs/diagrams/` ablegt, jeweils als Bild zusammen mit seiner Quelldatei. Ein Paketdiagramm verwendet das Projekt nicht; die Aufteilung des Codes zeigt stattdessen das Komponentendiagramm. Die Process view wird durch eine Kurzbeschreibung abgedeckt. Die Sequenzdiagramme der Use-Case-Realisierungen ergänzen sie um den zeitlichen Ablauf einzelner Anwendungsfälle.

| View | Question it answers | Diagram | Section |
| ---- | ------------------- | ------- | ------- |
| Use-case view | Was leistet das System, und für wen? | [Use-Case-Diagramm](diagrams/use-case-diagram.png) ([Quelle](diagrams/use-case-diagram.puml)), [Use-Case-Realisierungen UCR-01 bis UCR-06](use_case_realizations/) | 4 |
| Logical view | Welche Klassen gibt es, und wie hängen sie zusammen? | [Domain model](diagrams/domain_model.png) ([Quelle](diagrams/domain_model.mmd)), Klassendiagramme der Realisierungen (`diagrams/UCR-01_classes.png` bis `diagrams/UCR-06_classes.png`) | 5 |
| Process view | Was läuft gleichzeitig ab? | Kurzbeschreibung; Sequenzdiagramme der Realisierungen (`diagrams/UCR-01_sequence_design.png` bis `diagrams/UCR-06_sequence_design.png`) | 6 |
| Deployment view | Was läuft wo, und wie ist es verbunden? | Deployment-Diagramm (folgt, `diagrams/deployment.png`) | 7 |
| Implementation view | Woraus besteht der Code? | [Komponentendiagramm](diagrams/components.png) ([Quelle](diagrams/components.puml)) | 8 |


## 3 Architectural goals and constraints

<!-- Lecture 7. The requirements and constraints that shape your architecture: quality goals
     such as availability or security, and constraints such as your stack (SRS 3.6), your team
     size, or your schedule. Leave this section as it is until then. -->

*Follows with Lecture 7.*

## 4 Use-case view

*Author: [first name]*

<!-- The use cases that matter most for your architecture — usually the ones you realized in
     Task 4. Link your use case diagram instead of copying it. -->

The use case diagram of the whole application is in [SRS 2.2](SRS.md#22-use-case-diagram). The
use cases most important for the architecture are: […]

### 4.1 Use-case realizations

<!-- One row per realization from Task 4. No new diagrams: link the files. -->

| Use case | Realization | Author |
| -------- | ----------- | ------ |
| [UC-02 Book a room](use_cases/UC-02_[name].md) | [UCR-02](use_case_realizations/UCR-02_[name].md) | [first name] |

## 5 Logical view

### 5.1 Overview

*Author: [first name]*

<!-- Link your domain model from Task 5. If you have a package diagram, put it here: the
     packages of your code and their dependencies, without cycles. -->

The domain model is in [domain_model.md](domain_model.md). […]

### 5.2 Architecturally significant design packages

<!-- Optional for now. Link the design classes of your realizations (UCR section 2.5) or describe
     your most important packages in one sentence each. -->

[…]

## 6 Process view

*Author: [first name]*

<!-- Optional for now. One or two sentences: which processes run, e.g., the frontend in the
     browser, the backend, the database — and anything that runs in the background, such as a
     scheduled job. -->

[…]

## 7 Deployment view

*Author: [first name]*

<!-- One UML deployment diagram: nodes (devices, execution environments), the artifacts that
     run on them, and the communication paths with their protocol. Draw the setup you plan for
     your final demo — or the one you use today, and say which. -->

![Deployment diagram](diagrams/deployment.png)

| Node | What runs there | Connected to |
| ---- | --------------- | ------------ |
| [Server] | [backend, database] | [browser: HTTPS] |

## 8 Implementation view


### 8.1 Overview

*Author: brdly06*

Das Komponentendiagramm zeigt die Architektur der Webanwendung CoupleGOATS mit Frontend, Backend, Datenbank und den wesentlichen Backend-Komponenten. Es basiert auf den technischen Vorgaben aus SRS 3.6, den Software-Schnittstellen aus SRS 3.9.3 sowie den Designklassen aus Task 5.

Das Frontend basiert auf Next.js, React und TypeScript. Es kommuniziert über die REST-API unter `/api/v1` mit dem Backend. Die Kommunikation erfolgt über HTTPS; die Nutzdaten werden im JSON-Format übertragen. Datei-Uploads verwenden `multipart/form-data`.

Das Backend basiert auf Node.js und Express. Es ist in API und Authentifizierung, fachliche Services, Persistence sowie Medienverarbeitung unterteilt. Die API-Komponente verarbeitet Anfragen und delegiert die fachliche Verarbeitung an die Services. Diese verwenden Repositories für den Datenzugriff und die Medienkomponente für die Verwaltung von Tierbildern.

Die Persistence-Komponente verwendet Drizzle ORM und den libSQL-Client, um auf die SQLite-Datenbank zuzugreifen. Gemäß SRS 3.9.3 werden die Daten einschließlich der Bilder in einer SQLite-Datei gespeichert. Das Frontend greift nicht direkt auf die Datenbank zu.

Laut SRS 3.9.3 sind derzeit keine externen Softwaredienste vorgesehen. Ein externer E-Mail-Dienst wird lediglich als mögliche spätere Erweiterung erwähnt und ist deshalb nicht als bestehende Komponente dargestellt.

Die Komponenten und ihre Verantwortlichkeiten sind in der folgenden Tabelle zusammengefasst. Die zugeordneten Klassen stammen aus den Designklassendiagrammen von Task 5. Die Zuordnung beschreibt die vorgesehene Architektur und bestätigt nicht, dass diese Klassen bereits implementiert sind.

| Component | Responsibility | Classes (Task 5) |
|---|---|---|
| Frontend | Benutzeroberfläche für Discovery, Tierdetails, Profilverwaltung, Matches, Terminverwaltung und Tierheim-Dashboard | DiscoveryPage, ShelterDashboardPage |
| API & Auth | REST-Endpunkte, Request-Validierung, Authentifizierung und Autorisierung | DiscoveryController, AnimalDetailController, AnimalProfileController, UserInterestsRouter, ShelterInterestsRouter, UsersRouter, ShelterDashboardController, authenticationHandler, roleHandler, zodValidation, errorHandler |
| Application Services | Fachliche Logik für Discovery, Tierprofile, Interessen, Termine, Nutzerprofile und Dashboard | DiscoveryService, AnimalDetailService, AnimalProfileService, InterestService, UserService, ShelterDashboardService |
| Persistence | Datenzugriff und Speicherung über Repositories und Drizzle ORM | AnimalRepository, AnimalPictureRepository, AnimalShelterRepository, InterestRepository, UserRepository, UserFilterRepository |
| Media Handling | Verarbeitung und Verwaltung hochgeladener Tier- und Profilbilder | PhotoStorageService |
| SQLite Database | Persistente Speicherung von Nutzern, Tierprofilen, Interessen, Terminen und Bildern | Animal, AnimalPicture, AnimalShelter, Interest, User, UserFilter |

Die REST-API ist die Schnittstelle zwischen Frontend und Backend. Die Datenbank wird ausschließlich über die Persistence-Komponente angesprochen. Die interne Aufteilung unterstützt die Trennung von Benutzeroberfläche, fachlicher Logik und Datenzugriff.


### 8.2 Layers

<!-- Lectures 8 and 9. The layers of your application and the rules between them. Leave this
     section as it is until then. -->

*Follows with Lectures 8 and 9.*

## 9 Data view

<!-- Optional for now. Later: your database schema or ER model, derived from your domain model. -->

*Follows later.*

## 10 Size and performance

<!-- Lecture 7. The numbers that shape your architecture, e.g., expected users and data, and
     your performance requirements from SRS 3.4. Leave this section as it is until then. -->

*Follows with Lecture 7.*

## 11 Quality

<!-- Lectures 7 to 9. How your architecture supports the qualities you need: availability,
     security, maintainability, … Leave this section as it is until then. -->

*Follows with Lectures 7 to 9.*
