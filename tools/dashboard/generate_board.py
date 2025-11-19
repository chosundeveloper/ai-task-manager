from __future__ import annotations

import argparse
import html
from pathlib import Path
from typing import Dict, Iterable, List

STATUS_COLUMNS = ["Backlog", "In Progress", "Review", "Done"]
PARTICLE_SUFFIXES = "을를이가은는"
PROJECT_ICONS = {
    "계산기": "🧮",
    "타이머": "⏱️",
    "메모": "📝",
}


def load_requirements(requirements_dir: Path) -> List[Dict[str, List[str]]]:
    """Parse requirement files; each leading sentence becomes an epic."""
    epics: List[Dict[str, List[str]]] = []
    for path in sorted(requirements_dir.glob("*.txt")):
        epics.extend(_parse_requirement_file(path))
    return epics


def _parse_requirement_file(path: Path) -> List[Dict[str, List[str]]]:
    epics: List[Dict[str, List[str]]] = []
    current_title: str | None = None
    current_tasks: List[str] = []

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line:
            continue

        if line.startswith("-"):
            if current_title:
                task_body = line.lstrip("- ") or "세부 요구사항 정리"
                current_tasks.append(task_body)
            continue

        if current_title:
            epics.append(
                {
                    "epic": current_title,
                    "tasks": current_tasks or ["세부 요구사항 정리"],
                    "project": _infer_project_name(current_title),
                    "source": path.name,
                }
            )
            current_tasks = []

        current_title = line

    if current_title:
        epics.append(
            {
                "epic": current_title,
                "tasks": current_tasks or ["세부 요구사항 정리"],
                "project": _infer_project_name(current_title),
                "source": path.name,
            }
        )

    return epics


def _infer_project_name(title: str) -> str:
    """Use the first keyword of the title as a light-weight project label."""
    if ":" in title:
        head, remainder = title.split(":", 1)
        head = head.strip().lower()
        if head in {"project", "프로젝트"} and remainder.strip():
            return remainder.strip()

    token = title.split()[0]
    token = token.rstrip(PARTICLE_SUFFIXES)
    return token or title


def build_tickets(epics: Iterable[Dict[str, List[str]]]) -> List[Dict[str, str]]:
    """Expand epics into Jira-like tickets with deterministic statuses."""
    tickets: List[Dict[str, str]] = []
    for epic_index, epic in enumerate(epics, start=1):
        epic_key = f"EPIC-{epic_index:02d}"
        project = epic.get("project", epic["epic"])
        planning_ticket = {
            "id": f"{epic_key}-PLAN",
            "title": f"{epic['epic']} 기획",
            "epic": epic_key,
            "project": project,
            "status": "Done",
            "description": "요구사항을 검토하고 일정 산정",
        }
        tickets.append(planning_ticket)

        for task_index, task in enumerate(epic["tasks"], start=1):
            if task_index == 1:
                status = "Backlog"
            elif task_index == 2:
                status = "In Progress"
            elif task_index == 3:
                status = "Review"
            else:
                status = "Done"
            tickets.append(
                {
                    "id": f"{epic_key}-{task_index:02d}",
                    "title": task,
                    "epic": epic_key,
                    "project": project,
                    "status": status,
                    "description": f"{epic['epic']} 관련 작업",
                }
            )
    return tickets


def render_board(tickets: List[Dict[str, str]], output_file: Path) -> None:
    projects: Dict[str, Dict[str, List[Dict[str, str]]]] = {}
    for ticket in tickets:
        project_columns = projects.setdefault(ticket["project"], {status: [] for status in STATUS_COLUMNS})
        project_columns[ticket["status"]].append(ticket)

    for columns in projects.values():
        for bucket in columns.values():
            bucket.sort(key=lambda item: item["id"])

    project_cards = []
    project_sections = []
    for index, project_name in enumerate(sorted(projects)):
        section_id = f"project-{index}"
        is_active = index == 0
        columns_markup = []
        project_total = sum(len(projects[project_name][status]) for status in STATUS_COLUMNS)
        for status in STATUS_COLUMNS:
            column_cards = "".join(
                f"""
                <article class='card'>
                    <header>
                        <span class='card-id'>{html.escape(card['id'])}</span>
                        <span class='card-epic'>{html.escape(card['epic'])}</span>
                    </header>
                    <h3>{html.escape(card['title'])}</h3>
                    <p>{html.escape(card['description'])}</p>
                </article>
                """
                for card in projects[project_name][status]
            )
            columns_markup.append(
                f"""
                <section class='column'>
                    <h3>{html.escape(status)}</h3>
                    {column_cards or "<p class='empty'>No tickets</p>"}
                </section>
                """
            )

        project_cards.append(
            f"""
            <button class='project-card{' active' if is_active else ''}' data-target='{section_id}' aria-controls='{section_id}'>
                <span class='project-icon'>{html.escape(PROJECT_ICONS.get(project_name, '📁'))}</span>
                <span class='project-name'>{html.escape(project_name)}</span>
                <span class='project-count'>{project_total} / {len(tickets)} tickets</span>
            </button>
            """
        )

        project_sections.append(
            f"""
            <section id='{section_id}' class='project project-board{' active' if is_active else ''}'>
                <header class='project-header'>
                    <h2>{html.escape(project_name)}</h2>
                    <p>{project_total} / {len(tickets)} tickets</p>
                </header>
                <div class='board'>
                    {''.join(columns_markup)}
                </div>
            </section>
            """
        )

    content = """<!DOCTYPE html>
<html lang=\"ko\">
<head>
    <meta charset=\"UTF-8\">
    <title>Team Board</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f4f5f7; margin:0; color:#172b4d; }}
        header.page {{ padding: 1.5rem 2rem; background:#0747a6; color:#fff; }}
        header.page h1 {{ margin:0; font-size:1.5rem; }}
        main.projects {{ display:flex; flex-direction:column; gap:1.5rem; padding:2rem; }}
        .project-grid {{ display:flex; gap:1rem; flex-wrap:wrap; }}
        .project-card {{ flex:1 1 200px; border:none; border-radius:12px; background:#0c66e4; color:#fff; padding:1rem; text-align:left; cursor:pointer; display:flex; flex-direction:column; gap:0.25rem; box-shadow:0 3px 6px rgba(9,30,66,0.25); transition:transform 0.2s, box-shadow 0.2s; }}
        .project-card:hover {{ transform:translateY(-2px); box-shadow:0 6px 12px rgba(9,30,66,0.3); }}
        .project-card.active {{ background:#0747a6; }}
        .project-icon {{ font-size:2rem; }}
        .project-name {{ font-weight:600; }}
        .project-count {{ font-size:0.85rem; color:rgba(255,255,255,0.85); }}
        .project {{ background:#ebecf0; border-radius:12px; padding:1rem 1.5rem 1.5rem; box-shadow:0 3px 6px rgba(9,30,66,0.25); }}
        .project-board {{ display:none; }}
        .project-board.active {{ display:block; }}
        .project-header {{ border-bottom:1px solid #dfe1e6; margin-bottom:1rem; padding-bottom:0.5rem; }}
        .project-header h2 {{ margin:0 0 0.25rem; }}
        .project-header p {{ margin:0; color:#5e6c84; font-size:0.85rem; }}
        .board {{ display:flex; gap:1rem; overflow-x:auto; padding-bottom:0.5rem; }}
        .column {{ background:#dfe1e6; border-radius:8px; padding:1rem; min-width:220px; flex:1; }}
        .column h3 {{ margin-top:0; font-size:0.9rem; color:#5e6c84; text-transform:uppercase; letter-spacing:0.05em; }}
        .card {{ background:#fff; border-radius:6px; padding:0.75rem; margin-bottom:0.75rem; box-shadow:0 1px 2px rgba(9,30,66,0.25); }}
        .card header {{ display:flex; justify-content:space-between; font-size:0.75rem; color:#5e6c84; margin-bottom:0.25rem; }}
        .card h3 {{ margin:0 0 0.25rem; font-size:0.95rem; }}
        .card p {{ margin:0; color:#42526e; font-size:0.85rem; }}
        .empty {{ color:#A5ADBA; font-style:italic; }}
        @media (max-width: 900px) {{ .board {{ flex-direction:column; }} }}
    </style>
</head>
<body>
    <header class='page'>
        <h1>스프린트 보드</h1>
        <p>임의 요구사항을 Jira 스타일로 정리</p>
    </header>
    <main class='projects'>
        <section class='project-grid'>
            {cards}
        </section>
        <section class='project-details'>
            {sections}
        </section>
    </main>
    <script>
        document.addEventListener('DOMContentLoaded', function () {{
            const cards = document.querySelectorAll('.project-card');
            const boards = document.querySelectorAll('.project-board');
            cards.forEach((card) => {{
                card.addEventListener('click', () => {{
                    const target = card.dataset.target;
                    cards.forEach((btn) => btn.classList.toggle('active', btn === card));
                    boards.forEach((board) => board.classList.toggle('active', board.id === target));
                }});
            }});
        }});
    </script>
</body>
</html>
""".format(sections="".join(project_sections), cards="".join(project_cards))

    output_file.write_text(content, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a Jira-like dashboard from requirements")
    parser.add_argument("--requirements", type=Path, default=Path("requirements"))
    parser.add_argument("--output", type=Path, default=Path("dashboard.html"))
    args = parser.parse_args()

    epics = load_requirements(args.requirements)
    tickets = build_tickets(epics)
    render_board(tickets, args.output)
    print(f"Generated {args.output} with {len(tickets)} tickets")


if __name__ == "__main__":
    main()
