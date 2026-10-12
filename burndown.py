# AI-generated code
import csv
import os
import re
import shutil
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import requests


TOKEN = os.environ.get("PROJECTS_TOKEN", "")
OWNER = os.environ["OWNER"]
PROJECT_NUMBER = int(os.environ["PROJECT_NUMBER"])

GRAPHQL_URL = "https://api.github.com/graphql"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

# Neuer Ordner für alle Iterationen
HISTORY_DIR = Path("burndown-history")

# Bisherige Dateien zur einmaligen Übernahme
LEGACY_DATA_FILE = Path("burndown-data.csv")
LEGACY_CHART_FILE = Path("burndown.png")

CSV_FIELDS = [
    "date",
    "sprint",
    "sprint_start",
    "remaining_points",
    "open_tasks",
    "completed_tasks",
]


def github_query(query, variables=None):
    response = requests.post(
        GRAPHQL_URL,
        headers=HEADERS,
        json={"query": query, "variables": variables or {}},
        timeout=30,
    )
    response.raise_for_status()
    result = response.json()

    if result.get("errors"):
        raise RuntimeError(result["errors"])

    return result["data"]


QUERY = """
query($owner: String!, $number: Int!, $cursor: String) {
  user(login: $owner) {
    projectV2(number: $number) {
      title
      items(first: 100, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          content {
            ... on Issue {
              title
            }
            ... on PullRequest {
              title
            }
          }
          fieldValues(first: 50) {
            nodes {
              ... on ProjectV2ItemFieldNumberValue {
                number
                field {
                  ... on ProjectV2FieldCommon {
                    name
                  }
                }
              }
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
                field {
                  ... on ProjectV2FieldCommon {
                    name
                  }
                }
              }
              ... on ProjectV2ItemFieldIterationValue {
                title
                startDate
                duration
                field {
                  ... on ProjectV2IterationField {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
"""


def safe_filename_part(value):
    """
    Bereitet den Iterationstitel für einen Dateinamen auf.
    Unzulässige Zeichen werden durch Bindestriche ersetzt.
    """
    value = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "-", value)
    value = value.strip(" .")

    return value or "Iteration"


def get_history_paths(iteration_title, sprint_start):
    """
    Erstellt die Dateipfade für eine Iteration.

    Normalerweise entstehen beispielsweise:
    Iteration 1 BDC.csv
    Iteration 1 BDC.png

    Falls ein Iterationstitel später erneut mit einem anderen
    Startdatum verwendet wird, wird das Startdatum ergänzt,
    damit ältere Daten nicht überschrieben werden.
    """
    title = safe_filename_part(iteration_title)

    base_name = f"{title} BDC"
    data_file = HISTORY_DIR / f"{base_name}.csv"
    chart_file = HISTORY_DIR / f"{base_name}.png"

    if data_file.exists():
        with data_file.open(
            "r", newline="", encoding="utf-8"
        ) as file:
            existing_starts = {
                row.get("sprint_start", "")
                for row in csv.DictReader(file)
                if row.get("sprint_start")
            }

        if existing_starts and existing_starts != {sprint_start}:
            base_name = f"{title} - {sprint_start} BDC"
            data_file = HISTORY_DIR / f"{base_name}.csv"
            chart_file = HISTORY_DIR / f"{base_name}.png"

    return data_file, chart_file


def migrate_legacy_files():
    """
    Übernimmt vorhandene burndown-data.csv und burndown.png
    aus dem Hauptverzeichnis in den Verlaufsordner.

    Die vorhandenen CSV-Daten werden nach Iteration und
    Startdatum archiviert. Die alte PNG-Datei wird dem
    zuletzt aufgezeichneten Sprint zugeordnet.
    """
    if not LEGACY_DATA_FILE.exists():
        return

    with LEGACY_DATA_FILE.open(
        "r", newline="", encoding="utf-8"
    ) as file:
        legacy_rows = list(csv.DictReader(file))

    grouped_rows = defaultdict(list)

    for row in legacy_rows:
        sprint_start = (row.get("sprint_start") or "").strip()

        if not sprint_start:
            continue

        sprint_title = (row.get("sprint") or "Iteration").strip()

        grouped_rows[(sprint_title, sprint_start)].append(row)

    # Ohne gültige historische Einträge nichts entfernen.
    if not grouped_rows:
        return

    HISTORY_DIR.mkdir(parents=True, exist_ok=True)

    # CSV-Daten jeder gefundenen Iteration archivieren.
    for (sprint_title, sprint_start), rows in grouped_rows.items():
        data_file, _ = get_history_paths(
            sprint_title,
            sprint_start,
        )

        # Bereits vorhandene historische Daten nicht überschreiben.
        if data_file.exists():
            continue

        with data_file.open(
            "w", newline="", encoding="utf-8"
        ) as file:
            writer = csv.DictWriter(
                file,
                fieldnames=CSV_FIELDS,
            )
            writer.writeheader()

            for row in sorted(rows, key=lambda item: item.get("date", "")):
                writer.writerow({
                    field: row.get(field, "")
                    for field in CSV_FIELDS
                })

    # Die bisherige PNG-Datei gehört zum zuletzt
    # aufgezeichneten Sprint der alten CSV-Datei.
    newest_key = max(
        grouped_rows.keys(),
        key=lambda item: item[1],
    )

    _, legacy_chart_target = get_history_paths(
        newest_key[0],
        newest_key[1],
    )

    if LEGACY_CHART_FILE.exists() and not legacy_chart_target.exists():
        shutil.copy2(
            LEGACY_CHART_FILE,
            legacy_chart_target,
        )

    # Die bisherigen Dateien wurden archiviert.
    # Ihre Entfernung wird von git add -A erfasst.
    LEGACY_DATA_FILE.unlink(missing_ok=True)
    LEGACY_CHART_FILE.unlink(missing_ok=True)

    print("Bisherige Burndown-Dateien wurden archiviert.")


def get_project():
    items = []
    cursor = None
    project_title = None

    while True:
        data = github_query(
            QUERY,
            {
                "owner": OWNER,
                "number": PROJECT_NUMBER,
                "cursor": cursor,
            },
        )

        user = data.get("user")

        if user is None:
            raise RuntimeError(
                "GitHub-Benutzer nicht gefunden. OWNER prüfen."
            )

        project = user.get("projectV2")

        if project is None:
            raise RuntimeError(
                "Project nicht gefunden. OWNER und PROJECT_NUMBER prüfen."
            )

        project_title = project["title"]
        page = project["items"]
        items.extend(page["nodes"])

        if not page["pageInfo"]["hasNextPage"]:
            break

        cursor = page["pageInfo"]["endCursor"]

    return project_title, items


def get_fields(item):
    result = {
        "estimate": 0,
        "status": "",
        "iteration": None,
    }

    for value in item["fieldValues"]["nodes"]:
        if not value:
            continue

        field = value.get("field") or {}
        name = field.get("name", "").lower()

        if name == "estimate":
            result["estimate"] = value.get("number") or 0

        elif name == "status":
            result["status"] = value.get("name", "")

        elif name == "iteration":
            result["iteration"] = value

    return result


def same_iteration(first, second):
    return (
        first is not None
        and second is not None
        and first.get("title") == second.get("title")
        and first.get("startDate") == second.get("startDate")
    )


def main():
    today = date.today()
    project_title, items = get_project()

    # Aktuelle Iteration anhand von Startdatum und Dauer finden.
    active_iteration = None

    for item in items:
        fields = get_fields(item)
        iteration = fields["iteration"]

        if not iteration or not iteration.get("startDate"):
            continue

        start = date.fromisoformat(iteration["startDate"])
        end = start + timedelta(days=iteration["duration"])

        if start <= today < end:
            active_iteration = iteration
            break

    if active_iteration is None:
        raise RuntimeError(
            "Keine aktive Iteration gefunden. Prüfe das Iteration-Feld "
            "und das Startdatum eures Sprints."
        )

    # Verlaufsordner erstellen und alte Dateien übernehmen.
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    migrate_legacy_files()

    # Dateinamen aus dem tatsächlichen GitHub-Iterationstitel bilden.
    data_file, chart_file = get_history_paths(
        active_iteration["title"],
        active_iteration["startDate"],
    )

    # Story Points und Aufgaben der aktuellen Iteration zählen.
    remaining_points = 0
    open_tasks = 0
    completed_tasks = 0

    for item in items:
        if not item.get("content"):
            continue

        fields = get_fields(item)
        iteration = fields["iteration"]

        if not same_iteration(iteration, active_iteration):
            continue

        if fields["status"].strip().lower() == "done":
            completed_tasks += 1
        else:
            open_tasks += 1
            remaining_points += fields["estimate"]

    print(f"Projekt: {project_title}")
    print(f"Iteration: {active_iteration['title']}")
    print(f"Verbleibende Story Points: {remaining_points}")
    print(f"Offene Aufgaben: {open_tasks}")
    print(f"Erledigte Aufgaben: {completed_tasks}")
    print(f"CSV-Zieldatei: {data_file}")
    print(f"PNG-Zieldatei: {chart_file}")

    # Vorhandene Tageswerte dieser Iteration laden.
    history = {}

    if data_file.exists():
        with data_file.open(
            "r", newline="", encoding="utf-8"
        ) as file:
            for row in csv.DictReader(file):
                if row.get("sprint_start") != active_iteration["startDate"]:
                    continue

                history[row["date"]] = {
                    "remaining_points": float(
                        row.get("remaining_points") or 0
                    ),
                    "open_tasks": int(row.get("open_tasks") or 0),
                    "completed_tasks": int(
                        row.get("completed_tasks") or 0
                    ),
                }

    # Heutigen Messwert aktualisieren oder neu hinzufügen.
    # Mehrere Läufe am selben Tag erzeugen keinen zusätzlichen Tageswert.
    history[today.isoformat()] = {
        "remaining_points": remaining_points,
        "open_tasks": open_tasks,
        "completed_tasks": completed_tasks,
    }

    # CSV nur für die aktuelle Iteration schreiben.
    with data_file.open(
        "w", newline="", encoding="utf-8"
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=CSV_FIELDS,
        )
        writer.writeheader()

        for recorded_date in sorted(history):
            values = history[recorded_date]

            writer.writerow({
                "date": recorded_date,
                "sprint": active_iteration["title"],
                "sprint_start": active_iteration["startDate"],
                "remaining_points": values["remaining_points"],
                "open_tasks": values["open_tasks"],
                "completed_tasks": values["completed_tasks"],
            })

    # Daten für die Grafik vorbereiten.
    dates = sorted(history)

    chart_dates = [
        datetime.strptime(
            recorded_date, "%Y-%m-%d"
        ).date()
        for recorded_date in dates
    ]

    remaining_values = [
        history[recorded_date]["remaining_points"]
        for recorded_date in dates
    ]

    open_values = [
        history[recorded_date]["open_tasks"]
        for recorded_date in dates
    ]

    completed_values = [
        history[recorded_date]["completed_tasks"]
        for recorded_date in dates
    ]

    sprint_start = date.fromisoformat(
        active_iteration["startDate"]
    )

    sprint_end = sprint_start + timedelta(
        days=active_iteration["duration"]
    )

    # Zwei Y-Achsen:
    # links Story Points, rechts Anzahl Aufgaben.
    fig, ax1 = plt.subplots(figsize=(12, 7))
    ax2 = ax1.twinx()

    # Tatsächlich verbleibende Story Points.
    line_remaining, = ax1.plot(
        chart_dates,
        remaining_values,
        color="purple",
        marker="o",
        linewidth=2,
        label="Verbleibende Story Points",
    )

    # Idealer Verlauf bis zum Sprintende.
    first_date = chart_dates[0]
    total_days = (sprint_end - first_date).days

    if total_days > 0:
        ideal_dates = [
            first_date + timedelta(days=i)
            for i in range(total_days + 1)
        ]

        ideal_values = [
            remaining_values[0] * (1 - i / total_days)
            for i in range(total_days + 1)
        ]

        line_ideal, = ax1.plot(
            ideal_dates,
            ideal_values,
            color="red",
            linestyle="--",
            linewidth=2,
            label="Idealer Verlauf",
        )
    else:
        line_ideal, = ax1.plot(
            [],
            [],
            color="red",
            linestyle="--",
            linewidth=2,
            label="Idealer Verlauf",
        )

    # Zwei nebeneinanderstehende Balken pro Tag.
    date_numbers = mdates.date2num(chart_dates)
    bar_width = 0.35

    bars_open = ax2.bar(
        date_numbers - bar_width / 2,
        open_values,
        width=bar_width,
        color="royalblue",
        alpha=0.8,
        label="Offene Aufgaben",
    )

    bars_completed = ax2.bar(
        date_numbers + bar_width / 2,
        completed_values,
        width=bar_width,
        color="seagreen",
        alpha=0.8,
        label="Erledigte Aufgaben",
    )

    # Achsen, Datumsformat und Diagrammtitel.
    ax1.set_title(
        f"Burndown Chart – {project_title} – "
        f"{active_iteration['title']}"
    )
    ax1.set_xlabel("Datum")
    ax1.set_ylabel("Verbleibende Story Points")
    ax2.set_ylabel("Anzahl Aufgaben")

    max_tasks = max(
        (
            open_values[i] + completed_values[i]
            for i in range(len(dates))
        ),
        default=0,
    )

    ax2.set_ylim(0, max_tasks if max_tasks > 0 else 1)

    ax1.xaxis_date()
    ax1.xaxis.set_major_formatter(
        mdates.DateFormatter("%d.%m.")
    )

    ax1.set_xlim(
        mdates.date2num(first_date) - 0.5,
        mdates.date2num(sprint_end) + 0.5,
    )

    ax1.grid(True, axis="y", alpha=0.3)

    # Gemeinsame Legende.
    handles = [
        line_remaining,
        line_ideal,
        bars_open,
        bars_completed,
    ]

    labels = [
        handle.get_label()
        for handle in handles
    ]

    ax1.legend(
        handles,
        labels,
        loc="upper right",
    )

    fig.autofmt_xdate()
    fig.tight_layout()

    # PNG für die aktuelle Iteration speichern.
    # Frühere Iterationen werden nicht überschrieben.
    fig.savefig(chart_file, dpi=150)
    plt.close(fig)

    print(f"Chart gespeichert: {chart_file}")
    print(f"Daten gespeichert: {data_file}")
    print("Aktuelle Chart-Daten:")

    for recorded_date in dates:
        print(recorded_date, history[recorded_date])


if __name__ == "__main__":
    main()
