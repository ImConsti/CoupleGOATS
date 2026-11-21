# ADR-01 SQLite-Datei statt PostgreSQL-Server

| Status   | Datum      | Autor      |
| -------- | ---------- | ---------- |
| accepted | 15.11.2026 | Constantin |

## Kontext

CoupleGOATS speichert Nutzer, Tierprofile, Interessen, Termine und Tierbilder dauerhaft, dafür braucht das Backend eine Datenbank. Wir sind vier Personen mit parallelen Vorlesungen (C-02) und haben kein Budget, also nur freie Open-Source-Bibliotheken und keine bezahlten Dienste (C-03); SQLite steht als Datenbank in den technischen Einschränkungen (C-01, [SRS 3.6](../SRS.md#36-design-constraints)). Zu entscheiden war, ob die Daten in einer Datei im Backend liegen oder in einem eigenen Datenbankserver, denn das prägt Schema, Migrationen, Deployment und Skalierung und ist später teuer zu ändern. Betroffen sind QS-01 (Suche in 95 % der Fälle unter 10 s bei bis zu 1.000 Datensätzen) und QS-02 (nach einem Neustart sind 100 % der Matches, Termine und Tierprofile vorhanden).

## Erwogene Optionen

1. **SQLite-Datei** mit libSQL-Client und Drizzle ORM, im Backend-Prozess und auf einem persistenten Volume (`/data/couplegoats.db`).
2. **PostgreSQL** als eigener Datenbankserver (zusätzlicher Pod im Cluster), den das Backend per Netzwerk anspricht, ebenfalls mit Drizzle ORM.

## Entscheidung

Wir verwenden Option 1, die SQLite-Datei, weil sie zu unserer Teamgröße und unserem Budget passt (C-02, C-03), keinen zusätzlichen Server braucht und für bis zu 1.000 Datensätze (QS-01) und den Datenerhalt über ein persistentes Volume (QS-02) ausreicht.

## Folgen

- Gut: Es gibt keinen Datenbankserver, der betrieben, abgesichert und aktualisiert werden muss (C-02); das Backend ist der einzige Prozess, der gebaut und deployt wird.
- Gut: Die Daten sind eine einzige Datei auf dem persistenten Volume. Sie übersteht den Neustart des Backend-Pods (QS-02) und lässt sich als Datei sichern. Lokal arbeiten alle mit einer eigenen Datei (`local.db`), ohne etwas zu installieren.
- Gut: Kein Netzwerkaufruf zwischen Backend und Datenbank; die Suche (QS-01) bleibt bei unserer Datenmenge schnell.
- Schlecht: Nur ein Prozess darf die Datei beschreiben. Das Backend läuft deshalb mit genau einer Replik und der Strategie `Recreate`, ist bei jedem Update kurz nicht erreichbar und lässt sich nicht horizontal skalieren.
- Schlecht: Schreibvorgänge laufen seriell, und die Bilder liegen in derselben Datei, sodass diese mit jedem Bild wächst.
- Schlecht: Ein späterer Wechsel zu PostgreSQL kostet Aufwand, weil Schema und Migrationen für den SQLite-Dialekt geschrieben sind.
- Wir würden anders entscheiden, wenn die App mit vielen Tierheimen läuft und mehrere Backend-Instanzen oder viele gleichzeitige Schreibzugriffe braucht, oder wenn die Datei durch Bilder zu groß wird. Dann würden wir einen neuen ADR schreiben und diesen auf „superseded by ADR-xx“ (ersetzt durch ADR-xx) setzen.
