# AI Digest

Mobilný denný AI brief pre Samuela (slovenčina). Čistý HTML/CSS/JS — bez buildu.

**Live:** https://samikok19.github.io/ai-digest/

## Súbory

- `index.html` — shell + dropdown dní
- `styles.css` — mobile-first dark (indigo/blue akcent)
- `app.js` — dáta dní, render, localStorage výberu dňa

## História (max 7 dní)

| Deň | Poznámka |
|-----|----------|
| 7. 10. 2026 | predvolený (LLM, media, agenti, tech, finance) |

Dropdown hore prepína dni. URL stránky ostáva rovnaká (`index.html`).

## Lokálne

```bash
cd ai-digest
python3 -m http.server 8080
# → http://localhost:8080
```

## Deploy (GitHub Pages)

Branch `master`, folder `/ (root)` → `https://samikok19.github.io/ai-digest/`

## Poznámky

- Výber dňa: `localStorage` kľúč `ai-digest-selected-day`.
- Finance: BTC + akcie + max 1 gem s disclaimerom „Toto nie je investičná rada.“
- Žiadny service worker — funguje offline po načítaní fontov.
