# UC-01 Tiere swipen

<!--
HOW TO USE THIS TEMPLATE
- Copy this file per use case and name it UC-01_[name].md, UC-02_[name].md, …
- Replace every [placeholder] in square brackets.
- Name: verb plus object, one goal reached in one sitting ("Book a room", not "Click Save").
- Describe what the actor and the system exchange, not which button is clicked —
  the mockup shows the screen.
- Delete these comments once the use case is done.
- Structure after the RUP template "Use-Case Specification":
  https://cin.ufpe.br/~if682/RUP/webtmpl/templates/req/rup_ucspec.htm
-->

| Author | Estimate | User stories |
| ------ | -------- | ------------ |
| Mika | 2 | #16, #18, #21, #24 |     

## 1 Brief description

<!-- One paragraph: the purpose of the use case and the value for the actor. -->

Dieser Use Case beschreibt, wie ein angemeldeter Nutzer Tiere entdecken und hinsichtlich seines Interesses bewerten kann. Das System zeigt jeweils eine Tierkarte mit Bild, Name, Alter, Rasse, Tierheim, Entfernung und Eigenschaften des Tieres an. Da es sich um eine Desktop-Anwendung handelt, erfolgt die Bewertung nicht durch tatsächliche Wischbewegungen, sondern über Like- und Dislike-Schaltflächen. Zusätzlich kann der Nutzer die angezeigten Tiere mithilfe von Filtern, beispielsweise nach Tierart oder Rasse, eingrenzen. Ein Algorithmus bestimmt, welche verfügbaren Tiere dem Nutzer als Nächstes angezeigt werden. Ziel ist es, dem Nutzer passende Tiere für eine mögliche Adoption vorzuschlagen.

## 2 Actors

- **Primary:** Adoptierender Nutzer
- **Secondary:** Tierheim, das Tierprofile erstellt
- **Secondary:** Datenbank und Algorithmus zur Identifikation passender Tiere

## 3 Mockup

![discover_page](</docs/mockups/UC-01_mockup.png>)
<!-- A wireframe is enough. Show the key step of this use case. -->


## 4 Flow of events

### 4.1 Basic flow

<!-- The success case, 3 to 9 numbered steps (Cockburn). Actor and system take turns. -->

1. Shelter: Ein Shelter erstellt und veröffentlicht Tierprofile mit den erforderlichen Informationen und Bildern. Dieser Vorgang wird im separaten Use Case „UC-03 Tierprofil verwalten“ beschrieben.

2. Nutzer: Der Nutzer öffnet die Discovery Page.

3. Frontend: Das Frontend fordert vom Backend das nächste anzuzeigende Tier an. Dabei werden gegebenenfalls aktive Filter übermittelt.

4. Backend: Das Backend ermittelt mithilfe des Auswahlalgorithmus ein geeignetes, verfügbares Tier. Dabei berücksichtigt es die aktiven Filter und bereits bewertete Tiere.

5. Backend und Datenbank: Das Backend ruft die Informationen des ausgewählten Tierprofils aus der Datenbank ab und übermittelt sie an das Frontend.

6. Frontend: Das Frontend zeigt die Tierkarte mit Bild, Name, Alter, Rasse, Tierheim, Entfernung und Eigenschaften an.

7. Nutzer: Der Nutzer bewertet das angezeigte Tier, indem er die Like- oder Dislike-Schaltfläche auswählt.

8. Frontend: Das Frontend übermittelt die Bewertung und die Kennung des Tieres an das Backend.

9. Backend und Datenbank: Das Backend verarbeitet die Bewertung und speichert sie in der Datenbank.

10. Frontend und Backend: Nach erfolgreicher Speicherung fordert das Frontend das nächste Tier an. Das Backend ermittelt anhand des Auswahlalgorithmus das nächste geeignete Tier.

11. Frontend: Das Frontend zeigt die nächste Tierkarte an. Die Schritte 7 bis 11 wiederholen sich, bis der Nutzer die Seite verlässt oder keine passenden Tiere mehr verfügbar sind.

### 4.2 Alternative flows

<!-- Name the step where each flow branches off and where it continues or ends.
     Errors, cancellations, and conflicts between users belong here.
     If your diagram shows another use case extending this one («extend»), name the step
     where it can start: "Extension point: …". If this use case always uses another one
     («include»), write it into the step: "(includes UC-07)". -->

**4a · Keine passenden Tiere verfügbar.** In Schritt 4 stellt das Backend fest, dass kein veröffentlichtes, verfügbares Tier den Auswahlkriterien entspricht. Das Backend meldet dies an das Frontend. Das Frontend informiert den Nutzer, dass derzeit keine passenden Tiere verfügbar sind. Der Use Case endet, sofern der Nutzer die Filter nicht anpasst.

**6a · Weitere Tierinformationen anzeigen.** In Schritt 6 möchte der Nutzer weitere Informationen über das angezeigte Tier erhalten. Er wählt „More info“ aus. Das Frontend öffnet die Detailansicht des Tierprofils. Nach der Rückkehr zur Tierentdeckungsseite wird die bisherige Tierkarte wieder angezeigt. Der Ablauf wird bei Schritt 6 fortgesetzt.

**7a · Filter anpassen.** In Schritt 7 möchte der Nutzer die Auswahl der Tiere eingrenzen oder verändern. Das Frontend ermöglicht die Anpassung der verfügbaren Filter, beispielsweise nach Tierart oder Rasse. Anschließend fordert das Frontend unter Übermittlung der aktualisierten Filter ein passendes Tier vom Backend an. Der Ablauf wird bei Schritt 4 fortgesetzt.

**8a · Bewertung konnte nicht übermittelt werden.** In Schritt 8 schlägt die Übermittlung der Bewertung aufgrund eines Netzwerk- oder Serverfehlers fehl. Das Frontend informiert den Nutzer über den Fehler und ermöglicht einen erneuten Versuch. Die aktuelle Tierkarte bleibt angezeigt, bis die Bewertung erfolgreich verarbeitet wurde.

**9a · Bewertung bereits vorhanden.** In Schritt 9 erkennt das Backend, dass für den Nutzer und das betreffende Tier bereits eine Bewertung gespeichert wurde. Das Backend verhindert eine doppelte Speicherung und meldet den entsprechenden Status. Sofern die vorhandene Bewertung bereits verarbeitet wurde, kann der Ablauf mit der Ermittlung des nächsten Tieres fortgesetzt werden.

**10a · Keine weiteren Tiere verfügbar.** In Schritt 10 kann das Backend kein weiteres Tier ermitteln, das den Auswahlkriterien entspricht und noch angezeigt werden kann. Das Backend übermittelt diese Information an das Frontend. Das Frontend informiert den Nutzer, dass keine weiteren passenden Tiere verfügbar sind. Der Use Case endet.

### 4.3 Sequence diagram

<!-- The flow above over time: the actor, your frontend, your backend, your database.
     Show an alternative flow as an alt fragment where it matters.
     Commit the source file (PlantUML, draw.io, …) next to the image. -->

![Sequence diagram UC-01](</docs/diagrams/UC-01_sequence.png>)

### 4.4 Activity diagram
<!-- The flow of events as an activity diagram. Commit the source file next 
to the image. -->
![Activity diagram UC-[NN]](../diagrams/UC-01_activity.png)

## 5 Special requirements

<!-- Quality requirements for this use case only, each with an ID that is unique in the
     whole SRS, e.g.,
     NFR-P-02 — The confirmation shall appear within 1 s for 95 % of the bookings.
     System-wide ones go into SRS sections 3.2 to 3.5. Write "None" if there are none. -->

**NFR-P-01:** Das nächste passende Tier soll unter normalen Betriebsbedingungen innerhalb von zwei Sekunden nach erfolgreicher Verarbeitung der vorherigen Bewertung angezeigt werden.

**NFR-R-01:** Eine Bewertung darf bei einem fehlgeschlagenen Request nicht unbemerkt verloren gehen. Das Frontend darf erst nach erfolgreicher Verarbeitung der Bewertung zum nächsten Tier wechseln.

**NFR-U-01:** Die Like- und Dislike-Schaltflächen müssen in der Desktop-Anwendung eindeutig unterscheidbar und einfach bedienbar sein.

**NFR-F-01:** Das Backend muss die vom Frontend übermittelten Filter bei der Ermittlung der angezeigten Tiere berücksichtigen.

**NFR-D-01:** Bereits gespeicherte Bewertungen dürfen nicht versehentlich doppelt angelegt werden.

## 6 Preconditions

<!-- The state of the system before the use case can start, e.g., "The user is logged in." -->

- Der Nutzer ist registriert und angemeldet.

- Der Nutzer hat Zugriff auf die Tierentdeckungsseite.

- Mindestens ein Shelter hat Tierprofile erstellt und veröffentlicht, die grundsätzlich für die Anzeige infrage kommen.

- Die veröffentlichten Tierprofile sind in der Datenbank gespeichert.

- Das Frontend kann Anfragen an das Backend senden.

- Das Backend kann auf die Datenbank zugreifen und den Auswahlalgorithmus ausführen.

## 7 Postconditions

<!-- The state of the system after the use case, e.g., "The booking is stored." -->

- Die Like- oder Dislike-Entscheidung wurde bei erfolgreicher Verarbeitung in der Datenbank gespeichert.

- Das Backend hat das nächste geeignete Tier anhand des Auswahlalgorithmus und der aktiven Filter ermittelt, sofern weitere passende Tiere verfügbar sind.

- Das Frontend zeigt das nächste Tier an oder informiert den Nutzer darüber, dass keine passenden Tiere mehr verfügbar sind.

- Bereits vorhandene Bewertungen werden nicht doppelt gespeichert.

- Die vom Nutzer ausgewählten Filter werden bei der Ermittlung der angezeigten Tiere berücksichtigt.

- Die Tierprofile bleiben durch diesen Use Case unverändert; ihre Erstellung und Verwaltung erfolgt über den separaten Use Case zur Tierprofilverwaltung.
