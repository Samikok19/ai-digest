#!/usr/bin/env python3
"""Udržiava zoznam dní pre dropdown: data/days/index.json.

- nájde všetky data/days/YYYY-MM-DD.json
- ponechá najnovších 7 (staršie zmaže)
- zapíše index.json (najnovší prvý)

Použitie: python3 scripts/update_days.py [--keep 7]
"""
import argparse, glob, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DAYS = os.path.join(ROOT, "data", "days")

ap = argparse.ArgumentParser()
ap.add_argument("--keep", type=int, default=7)
a = ap.parse_args()

files = sorted(f for f in glob.glob(os.path.join(DAYS, "*.json"))
               if re.match(r"\d{4}-\d{2}-\d{2}\.json$", os.path.basename(f)))
files.reverse()  # najnovší prvý
keep, drop = files[:a.keep], files[a.keep:]
for f in drop:
    os.remove(f)
    print("zmazaný starý deň:", os.path.basename(f))
entries = []
for f in keep:
    with open(f, encoding="utf-8") as fh:
        d = json.load(fh)  # zároveň validácia JSON
    entries.append({"date": d["date"], "label": d.get("label", d["date"]), "shortLabel": d.get("shortLabel", d["date"])})
with open(os.path.join(DAYS, "index.json"), "w", encoding="utf-8") as fh:
    json.dump({"days": entries}, fh, ensure_ascii=False, indent=1)
    fh.write("\n")
print("index.json:", ", ".join(e["date"] for e in entries))
