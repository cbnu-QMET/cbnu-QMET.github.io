"""Generate data/media.json from data/media.csv.

Usage:
  python generate_media_json.py

Notes:
- Keep date as YYYY-MM-DD.
- type: news | youtube | video
- keywords: can be space or comma separated.
"""

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
CSV_PATH = DATA_DIR / "media.csv"
JSON_PATH = DATA_DIR / "media.json"


def yt_embed(url: str) -> str:
    if not url:
        return ""
    m = re.search(r"(?:v=|youtu\.be/)([A-Za-z0-9_-]{6,})", url)
    if m:
        return f"https://www.youtube.com/embed/{m.group(1)}"
    m = re.search(r"youtube\.com/embed/([A-Za-z0-9_-]{6,})", url)
    if m:
        return f"https://www.youtube.com/embed/{m.group(1)}"
    return ""


def main() -> None:
    if not CSV_PATH.exists():
        raise SystemExit(f"Missing: {CSV_PATH}")

    items = []
    with CSV_PATH.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            it = {
                "type": (row.get("type") or "").strip() or "news",
                "date": (row.get("date") or "").strip(),
                "title": (row.get("title") or "").strip(),
                "outlet": (row.get("outlet") or "").strip(),
                "url": (row.get("url") or "").strip(),
                "thumb": (row.get("thumb") or "").strip(),
                "desc": (row.get("desc") or "").strip(),
                "keywords": [k for k in re.split(r"[\s,]+", (row.get("keywords") or "").strip()) if k],
                "embed": "",
            }

            if it["type"] in {"youtube", "video"}:
                it["embed"] = yt_embed(it["url"])

            items.append(it)

    JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    JSON_PATH.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(items)} items -> {JSON_PATH}")


if __name__ == "__main__":
    main()
