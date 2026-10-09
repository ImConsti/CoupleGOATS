# AI-generated code
import csv
import os
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

DATA_FILE = Path("burndown-data.csv")
CHART_FILE = Path("burndown.png")


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

        project = data["user"]["projectV2"]

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
    print(f"Sprint: {active_iteration['title']}")
    print(f"Verbleibende Story Points: {remaining_points}")
    print(f"Offene Aufgaben: {open_tasks}")
    print(f"Erledigte Aufgaben: {completed_tasks}")

    # Vorhandene Tageswerte dieses Sprints laden.
    # Pro Tag gibt es jeweils nur einen Messwert.
    history = {}

    if DATA_FILE.exists():
        with DATA_FILE.open(
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

    # Den heutigen Messwert aktualisieren oder neu hinzufügen.
    history[today.isoformat()] = {
        "remaining_points": remaining_points,
        "open_tasks": open_tasks,
        "completed_tasks": completed_tasks,
    }

    # CSV mit allen bisherigen Tageswerten des aktuellen Sprints speichern.
    with DATA_FILE.open(
        "w", newline="", encoding="utf-8"
    ) as file:
        fieldnames = [
            "date",
            "sprint",
            "sprint_start",
            "remaining_points",
            "open_tasks",
            "completed_tasks",
        ]

        writer = csv.DictWriter(file, fieldnames=fieldnames)
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
        datetime.strptime(d, "%Y-%m-%d").date()
        for d in dates
    ]

    remaining_values = [
        history[d]["remaining_points"] for d in dates
    ]
    open_values = [
        history[d]["open_tasks"] for d in dates
    ]
    completed_values = [
        history[d]["completed_tasks"] for d in dates
    ]

    sprint_start = date.fromisoformat(active_iteration["startDate"])
    sprint_end = sprint_start + timedelta(
        days=active_iteration["duration"]
    )

    # Zwei Y-Achsen: Story Points links, Aufgabenanzahl rechts.
    fig, ax1 = plt.subplots(figsize=(12, 7))
    ax2 = ax1.twinx()

    # Bestehende Linie: tatsächlich verbleibende Story Points.
    line_remaining, = ax1.plot(
        chart_dates,
        remaining_values,
        color="purple",
        marker="o",
        linewidth=2,
        label="Verbleibende Story Points",
    )

    # Bestehende Ideallinie bis zum Sprintende.
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
    (open_values[i] + completed_values[i] for i in range(len(dates))),
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

    # Eine gemeinsame Legende für Linien und Balken.
    handles = [
        line_remaining,
        line_ideal,
        bars_open,
        bars_completed,
    ]
    labels = [handle.get_label() for handle in handles]

    ax1.legend(handles, labels, loc="upper right")

    fig.autofmt_xdate()
    fig.tight_layout()

    # PNG bei jedem Lauf neu erzeugen und überschreiben.
    fig.savefig(CHART_FILE, dpi=150)
    plt.close(fig)

    print(f"Chart gespeichert: {CHART_FILE}")
    print(f"Daten gespeichert: {DATA_FILE}")
    print("Chart-Daten:")

    for recorded_date in dates:
        print(recorded_date, history[recorded_date])


if __name__ == "__main__":
    main()
