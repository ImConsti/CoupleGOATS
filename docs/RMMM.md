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
|  1   | Fast ausgeschlossen            | Eine Stunde zeitverlust    |
|  2   | Unwahrscheindlich          | Ein Tag Zeitverlust    |
|  3   | Möglich            | Ein Sprintziel wird verfehlt    |
|  4   | Wahrscheindlich            | Ein Anwendungsfall fehlt in der Demo    |
|  5   | Nahezu sicher           | keine Demo möglich oder Datenverlust    |

Score = Wahrscheinlichkeit × Auswirkung.

**Unsere Schwellenwerte:** ab 15: sofort handeln · ab 5: planen · darunter: beobachten

## Risiken

<!-- Eine Zeile pro Risiko, sortiert nach Score, höchster zuerst. Art: Projekt, technisch oder
     geschäftlich. Status: offen, eingetreten oder geschlossen. Aktualisiert: Datum der letzten
     Änderung. -->

| ID   | Risiko, kurz                              | Art       | W   | A   | Score   | Verantwortlich | Status | Aktualisiert |
| ---- | ----------------------------------------- | --------- | --- | --- | ------- | -------------- | ------ | ------------ |
| R-03 | Teammitglied fällt aus                    | Projekt   | 3   | 4   | 12      | Mika           | offen  | 19.11.26     |
| R-01 | Single Point of Failure (Backend-Instanz) | technisch | 3   | 3   | 9       | Constantin     | offen  | 18.11.26     |
| R-02 | Datenverlust                         |      technisch     | 3    |  5  |   15      | Carolin        | offen  | 19.11.26  |

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

### R-02 Datenverlust

*Verantwortlich: Carolin*

**Risiko.** Weil alle Daten in einer einzigen SQLite-Datei auf einem Volume liegen, kann eine fehlerhafte Migration, ein Absturz des Backends oder ein beschädigtes Volume die Daten beschädigen oder löschen, sodass User, Tierprofile, Matches und Termine fehlen.

**Bewertung.** Wahrscheinlichkeit 3 × Auswirkung 5 = 15. Wir spielen laufend neue Migrationen automatisch auf die einzige Datenbankdatei ein. 
Ein Verlust der Daten wäre auf unserer Skala der schlimmste Fall.

**Mitigation.** Wir verringern den Schaden, indem das Volume mit der Datenbankdatei täglich mit Velero gesichert wird. 
Der Datenverlust ist dadurch auf höchstens einen Tag begrenzt, egal ob er durch eine fehlerhafte Migration, einen Absturz des Backends oder ein beschädigtes Volume entsteht. 
Die Sicherung läuft automatisch und braucht keinen Eingriff im Backend.

**Indikator.** Wir beobachten bei jedem Deployment, ob die Anwendung sauber läuft. 
Warnzeichen sind eine fehlgeschlagene Migration, ein Backend, das nicht richtig startet oder mehrfach neu startet, Fehlermeldungen zum Zugriff auf die Datenbankdatei oder das Volume sowie eine fehlgeschlagene tägliche Velero-Sicherung.

**Contingency.** Zuerst stoppen wir neue Deployments und skalieren das Backend auf 0 Replikas, damit nichts mehr in die Datenbankdatei schreibt.
Je nach Situation gehen wir dann wie folgt vor:
- Schlägt eine Migration fehl, sodass das Backend beim Start abbricht oder die Daten beschädigt sind, setzen wir das Backend auf die vorherige Version zurück. 
Danach stellen wir das Volume mit Velero auf die letzte Tagessicherung zurück und starten das Backend wieder.
- Stürzt das Backend ab, ohne dass eine Migration die Ursache ist, lassen wir die Backend-Version zunächst unverändert. 
Wir prüfen in den Logs, wann und warum der Absturz passiert ist. 
Sind Daten unvollständig oder fehlerhaft, stellen wir das Volume mit Velero aus der letzten Tagessicherung wieder her. 
Andernfalls starten wir das Backend neu.
- Ist das Volume beschädigt oder verloren, stellen wir es mit Velero aus der letzten Tagessicherung wieder her und starten das Backend wieder.

Anschließend prüfen wir in allen Fällen, ob die Anwendung startet und die Daten vorhanden sind.

### R-03 Teammitglied fällt aus

*Verantwortlich: Mika*

**Risiko.** Weil in früheren Gruppenprojekten vermehrt Leute vor dem Ende ausgestiegen sind, kann in unserem Team jemand ausfallen, sodass seine Tasks liegen bleiben und das Projekt nicht komplett fertig wird.

**Bewertung.** Wahrscheinlichkeit 3 × Auswirkung 4 = 12. Ein Ausfall ist, wie in vergangenen Projekten schon gesehen, realistisch, und würde die restlichen Teammitglieder mit Arbeit überhäufen, wobei das Projekt nicht komplett fertig werden würde, jedoch noch nicht komplett verloren ist.

**Mitigation.** Da ein Ausfall unvorhersehbar auftreten kann, können wir uns nicht 100 % sicher sein, ob es dazu kommt, jedoch haben wir durch unsere Aufteilung (2 Leute Backend, 2 Leute Frontend) schon vorgesorgt, damit bei einem Ausfall kein Bereich komplett verloren geht. Zudem haben wir festgelegt, uns rechtzeitig bei den Teammitgliedern zu melden, falls es zu einem Ausfall kommen könnte. So kann man rechtzeitig an einer Lösung arbeiten.

**Indikator.** Durch Kommunikation erfahren wir, falls eine Person von einer Exmatrikulation gefährdet ist. Die Indizien hierbei sind durchgefallene Prüfungen. Bei gesundheitlichen Gründen ist es leider nicht immer möglich, auf Indikatoren zu achten, da diese meistens spontan auftreten.

**Contingency.** Die Aufgabenverteilung der verbliebenen Mitglieder wird überarbeitet und evtl. werden Rollen neu verteilt. Je nach Zeitpunkt des Ausfalls werden bewusste Abstriche am Projekt gemacht, welche sich auf Funktionen niedriger Priorität beziehen.
