#!/usr/bin/env python3
"""Stiahne aktuálne benchmarky z Artificial Analysis a uloží snapshot do data/.

Bez API kľúča: číta verejné HTML stránky (Next.js RSC payload `self.__next_f.push`)
  - https://artificialanalysis.ai/models                       (LLM: Intelligence Index, rýchlosť, cena)
  - https://artificialanalysis.ai/image/leaderboard/text-to-image  (obrázky: Elo z arény)
  - https://artificialanalysis.ai/video/leaderboard/text-to-video  (video: Elo z arény)

Výstup: data/benchmarks-YYYY-MM-DD.json (+ porovnanie s posledným starším snapshotom
v poli "changes"). Nikdy nevymýšľa čísla: ak sa dáta nedajú vyparsovať, skončí s chybou
(exit 2) a nič nezapíše.

Použitie:
  python3 scripts/fetch_benchmarks.py              # dnešný dátum (Europe/Bratislava)
  python3 scripts/fetch_benchmarks.py --date 2026-10-09
  python3 scripts/fetch_benchmarks.py --from-html models.html image.html video.html  # offline
"""
import argparse
import datetime as dt
import glob
import json
import os
import re
import sys
import urllib.request

try:
    from zoneinfo import ZoneInfo
    TZ = ZoneInfo("Europe/Bratislava")
except Exception:  # pragma: no cover
    TZ = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36"
URLS = {
    "llm": "https://artificialanalysis.ai/models",
    "image": "https://artificialanalysis.ai/image/leaderboard/text-to-image",
    "video": "https://artificialanalysis.ai/video/leaderboard/text-to-video",
}
KEEP_SNAPSHOTS = 10  # 7 dní histórie + rezerva na porovnanie

EUROPE = {"fr", "de", "it", "es", "nl", "be", "at", "pl", "cz", "sk", "se", "fi", "dk", "ie",
          "pt", "gb", "uk", "ch", "no", "lu", "ee", "lt", "lv", "si", "hr", "hu", "ro", "bg", "gr"}
# Arény (obrázky/video) neposielajú krajinu tvorcu – známe európske firmy doplníme ručne.
CREATOR_COUNTRY = {
    "Mistral": "fr",
    "Aleph Alpha": "de",
    "Black Forest Labs": "de",
    "Stability AI": "gb",
}
MONTHS = ["januára", "februára", "marca", "apríla", "mája", "júna", "júla", "augusta",
          "septembra", "októbra", "novembra", "decembra"]


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", "replace")


def rsc_payload(html):
    parts = re.findall(r"self\.__next_f\.push\((\[.*?\])\)</script>", html, re.S)
    out = []
    for p in parts:
        try:
            a = json.loads(p)
        except Exception:
            continue
        if len(a) > 1 and isinstance(a[1], str):
            out.append(a[1])
    return "".join(out)


def enclosing_object(s, i, dec=json.JSONDecoder()):
    depth = 0
    j = i
    while j > 0:
        c = s[j]
        if c == "}":
            depth += 1
        elif c == "{":
            if depth == 0:
                break
            depth -= 1
        j -= 1
    return dec.raw_decode(s, j)[0]


def num(v, nd=None):
    if isinstance(v, (int, float)) and not isinstance(v, bool):
        return round(v, nd) if nd is not None else v
    return None


def parse_llm(html):
    s = rsc_payload(html)
    found = {}
    for m in re.finditer(r'"intelligenceIndex":-?\d', s):
        try:
            o = enclosing_object(s, m.start())
        except Exception:
            continue
        if "slug" in o and "name" in o:
            found[o.get("id") or o["slug"]] = o
    models = []
    for o in found.values():
        c = o.get("creator") or {}
        country = (c.get("country") or CREATOR_COUNTRY.get(c.get("name")) or "").lower() or None
        models.append({
            "slug": o["slug"],
            "name": o["name"],
            "shortName": o.get("shortName") or o["name"],
            "creator": c.get("name"),
            "country": country,
            "isEuropean": bool(country in EUROPE),
            "releaseDate": o.get("releaseDate"),
            "isOpenWeights": bool(o.get("isOpenWeights")),
            "intelligenceIndex": num(o.get("intelligenceIndex"), 1),
            "medianOutputSpeed": num((o.get("timescaleData") or {}).get("medianOutputSpeed"), 1),
            "priceBlended": num(o.get("price1mBlended0To3To1"), 3),
            "priceInput": num(o.get("price1mInputTokens"), 3),
            "priceOutput": num(o.get("price1mOutputTokens"), 3),
        })
    models = [m for m in models if m["intelligenceIndex"] is not None]
    models.sort(key=lambda m: -m["intelligenceIndex"])
    for i, m in enumerate(models, 1):
        m["rank"] = i
    if len(models) < 5:
        raise RuntimeError("LLM: našlo sa len %d modelov – štruktúra stránky sa asi zmenila" % len(models))
    return models


def parse_arena(html, kind):
    s = rsc_payload(html)
    m = re.search(r'\[\{"formatted":\{"rank":1,', s)
    if not m:
        raise RuntimeError("%s: tabuľka rebríčka sa nenašla" % kind)
    arr, _ = json.JSONDecoder().raw_decode(s, m.start())
    rows = []
    for a in arr:
        v = a.get("values") or {}
        c = v.get("creator") or {}
        if not v.get("name") or num(v.get("elo")) is None:
            continue
        country = CREATOR_COUNTRY.get(c.get("name"))
        rows.append({
            "rank": (a.get("formatted") or {}).get("rank"),
            "name": v["name"],
            "creator": c.get("name"),
            "country": country,
            "isEuropean": bool(country in EUROPE) if country else False,
            "elo": num(v.get("elo"), 1),
            "ciLower": num(v.get("ciLower"), 1),
            "ciUpper": num(v.get("ciUpper"), 1),
            "appearances": v.get("appearances"),
            "releaseDate": v.get("releaseDate"),
            "isOpenWeights": bool(v.get("openWeightsUrl")),
        })
    if len(rows) < 5:
        raise RuntimeError("%s: príliš málo riadkov (%d)" % (kind, len(rows)))
    return rows[:20]


def date_label(d, with_time=None):
    s = "%d. %s %d" % (d.day, MONTHS[d.month - 1], d.year)
    if with_time:
        s += ", %s" % with_time
    return s


def previous_snapshot(date_str):
    files = sorted(glob.glob(os.path.join(DATA, "benchmarks-????-??-??.json")))
    older = [f for f in files if os.path.basename(f)[11:21] < date_str]
    if not older:
        return None
    with open(older[-1], encoding="utf-8") as fh:
        return json.load(fh)


def base(name):
    return re.sub(r"\s*\(.*\)\s*$", "", name or "")


def diff(prev, cur, date_str):
    ch = {"comparedTo": prev["date"] if prev else None, "hasChange": False, "items": []}
    today = dt.date.fromisoformat(date_str)
    # nové modely vydané za posledných 7 dní (užitočné aj bez predchádzajúceho snapshotu)
    recent = []
    for m in cur["llm"]["models"]:
        try:
            rd = dt.date.fromisoformat(m.get("releaseDate") or "")
        except ValueError:
            continue
        if 0 <= (today - rd).days <= 7:
            recent.append({"name": m["shortName"], "creator": m["creator"], "releaseDate": m["releaseDate"],
                           "rank": m["rank"], "intelligenceIndex": m["intelligenceIndex"],
                           "isEuropean": m["isEuropean"]})
    ch["recentReleases"] = recent
    if not prev:
        ch["note"] = "Prvý snapshot – nie je s čím porovnať."
        return ch

    def top(lst, key, n=5):
        return [x[key] for x in lst[:n]]

    p_llm, c_llm = prev["llm"]["models"], cur["llm"]["models"]
    new = [m for m in c_llm if m["slug"] not in {x["slug"] for x in p_llm}]
    gone = [m for m in p_llm if m["slug"] not in {x["slug"] for x in c_llm}]
    for m in new:
        ch["items"].append({"type": "llm-new", "slug": m["slug"], "text": "Nový model v rebríčku: %s (%s) – %d. miesto, index %s"
                            % (base(m["shortName"]), m["creator"], m["rank"], str(m["intelligenceIndex"]).replace(".", ","))})
    for m in gone:
        ch["items"].append({"type": "llm-gone", "text": "Z rebríčka vypadol: %s (%s)" % (base(m["shortName"]), m["creator"])})
    if top(p_llm, "slug") != top(c_llm, "slug"):
        ch["items"].append({"type": "llm-top5", "text": "Nové poradie top 5 jazykových modelov: "
                            + ", ".join("%d. %s" % (i + 1, base(n)) for i, n in enumerate(top(c_llm, "shortName")))
                            + " (predtým: " + ", ".join(base(n) for n in top(p_llm, "shortName")) + ").",
                            "before": top(p_llm, "shortName"), "after": top(c_llm, "shortName")})
    for kind, label in (("image", "obrázkových"), ("video", "video")):
        pp, cc = (prev.get(kind) or {}).get("models") or [], (cur.get(kind) or {}).get("models") or []
        if pp and cc and top(pp, "name") != top(cc, "name"):
            newk = [x["name"] for x in cc[:5] if x["name"] not in {y["name"] for y in pp}]
            ch["items"].append({"type": kind + "-top5",
                                "text": "Zmena v top 5 %s modelov: teraz " % label
                                + ", ".join("%d. %s" % (i + 1, n) for i, n in enumerate(top(cc, "name")))
                                + (" (nový v top 5: " + ", ".join(newk) + ")." if newk else "."),
                                "before": top(pp, "name"), "after": top(cc, "name")})
    ch["hasChange"] = bool(ch["items"])
    return ch


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", help="YYYY-MM-DD (predvolene dnes v Europe/Bratislava)")
    ap.add_argument("--from-html", nargs=3, metavar=("MODELS", "IMAGE", "VIDEO"))
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    now = dt.datetime.now(TZ) if TZ else dt.datetime.now()
    date_str = a.date or now.date().isoformat()

    try:
        if a.from_html:
            html = {k: open(p, encoding="utf-8").read() for k, p in zip(("llm", "image", "video"), a.from_html)}
        else:
            html = {k: fetch(u) for k, u in URLS.items()}
        snap = {
            "date": date_str,
            "fetchedAt": now.isoformat(timespec="minutes"),
            "fetchedAtLabel": date_label(now.date(), now.strftime("%H:%M")),
            "source": "Artificial Analysis",
            "sources": URLS,
            "llm": {"models": parse_llm(html["llm"])},
        }
        for kind in ("image", "video"):
            try:
                snap[kind] = {"models": parse_arena(html[kind], kind)}
            except Exception as e:  # arény sú bonus – LLM je povinné
                snap[kind] = {"models": [], "error": str(e)}
                print("UPOZORNENIE:", e, file=sys.stderr)
    except Exception as e:
        print("CHYBA: benchmarky sa nepodarilo získať:", e, file=sys.stderr)
        sys.exit(2)

    snap["changes"] = diff(previous_snapshot(date_str), snap, date_str)
    out = os.path.join(DATA, "benchmarks-%s.json" % date_str)
    if a.dry_run:
        print(json.dumps(snap["changes"], ensure_ascii=False, indent=2))
        return
    os.makedirs(DATA, exist_ok=True)
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(snap, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    # upratanie starých snapshotov
    files = sorted(glob.glob(os.path.join(DATA, "benchmarks-????-??-??.json")))
    for f in files[:-KEEP_SNAPSHOTS]:
        os.remove(f)
    top3 = ", ".join("%s %s" % (m["shortName"], m["intelligenceIndex"]) for m in snap["llm"]["models"][:3])
    print("OK %s | LLM %d modelov (top: %s) | obrázky %d | video %d | zmena: %s"
          % (os.path.relpath(out, ROOT), len(snap["llm"]["models"]), top3, len(snap["image"]["models"]),
             len(snap["video"]["models"]), snap["changes"]["hasChange"]))
    for it in snap["changes"]["items"]:
        print("  -", it["text"])


if __name__ == "__main__":
    main()
