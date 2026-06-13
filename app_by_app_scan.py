import json
import os
import re
from datetime import datetime

BASE = os.path.join(os.path.dirname(__file__), "catchpenny-colonnade.github.io")
ROOT_INDEX = os.path.join(BASE, "index.html")
SKIP_DIRS = {"common", "docs"}

# These are primarily for stack inference; they should be heuristic.
RE_STACK_RULES = [
    (re.compile(r"kaplay" , re.I), "kaplay.js"),
    (re.compile(r"gizmo-atheneum", re.I), "zero-build-react (gizmo-atheneum importnamespace)"),
    (re.compile(r"importnamespace", re.I), "zero-build-react (importnamespace + react)"),
]


def read_text(path: str) -> str:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def extract_title_from_html(html_text: str) -> str:
    m = re.search(r"<title>(.*?)</title>", html_text, flags=re.I | re.S)
    if not m:
        return ""
    return m.group(1).strip()


def root_referenced_apps(root_index_html: str) -> dict:
    hrefs = re.findall(r"href\s*=\s*\"([^\"]+)\"", root_index_html, flags=re.I)
    ref = set()
    for h in hrefs:
        seg = h.split("/")
        if seg and seg[0]:
            ref.add(seg[0])
    return {a: True for a in sorted(ref)}


def most_recent_mtime_recursive(app_path: str):
    latest = None
    for dirpath, dirnames, filenames in os.walk(app_path):
        # skip nothing; we want recursive latest modified
        for fn in filenames:
            p = os.path.join(dirpath, fn)
            try:
                st = os.stat(p)
            except FileNotFoundError:
                continue
            if latest is None or st.st_mtime > latest:
                latest = st.st_mtime
    if latest is None:
        return "N/A"
    return datetime.fromtimestamp(latest).strftime("%Y-%m-%d %H:%M:%S")


def has_any_file(app_path: str, exts, subdir_glob=None):
    # subdir_glob is not used; kept for potential extension.
    for dirpath, dirnames, filenames in os.walk(app_path):
        for fn in filenames:
            if any(fn.lower().endswith(ext.lower()) for ext in exts):
                return True
    return False


def infer_category(app_path: str, index_html_text: str, app_name: str):
    # If clojure exists, mark as kaplay.js / clojure-adjacent.
    has_clj = os.path.exists(os.path.join(app_path, "project.clj")) or has_any_file(app_path, [".clj", ".cljc", ".edn"])
    if has_clj:
        return "kaplay.js / clojure-adjacent (static-data + web)"

    # If index.html contains kaplay/react-ish markers, infer.
    for rx, label in RE_STACK_RULES:
        if rx.search(index_html_text or ""):
            return label

    # Fallback based on common directory patterns
    if re.search(r"react", index_html_text or "", flags=re.I):
        return "zero-build-react-like"

    return "plain old javascript"


def detect_cli_static_utilities(app_path: str):
    hints = []
    # Clojure CLI/data utilities heuristics
    if os.path.exists(os.path.join(app_path, "project.clj")):
        hints.append("Found project.clj (likely clojure CLI for maintaining static data)")
    if has_any_file(app_path, [".clj", ".cljc"]):
        hints.append("Found .clj/.cljc files (possible maintenance/static-data utilities)")
    # JS tooling heuristics
    if has_any_file(app_path, [".js"]):
        # Only add if we see scripts/ or node-style tooling hints.
        scripts_dir = os.path.join(app_path, "scripts")
        if os.path.isdir(scripts_dir):
            hints.append("Found scripts/ directory")
    # Data files
    data_exts = [".csv", ".json", ".tsv", ".edn"]
    if has_any_file(app_path, data_exts):
        hints.append("Found static data artifacts (.csv/.json/.edn/etc)")
    return hints


def detect_missing_docs_and_test_gaps(app_path: str):
    # This is intentionally heuristic: we only detect obvious gaps.
    missing = []
    if not os.path.exists(os.path.join(app_path, "README.md")):
        missing.append("README.md missing")

    tests_dirs = ["test", "tests"]
    has_tests_dir = any(os.path.isdir(os.path.join(app_path, t)) for t in tests_dirs)
    if not has_tests_dir:
        missing.append("No test/ or tests/ directory found")

    # Known frameworks: if package.json exists, expect at least some test command or test folder.
    if os.path.exists(os.path.join(app_path, "package.json")) and not has_tests_dir:
        missing.append("package.json present but no tests/ directory found")

    # If clojure exists and no test/ dir
    if (os.path.exists(os.path.join(app_path, "project.clj")) or has_any_file(app_path, [".clj", ".cljc"])) and not has_tests_dir:
        missing.append("Clojure present but no test/ or tests/ directory found")

    if not missing:
        return ["No obvious doc/test gaps detected by heuristics"]
    return missing


def scan():
    root_html = read_text(ROOT_INDEX) if os.path.exists(ROOT_INDEX) else ""
    ref_apps = root_referenced_apps(root_html)

    results = []
    for entry in sorted(os.listdir(BASE)):
        app_path = os.path.join(BASE, entry)
        if not os.path.isdir(app_path):
            continue
        if entry in SKIP_DIRS:
            continue
        if entry.startswith("."):
            continue

        # index.html might not exist in all folders; we try best-effort.
        index_html_path = os.path.join(app_path, "index.html")
        title = ""
        index_html_text = ""
        if os.path.exists(index_html_path):
            index_html_text = read_text(index_html_path)
            title = extract_title_from_html(index_html_text)
        else:
            # try any *.html at top-level
            for fn in sorted(os.listdir(app_path)):
                if fn.lower().endswith(".html"):
                    p = os.path.join(app_path, fn)
                    try:
                        index_html_text = read_text(p)
                    except Exception:
                        index_html_text = ""
                    title = extract_title_from_html(index_html_text)
                    break

        mtime = most_recent_mtime_recursive(app_path)
        cat = infer_category(app_path, index_html_text, entry)
        cli_hints = detect_cli_static_utilities(app_path)
        gaps = detect_missing_docs_and_test_gaps(app_path)

        results.append({
            "app": entry,
            "title": title or "N/A",
            "referenced": bool(ref_apps.get(entry)),
            "last_modified": mtime,
            "category": cat,
            "missing_docs_and_test_gaps": gaps,
            "cli_static_utilities": cli_hints,
        })

    results.sort(key=lambda r: r["app"].lower())

    # summary lists by oldest first
    referenced = [r for r in results if r["referenced"]]
    not_referenced = [r for r in results if not r["referenced"]]

    def parse_dt(s):
        if s == "N/A":
            return None
        try:
            return datetime.strptime(s, "%Y-%m-%d %H:%M:%S")
        except Exception:
            return None

    referenced_sorted = sorted(referenced, key=lambda r: parse_dt(r["last_modified"]) or datetime.min)
    not_referenced_sorted = sorted(not_referenced, key=lambda r: parse_dt(r["last_modified"]) or datetime.min)

    summary = {
        "referenced_oldest_first": [
            {"app": r["app"], "last_modified": r["last_modified"]} for r in referenced_sorted
        ],
        "not_referenced_oldest_first": [
            {"app": r["app"], "last_modified": r["last_modified"]} for r in not_referenced_sorted
        ],
    }

    return {"apps": results, "summary": summary}


if __name__ == "__main__":
    out = scan()
    out_path = os.path.join(BASE, "appByAppReview_scan_output.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
    print(f"Wrote scan output to: {out_path}")

