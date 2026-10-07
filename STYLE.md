# AI Digest – štýlový návod a denná rutina

Čitateľ: **Samuel**, Slovák, AI nadšenec, ale nie odborník. Číta ráno na mobile, niekedy na počítači.
Digest má znieť ako **dobré noviny**, nie ako log pre robota.

## 1. Ako písať

- **Ľudský nadpis** = celá veta, čo sa stalo: „Google dal zadarmo malý model, ktorý v telefóne pochopí fotky aj zvuk“, nie „Google EmbeddingGemma 2 — 740M Apache 2.0“.
- **Telo: 2–4 odstavce, spolu 3–6 viet** plynulej slovenčiny: *čo sa stalo → čo to robí v praxi → dôležité čísla s vysvetlením*.
- **Dátumy slovami**: „v utorok 6. októbra“, nikdy „6. 10.“ ani „6.–7. 10.“.
- **Čísla po ľudsky**: „740 miliónov parametrov (zhruba tisíckrát menej ako…)“, „1 bilión“, nie „740M“, „1T“, „49B“.
- **Žiadne** telegrafické skratky, lomky, šípky „→“, zátvorky plné žargónu, „~“, „SR do 1080p“, „IG debt“.
- **Každý odborný pojem vysvetliť** – buď priamo vo vete („…takzvané embeddingy, teda číselné odtlačky významu“), alebo cez klikateľný pojem `[[text|kľúč]]` + záznam v `terms`.
  Typické pojmy, ktoré Samuel nepozná: parametre, MoE / aktívne parametre, open weights, licencie (Apache 2.0, MIT), embedding, on-device, RAG, destilácia, difúzia, lip-sync, upscale/1080p, API, beta/preview, FT/Reuters, „X-led“, investment-grade dlh, bearish/bullish, likvidácia longov, ATH, ETF, P/E.
- **„Prečo na tom záleží“** – 1–3 vety, konkrétny dopad pre bežného človeka / trh / Európu.
- **Pôvod modelu** uvádzaj len keď je zaujímavý: štítok `{"kind":"eu","label":"Európsky model · Francúzsko"}` (Mistral, Aleph Alpha, Black Forest Labs…), prípadne zmienka „čínsky otvorený model“. Jedna veta prečo (dominujú americkí OpenAI, Anthropic, Google).
- **Žiadne vymyslené fakty.** Len to, čo je v scout/finance briefe alebo na odkazovanej oficiálnej stránke. Ak si niečo overíš cez WebFetch a čísla sa líšia, použi oficiálny zdroj.
- Zdroje s **ľudskými názvami**: „Oznámenie Mistralu“, „Blog Google“, „Reuters (cez The Star)“ – nie „Report“, „SA“.
- Finance: ľudský komentár (prečo sa cena hýbe), pojmy vysvetliť, pri geme **vždy** `"disclaimer": "Toto nie je investičná rada."`.

## 2. Súbory

```
index.html, styles.css, app.js     # šablóna – denne sa NEMENIA
data/days/index.json               # zoznam dní pre dropdown (generuje scripts/update_days.py)
data/days/YYYY-MM-DD.json          # obsah jedného vydania
data/benchmarks-YYYY-MM-DD.json    # snapshot z Artificial Analysis (scripts/fetch_benchmarks.py)
scripts/fetch_benchmarks.py        # stiahne benchmarky + porovná s predošlým dňom
scripts/update_days.py             # ponechá max 7 dní, prepíše index.json
```

Najnovší deň sa zobrazí automaticky na https://samikok19.github.io/ai-digest/ (URL sa nemení).
Staršie dni cez dropdown „Vydanie“ (`?d=YYYY-MM-DD`).

## 3. Denná rutina (cieľ ~7:00 Europe/Bratislava)

1. Vezmi scout brief od AI Scouta + finance (web/oficiálne zdroje). Zdrojové .md môžeš uložiť ako `scout-YYYY-MM-DD.md` / `finance-YYYY-MM-DD.md` (sú v .gitignore).
2. `python3 scripts/fetch_benchmarks.py` → vytvorí `data/benchmarks-<dnes>.json` a vypíše zmeny.
   - Exit 2 = dáta sa nepodarilo získať → **nevymýšľaj čísla**; v dni nechaj `"benchmarks": {"snapshot": null}` (stránka ukáže varovanie) alebo odkáž na včerajší snapshot a v `note` napíš, že ide o včerajšie dáta.
3. Skopíruj predošlý `data/days/<včera>.json` ako šablónu a prepíš obsah (schéma nižšie).
   - `benchmarks.snapshot` = `"data/benchmarks-<dnes>.json"`.
   - `benchmarks.note` = 1–3 vety po ľudsky o tom, čo je v rebríčku nové (z výstupu skriptu: `changes.items`, `changes.recentReleases`). Ak sa nič nezmenilo, `note` vynechaj – sekcia sa sama zbalí.
4. `python3 scripts/update_days.py` (zmaže dni staršie ako 7 najnovších, prepíše index.json).
5. Kontrola: `node --check app.js` + `python3 -m json.tool data/days/<dnes>.json > /dev/null`; ideálne otvoriť lokálne `python3 -m http.server`.
6. `git add -A && git commit -m "Digest YYYY-MM-DD" && git push origin master`; po ~1 min overiť, že stránka vráti 200 a v `data/days/index.json` je nový deň.
7. Samuelovi **jedna správa**: link + voliteľne 3–5 bodov (rovnaké ako `highlights`). Nič iné.

## 4. Schéma dňa (`data/days/YYYY-MM-DD.json`)

```jsonc
{
  "date": "2026-10-07",
  "label": "Streda 7. októbra 2026",       // v dropdowne a hlavičke
  "shortLabel": "St 7. 10.",
  "greeting": "Dobré ráno, Samuel.",
  "intro": "2–3 vety: čo je dnes hlavné, ľudsky.",
  "highlights": ["3–5 krátkych bodov = to isté, čo ide do rannej správy"],
  "leadId": "mistral-large-4",               // id položky, ktorá bude veľká hore
  "sections": [
    { "id": "llm", "title": "Jazykové modely", "kicker": "Chatboty a „mozgy“ AI", "icon": "brain",
      "items": [{
        "id": "unikatne-id",
        "title": "Ľudský nadpis vetou",
        "dateText": "utorok 6. októbra",
        "tags": [{"kind": "eu|open|preview|closed|device|safety|money|standard", "label": "…"}],
        "keyFact": {"value": "≈ 1 bilión", "label": "parametrov, naraz pracuje 52 miliárd"},   // voliteľné, veľké číslo na karte
        "body": ["odstavec s [[klikateľným pojmom|kluc]]", "…"],
        "whyItMatters": "1–3 vety",
        "terms": [{"key": "kluc", "term": "Názov pojmu", "explain": "Vysvetlenie pre laika, 1–3 vety."}],
        "links": [{"label": "Oznámenie Mistralu", "href": "https://…"}]
      }]
    }
    // ďalšie sekcie: media (icon film), agents (icon bot), tech (icon chip)
  ],
  "skipped": ["čo sme vedome vynechali a prečo (krátko)"],
  "finance": {
    "asOfText": "Ceny zo stredy 7. októbra o 6:14. …",
    "summary": "1–2 vety",
    "btc": {"priceUsd": 0, "priceEur": 0, "changePct": 0, "changePctEur": 0, "low24h": 0, "high24h": 0,
            "mood": "bearish|bullish|neutral", "moodLabel": "Krátkodobo skôr pokles", "comment": "…", "links": []},
    "stocks": [{"ticker": "NVDA", "name": "Nvidia", "close": 0, "changePct": 0, "comment": "1 veta"}],
    "stocksLinks": [],
    "gem": {"ticker": "AMD", "name": "…", "close": 0, "changePct": 0, "why": "…", "risks": "Riziká: …",
            "links": [], "disclaimer": "Toto nie je investičná rada."},
    "terms": [ /* bearish/bullish, ATH, … */ ]
  },
  "benchmarks": {"snapshot": "data/benchmarks-2026-10-08.json", "note": "voliteľné, ľudsky"}
}
```

Pravidlá: `[[text|kluc]]` funguje len ak `kluc` existuje v `terms` niektorej položky dňa, vo `finance.terms`
alebo v stálych benchmark pojmoch v app.js (`aa`, `aa-index`, `token`, `tps`, `price1m`, `elo`, `reasoning`).
Rovnaký pojem stačí vysvetliť raz za deň (Slovníček dňa ich zlúči). Ceny sú čísla (nie reťazce) – formátuje ich app.js.

## 5. Benchmarky – ako to funguje

- Zdroj: verejné stránky Artificial Analysis bez API kľúča (ich API `/api/v2/...` vyžaduje kľúč → 401).
  Skript číta dáta, ktoré stránka posiela v HTML (Next.js `self.__next_f.push`):
  `/models` (25 hlavných modelov: Intelligence Index, rýchlosť tokeny/s, cena $/1M tokenov, krajina tvorcu, otvorené váhy),
  `/image/leaderboard/text-to-image` a `/video/leaderboard/text-to-video` (Elo z arény).
- Grafy kreslí app.js (CSS stĺpce, žiadna knižnica): top 10 podľa indexu, ich rýchlosť a cena + top 5 obrázky/video.
  Texty pod grafmi („kto vedie, najlepší európsky/otvorený…“) sa generujú automaticky z dát.
- Detekcia zmien (`changes` v snapshote): nový/vypadnutý model v zozname `/models`, iné poradie top 5 LLM,
  iné top 5 v aréne obrázkov/videa → `hasChange: true` → žltý baner „Zmena v rebríčku“ a grafy rozbalené.
  Bez zmeny: krátky riadok + prehľadové karty, grafy zbalené.
- Ak AA zmení štruktúru stránky, skript skončí chybou (nezapíše nič). Oprava: pozri kľúče `intelligenceIndex`,
  `timescaleData.medianOutputSpeed`, `price1mBlended0To3To1` a tabuľku `[{"formatted":{"rank":1,…`.
- Uchováva sa max 10 snapshotov (7 dní + rezerva).
