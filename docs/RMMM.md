# Risikoliste (RMMM)

*Projekt: CoupleGOATS · Team: Mika, Carolin, Aaron, Constantin*

RMMM steht für Risk Mitigation, Monitoring and Management (Risikominderung, Überwachung und
Steuerung). Diese Liste ist ein lebendes Dokument: Wir schauen bei jedem Sprintwechsel darauf und
ändern das Datum jeder Zeile, die wir anfassen.

## Unsere Skala

<!-- Eure Skala, eure Worte. Vorlesung 10, Folie 18 zeigt ein Beispiel als Ausgangspunkt – ändert
     die Worte, bis ihr alle dasselbe unter jeder Zahl versteht. Fünf Stufen sind üblich, drei
     gehen auch. -->

| Wert | Wahrscheinlichkeit | Auswirkung |
| :--: | ------------------ | ---------- |
|  1   | [Worte]            | [Worte]    |
|  2   | [Worte]            | [Worte]    |
|  3   | [Worte]            | [Worte]    |
|  4   | [Worte]            | [Worte]    |
|  5   | [Worte]            | [Worte]    |

Score = Wahrscheinlichkeit × Auswirkung.

**Unsere Schwellenwerte:** ab [Score]: sofort handeln · ab [Score]: planen · darunter: beobachten

## Risiken

<!-- Eine Zeile pro Risiko, sortiert nach Score, höchster zuerst. Art: Projekt, technisch oder
     geschäftlich. Status: offen, eingetreten oder geschlossen. Aktualisiert: Datum der letzten
     Änderung. -->

| ID   | Risiko, kurz                              | Art       | W   | A   | Score   | Verantwortlich | Status | Aktualisiert |
| ---- | ----------------------------------------- | --------- | --- | --- | ------- | -------------- | ------ | ------------ |
| R-03 | Teammitglied fällt aus                    | Projekt   | 3   | 4   | 12      | Mika           | offen  | 19.11.26     |
| R-01 | Single Point of Failure (Backend-Instanz) | technisch | 3   | 3   | 9       | Constantin     | offen  | 18.11.26     |
| R-02 | [ein paar Worte]                          |           |     |     |         | [Name]         | offen  | [TT.MM.JJ]   |

W = Wahrscheinlichkeit, A = Auswirkung.

<!-- Ein Risiko mit Auswirkung 5, das ihr nicht ausführlich beschreibt: hier ein Satz dazu, was ihr
     tun würdet, wenn es eintritt. -->

<!-- Kopiert den folgenden Block für jedes Risiko, das ihr ausführlich beschreibt. -->

### R-01 Single Point of Failure (Backend-Instanz)

*Verantwortlich: Constantin*

**Risiko.** Weil das Backend wegen SQLite nur als eine einzige Instanz auf einem einzigen Server läuft
(Replik 1, Strategie `Recreate`), nur Constantin Zugriff auf den Server hat (SSH ist nur für ihn
offen) und uns bei einem Ausfall niemand automatisch benachrichtigt, kann ein Absturz, ein
fehlerhaftes Release oder ein Serverausfall die gesamte API unterbrechen und niemand außer
Constantin kann sie neu starten, sodass die Demo oder die Nutzung ausfällt, bevor wir es merken.

**Bewertung.** Wahrscheinlichkeit 3 × Auswirkung 3 = 9. Bei einer Instanz sind Ausfälle möglich
(schon jedes Update bedeutet kurze Downtime), aber die Daten bleiben erhalten und ein Neustart
dauert meist nur Minuten, deshalb verfehlen wir höchstens ein Sprintziel und haben nicht „keine
Demo“. [Mit dem Zugriff nur bei Constantin neu bewerten: Fällt er am Demo-Tag aus, wäre die
Auswirkung höher.]

**Mitigation.** (1) Einen Uptime-Check mit Benachrichtigung einrichten, der `/api/test` jede Minute
prüft und Constantin sowie das Team benachrichtigt; bisher prüft uns niemand automatisch. (2) Neustart
und Rollback als Runbook in `docs/` beschreiben. (3) Eine lokale Demo (Backend und Frontend mit
Beispieldaten) vorbereiten und vor der Präsentation einmal proben, damit das Team sie ohne
Serverzugang zeigen kann. (4) Ab 24 Stunden vor der Präsentation keine Deployments mehr, und
Constantin ist am Präsentationstag erreichbar. Dass nur Constantin Zugriff auf den Server hat und
das Backend nur eine Instanz ist (ADR-01), akzeptieren wir bewusst.

**Indikator.** Der Uptime-Check meldet zwei Prüfungen in Folge einen Fehler, oder `kubectl get
pods` zeigt mehr als zwei Neustarts des Backend-Pods in 24 Stunden, oder Constantin ist vor der
Präsentation länger als einen Tag nicht erreichbar.

**Contingency.** (1) Constantin startet das Backend neu: `kubectl --context nodeharbor-dedi -n
customer-couplegoats rollout restart deploy/couplegoats-backend`. (2) Läuft nach einem Release
nichts mehr, setzt er in `infra/customers/couplegoats/backend.yaml` des Infrastruktur-Repositories
den Image-Tag auf den letzten funktionierenden Commit zurück; Argo CD rollt ihn aus. (3) Ist der
Server nicht erreichbar oder Constantin nicht verfügbar, zeigt das Team die lokale Demo und sagt das
offen.

<!-- Vorlage für die übrigen Risiken: Block kopieren, ID und Name ersetzen. -->

### R-02 [Risiko, kurz]

*Verantwortlich: [Name]*

**Risiko.** Weil [Ursache – was heute schon wahr ist], kann [Ereignis – was passieren kann], sodass
[Wirkung – was es uns kosten würde].

**Bewertung.** Wahrscheinlichkeit [Wert] × Auswirkung [Wert] = [Score]. [Ein Satz: Warum diese
Zahlen?]

**Mitigation.** [Was wir tun, bevor es passiert, damit es weniger wahrscheinlich oder weniger
schlimm wird. Oder: akzeptiert, weil …]

**Indikator.** [Das Warnzeichen, auf das wir achten.]

**Contingency.** [Unser Plan B: Was wir tun, wenn es trotzdem eingetreten ist.]

### R-03 Teammitglied fällt aus

*Verantwortlich: Mika*

**Risiko.** Weil in früheren Gruppenprojekten vermehrt Leute vor dem Ende ausgestiegen sind, kann in unserem Team jemand ausfallen, sodass seine Tasks liegen bleiben und das Projekt nicht komplett fertig wird.

**Bewertung.** Wahrscheinlichkeit 3 × Auswirkung 4 = 12. Ein Ausfall ist, wie in vergangenen Projekten schon gesehen, realistisch, und würde die restlichen Teammitglieder mit Arbeit überhäufen, wobei das Projekt nicht komplett fertig werden würde, jedoch noch nicht komplett verloren ist.

**Mitigation.** Da ein Ausfall unvorhersehbar auftreten kann, können wir uns nicht 100 % sicher sein, ob es dazu kommt, jedoch haben wir durch unsere Aufteilung (2 Leute Backend, 2 Leute Frontend) schon vorgesorgt, damit bei einem Ausfall kein Bereich komplett verloren geht. Zudem haben wir festgelegt, uns rechtzeitig bei den Teammitgliedern zu melden, falls es zu einem Ausfall kommen könnte. So kann man rechtzeitig an einer Lösung arbeiten.

**Indikator.** Durch Kommunikation erfahren wir, falls eine Person von einer Exmatrikulation gefährdet ist. Die Indizien hierbei sind durchgefallene Prüfungen. Bei gesundheitlichen Gründen ist es leider nicht immer möglich, auf Indikatoren zu achten, da diese meistens spontan auftreten.

**Contingency.** Die Aufgabenverteilung der verbliebenen Mitglieder wird überarbeitet und evtl. werden Rollen neu verteilt. Je nach Zeitpunkt des Ausfalls werden bewusste Abstriche am Projekt gemacht, welche sich auf Funktionen niedriger Priorität beziehen.
