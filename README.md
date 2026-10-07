# AI Digest

Samuelov denný AI prehľad v slovenčine – novinky po ľudsky, vysvetlivky pojmov, benchmarky modelov a financie.
Čistý HTML/CSS/JS, bez buildu. Mobil: jeden stĺpec. Počítač: magazínový layout s bočným panelom.

**Live:** https://samikok19.github.io/ai-digest/ (najnovšie vydanie; staršie cez dropdown, max 7 dní)

- Obsah dní: `data/days/YYYY-MM-DD.json`, zoznam `data/days/index.json`
- Benchmarky: `data/benchmarks-YYYY-MM-DD.json` ← `python3 scripts/fetch_benchmarks.py`
- Rotácia 7 dní: `python3 scripts/update_days.py`
- Ako písať a denná rutina: **[STYLE.md](STYLE.md)**

Lokálne: `python3 -m http.server 8080` → http://localhost:8080
