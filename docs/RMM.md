# Risk List (RMMM)

*Project: [project name] · Team: [names]*

RMMM stands for Risk Mitigation, Monitoring and Management. This list is a living document: we
look at it at every sprint change and change the date of every row we touch.

## Our Scale

<!-- Your scale, your words. Lecture 10, slide 18 shows an example you may start from — change the
     words until all of you mean the same by each number. Five steps are usual; three work, too. -->

| Value | Probability | Impact  |
| :---: | ----------- | ------- |
|   1   | [words]     | [words] |
|   2   | [words]     | [words] |
|   3   | [words]     | [words] |
|   4   | [words]     | [words] |
|   5   | [words]     | [words] |

Score = probability × impact.

**Our thresholds:** from [score]: act now · from [score]: plan · below that: watch

## Risks

<!-- One row per risk, sorted by score, highest first. Kind: project, technical or business.
     Status: open, occurred or closed. Updated: date of the last change. -->

| ID   | Risk, short   | Kind      | P | I | Score | Owner  | Status | Updated    |
| ---- | ------------- | --------- | - | - | ----- | ------ | ------ | ---------- |
| R-01 | [a few words] | technical |   |   |       | [name] | open   | [DD.MM.YY] |
| R-02 | [a few words] |           |   |   |       | [name] | open   | [DD.MM.YY] |
| R-03 | Teammitglied fällt aus | project | 3 | 4 | 12 | Mika | open   | 19.11.26 |

<!-- A risk with impact 5 that you do not write in full: one sentence here on what you would do if
     it occurred. -->

<!-- Copy the following block once for each risk you write in full. -->

### R-01 [Risk, short]

*Owner: [name]*

**Risk.** Because [cause — what is already true today], [event — what may happen], so [effect —
what it would cost us].

**Rating.** Probability [value] × impact [value] = [score]. [One sentence: why these numbers.]

**Mitigation.** [What we do before it happens, so that it becomes less likely or less harmful.
Or: accepted, because …]

**Indicator.** [The warning sign we watch for.]

**Contingency.** [Our plan B: what we do when it has happened anyway.]

### R-03 Teammitglied fällt aus

*Owner: Mika*

**Risk.** Weil in früheren Gruppenprojekten vermehrt Leute vor dem Ende ausgestiegen sind, kann in unserem Team jemand ausfallen, sodass seine Tasks liegen bleiben und das Projekt nicht komplett fertig wird.

**Rating.** Probability 3 × impact 4 = 12. Ein Ausfall ist, wie in vergangenen Projekten schon gesehen, realistisch, und würde die restlichen Teammitglieder mit Arbeit überhäufen, wobei das Projekt nicht komplett fertig werden würde, jedoch noch nicht komplett verloren ist.

**Mitigation.** Da ein Ausfall unvorhersehbar auftreten kann können wir und nicht 100% sicher sein ob es dazu kommt, jedoch haben wir durch unsere Aufteilung (2 Leute Backend, 2 Leute Frontend) schon vorgesorgt, damit bei einem Ausfall kein Bereich komplett verloren geht. Zudem haben wir festgelegt uns rechtzeitig bei den Teammitgliedern zu melden falls es zu einem Ausfall kommen könnte. So kann man rechtzeitig an einer Lösung arbeiten.

**Indicator.** Durch Kommunikation erfahren wir falls eine Person von einer Exmatrkulation gefährdet ist. Die Indizien hierbei sind durchgefallene Prüfungen. Bei gesundheitlichen Gründen ist es leider nicht immer möglich auf Indikatoren zu achten, da diese meistens spontan auftreten.

**Contingency.** Die Aufgabenverteilung der verbliebenen Mitglieder wird überarbeitet und evtl. werden Rollen neu verteilt. Je nach Zeitpunkt des Ausfalls, werden bewusste Abstriche am Projekt gemacht, welche sich auf Funktionen niedriger Priorität beziehen.
