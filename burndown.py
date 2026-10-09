# AI-generated code
import csv
import os
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import requests

TOKEN = os.environ["PROJECTS_TOKEN"]
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


def main():
    today = date.today()
    project_title, items = get_project()

    # Nur die Iteration berücksichtigen, die heute aktiv ist.
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

    remaining_points = 0

    for item in items:
        if not item.get("content"):
            continue

        fields = get_fields(item)
        iteration = fields["iteration"]

        if not iteration:
            continue

        # Nur Aufgaben der aktiven Iteration.
        if (
            iteration.get("title") != active_iteration.get("title")
            or iteration.get("startDate") != active_iteration.get("startDate")
        ):
            continue

        if fields["status"].strip().lower() == "done":
            continue

        remaining_points += fields["estimate"]

    print(f"Projekt: {project_title}")
    print(f"Sprint: {active_iteration['title']}")
    print(f"Verbleibende Story Points: {remaining_points}")

    # Pro Datum nur einen Messwert speichern.
    history = {}

    if DATA_FILE.exists():
        with DATA_FILE.open("r", newline="", encoding="utf-8") as file:
            for row in csv.DictReader(file):
                if row.get("sprint_start") == active_iteration["startDate"]:
                    history[row["date"]] = float(row["remaining_points"])

    history[today.isoformat()] = remaining_points

    with DATA_FILE.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=["date", "sprint", "sprint_start", "remaining_points"],
        )
        writer.writeheader()

        for recorded_date in sorted(history):
            writer.writerow({
                "date": recorded_date,
                "sprint": active_iteration["title"],
                "sprint_start": active_iteration["startDate"],
                "remaining_points": history[recorded_date],
            })

    dates = sorted(history)
    values = [history[d] for d in dates]

    sprint_start = date.fromisoformat(active_iteration["startDate"])
    sprint_end = sprint_start + timedelta(
        days=active_iteration["duration"]
    )

    plt.figure(figsize=(10, 6))
    plt.plot(dates, values, marker="o", label="Verbleibende Story Points")

    # Ideallinie: vom ersten gespeicherten Wert bis zum Sprintende.
    first_date = date.fromisoformat(dates[0])
    total_days = (sprint_end - first_date).days

    if total_days > 0:
        ideal_dates = [
            first_date + timedelta(days=i)
            for i in range(total_days + 1)
        ]
        ideal_values = [
            values[0] * (1 - i / total_days)
            for i in range(total_days + 1)
        ]
        plt.plot(
            [d.isoformat() for d in ideal_dates],
            ideal_values,
            "--",
            label="Idealer Verlauf",
        )

    plt.title(f"Burndown Chart – {project_title} – {active_iteration['title']}")
    plt.xlabel("Datum")
    plt.ylabel("Verbleibende Story Points")
    plt.xticks(rotation=45)
    plt.grid(True, alpha=0.3)
    plt.legend()
    plt.tight_layout()
    plt.savefig(CHART_FILE, dpi=150)
    plt.close()

    print(f"Chart gespeichert: {CHART_FILE}")
    print(f"Daten gespeichert: {DATA_FILE}")


if __name__ == "__main__":
    main()
