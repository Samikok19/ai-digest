(function () {
  "use strict";

  /* ===== Days data (newest first in ORDER; max 7) ===== */
  var DEFAULT_DAY = "2026-10-07";
  var DAY_ORDER = ["2026-10-07"];
  var SELECT_KEY = "ai-digest-selected-day";

  var DAYS = {
    "2026-10-07": {
      id: "2026-10-07",
      label: "7. 10. 2026",
      title: "AI Digest · 7. 10. 2026",
      foot: "Samuelov AI Digest · 7.\u00a010.\u00a02026 · Europe/Bratislava",
      llm: [
        {
          title: "Mistral Large 4 („Le Chonk“)",
          body: "6. 10. verejný API preview natívne multimodálneho MoE (~1T parametrov, 49B aktívnych); váhy majú prísť do konca októbra. Silný signál pre open-weight / EU suverenitu — kódovanie, agentické workflow a cyber.",
          links: [
            { label: "Mistral", href: "https://mistral.ai/news/mistral-large-4/" },
            { label: "X", href: "https://x.com/MistralAI/status/2107457414387622310" }
          ]
        },
        {
          title: "Reflection Beam",
          body: "5. 10. early access 501B/23B MoE na coding/agents; Apache 2.0 váhy + tech report neskôr v októbri. US open-weight konkurencia GLM/Qwen.",
          links: [
            { label: "Reflection", href: "https://reflection.ai/blog/introducing-beam" }
          ]
        },
        {
          title: "Aleph Alpha Kolibri",
          body: "Dostupný od 3. 10., oznámenie 5. 10.: DE/EN MoE (~78B / ~3B aktívnych), open weights na HF, verejná správa + EU AI Act.",
          links: [
            { label: "Aleph Alpha", href: "https://aleph-alpha.com/en/news/kolibri-sovereign-ai-made-in-germany/" }
          ]
        },
        {
          title: "Google EmbeddingGemma 2",
          body: "6. 10.: 740M Apache 2.0 on-device multimodal embeddings (text/kód/obrázok/audio/video), silný skok v MTEB Code — upgrade pre lokálne RAG a coding-agent retrieval.",
          links: [
            { label: "Google", href: "https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2/" },
            { label: "X", href: "https://x.com/GoogleDeepMind/status/2107502286758895878" }
          ]
        },
        {
          title: "OpenAI — math dump z frontier modelu",
          body: "6. 10.: 372 skupín výsledkov (časť v Lean); model ešte nie je verejný. Signál schopností + tlak na transparentnosť/replikáciu.",
          links: [
            { label: "OpenAI", href: "https://openai.com/index/sharing-ai-progress-in-mathematics/" },
            { label: "SciAm", href: "https://www.scientificamerican.com/article/openai-unleashes-hundreds-more-math-results-upon-a-field-already-in-shock/" }
          ]
        }
      ],
      media: [
        {
          title: "Reka Rho-1",
          body: "5. 10. research preview 19B omni: text + image + video (+ robotické akcie); rýchle video (distill ~1 s / ~5 s clip). Zatiaľ bez verejných váh/API.",
          links: [
            { label: "Reka", href: "https://reka.ai/news/rho-1-collapsing-the-multimodal-stack" }
          ]
        },
        {
          title: "Kandinsky 6.0 Video (open source)",
          body: "6. 10.: Lite 3B / Pro 29B joint audio-video diffusion (5 s, 44 kHz lip-sync, SR do 1080p), MIT + Diffusers/ComfyUI.",
          links: [
            { label: "arXiv", href: "https://arxiv.org/abs/2610.05608" },
            { label: "GitHub", href: "https://github.com/kandinskylab/kandinsky-6" }
          ]
        }
      ],
      agents: [
        {
          title: "Personal Agent Protocol (Meta + Sierra)",
          body: "6. 10.: open štandard (OAuth) pre autentizáciu a viditeľnosť osobných agentov voči firmám; v0.1 spec neskôr v októbri. Partneri: Walmart, Stripe, Shopify a ďalší.",
          links: [
            { label: "Sierra", href: "https://sierra.ai/blog/introducing-personal-agent-protocol" }
          ]
        },
        {
          title: "Claude for Google Workspace (public beta)",
          body: "6. 10.: sidebar v Docs/Sheets/Slides + konektory na editáciu z Claude; skills/MCP connectors so session.",
          links: [
            { label: "Claude", href: "https://claude.com/resources/articles/claude-now-works-in-google-docs-sheets-and-slides" },
            { label: "9to5Google", href: "https://9to5google.com/2026/10/06/claude-google-docs-sheet-slides/" }
          ]
        }
      ],
      tech: [
        {
          title: "SpaceX ~$40 mld. na Nvidia čipy",
          body: "6.–7. 10. (FT/Reuters): Apollo-led ($10 mld. bankové + $30 mld. IG debt), close ~2027 — kapitálová intenzita AI infra.",
          links: [
            { label: "Report", href: "https://www.thestar.com.my/tech/tech-news/2026/10/07/spacex-seeks-40-billion-to-buy-nvidia-chips-ft-reports" }
          ]
        },
        {
          title: "NYC hearing — Google agent „escapes“",
          body: "5. 10. pod prísahou: 3× agent opustil test env a dosiahol live internet (Google: sám sa zastavil). Regulačný/safety signál pre agentické nasadenia.",
          links: [
            { label: "Tech Insider", href: "https://tech-insider.org/google-confirms-3-ai-agent-escapes-nyc-hearing-2026/" }
          ]
        }
      ],
      finance: {
        loaded: true,
        asOf: "06:14 CEST · US equity session ešte neotvorená — akcie = záver 6. 10. 2026",
        btc: {
          usd: "$84,126.67",
          eur: "€74,858.12",
          changeUsd: "−1,7 %",
          changeEur: "−1,6 %",
          dir: "down",
          trend: "Bearish (krátkodobo)",
          trendClass: "bearish",
          note: "BTC odmietol zónu ~$87k; profit-taking, ETF outflowy a likvidácie longov (~$360M).",
          links: [
            { label: "CoinGecko", href: "https://www.coingecko.com/en/coins/bitcoin" },
            { label: "Yahoo", href: "https://finance.yahoo.com/quote/BTC-USD/" }
          ]
        },
        stocks: [
          {
            ticker: "NVDA",
            close: "$239.24",
            change: "+0,14 %",
            dir: "up",
            note: "Bullish — nový intradenný ATH $243.37; overnight ~$240.58"
          },
          {
            ticker: "MSFT",
            close: "$529.30",
            change: "+0,78 %",
            dir: "up",
            note: "Bullish / sideways-nahor — Azure, Copilot, AI capex"
          },
          {
            ticker: "GOOGL",
            close: "$347.68",
            change: "+0,35 %",
            dir: "up",
            note: "Sideways–mierne bullish — AI cloud + jadrové DC"
          },
          {
            ticker: "META",
            close: "$738.88",
            change: "−0,41 %",
            dir: "down",
            note: "Sideways / mierne bearish — overnight jemne nahor"
          }
        ],
        stocksSummary: "AI megacapy držia silu (NVDA/MSFT zelené), META drobná korekcia; session 7. 10. ešte nezačala.",
        stocksLinks: [
          { label: "NVDA", href: "https://finance.yahoo.com/quote/NVDA/" },
          { label: "MSFT", href: "https://finance.yahoo.com/quote/MSFT/" },
          { label: "GOOGL", href: "https://finance.yahoo.com/quote/GOOGL/" },
          { label: "META", href: "https://finance.yahoo.com/quote/META/" }
        ],
        gem: {
          ticker: "AMD",
          name: "Advanced Micro Devices",
          close: "$649.55",
          change: "+2,82 %",
          dir: "up",
          note: "Narrative agentic AI → vyšší dopyt po server CPU; Mizuho zvýšilo target (~$580 → ~$705), Citi vidí AMD ako CPU beneficiary pri Meta/server exposure.",
          links: [
            { label: "Cena", href: "https://exa.ai/library/markets/stock/AMD" },
            { label: "Mizuho / SA", href: "https://seekingalpha.com/news/4650561-agentic-ai-drives-up-cpu-demand-mizuho-ups-targets-on-amd-intel" }
          ],
          disclaimer: "Toto nie je investičná rada."
        }
      }
    }
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderLinks(links) {
    if (!links || !links.length) return "";
    return (
      '<div class="item__links">' +
      links
        .map(function (l) {
          return (
            '<a href="' +
            esc(l.href) +
            '" target="_blank" rel="noopener noreferrer">' +
            esc(l.label) +
            "</a>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderItem(it) {
    return (
      '<article class="item">' +
      "<h3>" +
      esc(it.title) +
      "</h3>" +
      "<p>" +
      esc(it.body) +
      "</p>" +
      renderLinks(it.links) +
      "</article>"
    );
  }

  function changeClass(dir) {
    if (dir === "up") return "fin-change--up";
    if (dir === "down") return "fin-change--down";
    return "fin-change--flat";
  }

  function renderFinance(fin) {
    if (!fin || !fin.loaded) {
      return (
        '<div class="fin-block">' +
        "<h3>Bitcoin (BTC)</h3>" +
        '<p class="placeholder">načítavam…</p>' +
        "</div>" +
        '<div class="fin-block">' +
        "<h3>Akcie — tech / AI</h3>" +
        '<p class="placeholder">načítavam…</p>' +
        "</div>" +
        '<div class="fin-block">' +
        "<h3>Gem</h3>" +
        '<p class="placeholder">načítavam…</p>' +
        '<p class="disclaimer">Toto nie je investičná rada.</p>' +
        "</div>"
      );
    }

    var b = fin.btc;
    var btcHtml =
      '<div class="fin-block">' +
      "<h3>Bitcoin (BTC)</h3>" +
      '<div class="fin-row">' +
      '<span class="fin-price">' +
      esc(b.usd) +
      "</span>" +
      '<span class="fin-change ' +
      changeClass(b.dir) +
      '">' +
      esc(b.changeUsd) +
      "</span>" +
      '<span class="fin-trend fin-trend--' +
      esc(b.trendClass) +
      '">' +
      esc(b.trend) +
      "</span>" +
      "</div>" +
      '<p class="fin-meta">' +
      esc(b.eur) +
      " · " +
      esc(b.changeEur) +
      "</p>" +
      '<p class="fin-meta">' +
      esc(b.note) +
      "</p>" +
      renderLinks(b.links) +
      "</div>";

    var stocksHtml =
      '<div class="fin-block">' +
      "<h3>Akcie — tech / AI</h3>" +
      '<p class="fin-meta" style="margin-top:0;margin-bottom:0.55rem">' +
      esc(fin.asOf) +
      "</p>" +
      '<ul class="stock-list">' +
      (fin.stocks || [])
        .map(function (s) {
          return (
            "<li>" +
            '<span class="stock-ticker">' +
            esc(s.ticker) +
            "</span>" +
            '<span class="stock-price">' +
            esc(s.close) +
            "</span>" +
            '<span class="fin-change ' +
            changeClass(s.dir) +
            '">' +
            esc(s.change) +
            "</span>" +
            (s.note ? '<span class="stock-note">' + esc(s.note) + "</span>" : "") +
            "</li>"
          );
        })
        .join("") +
      "</ul>" +
      (fin.stocksSummary
        ? '<p class="fin-meta">' + esc(fin.stocksSummary) + "</p>"
        : "") +
      renderLinks(fin.stocksLinks) +
      "</div>";

    var g = fin.gem;
    var gemHtml = "";
    if (g) {
      gemHtml =
        '<div class="fin-block">' +
        "<h3>Gem — " +
        esc(g.ticker) +
        "</h3>" +
        '<div class="fin-row">' +
        '<span class="fin-price">' +
        esc(g.close) +
        "</span>" +
        '<span class="fin-change ' +
        changeClass(g.dir) +
        '">' +
        esc(g.change) +
        "</span>" +
        "</div>" +
        '<p class="fin-meta">' +
        esc(g.name) +
        "</p>" +
        '<p class="fin-meta">' +
        esc(g.note) +
        "</p>" +
        renderLinks(g.links) +
        '<p class="disclaimer">' +
        esc(g.disclaimer || "Toto nie je investičná rada.") +
        "</p>" +
        "</div>";
    }

    return btcHtml + stocksHtml + gemHtml;
  }

  function renderSection(id, mod, icon, title, itemsHtml) {
    return (
      '<section class="section section--' +
      esc(mod) +
      '" id="' +
      esc(id) +
      '">' +
      '<div class="section__head">' +
      '<span class="section__icon" aria-hidden="true">' +
      esc(icon) +
      "</span>" +
      "<h2>" +
      esc(title) +
      "</h2>" +
      "</div>" +
      itemsHtml +
      "</section>"
    );
  }

  function renderDay(day) {
    var llm = (day.llm || []).map(renderItem).join("");
    var media = (day.media || []).map(renderItem).join("");
    var agents = (day.agents || []).map(renderItem).join("");
    var tech = (day.tech || []).map(renderItem).join("");

    return (
      '<p class="day-meta">Denný brief · <strong>' +
      esc(day.label) +
      "</strong></p>" +
      renderSection("sec-llm", "llm", "L", "LLM", llm) +
      renderSection("sec-media", "media", "M", "Image / Video", media) +
      renderSection("sec-agents", "agents", "A", "Harness / Agents", agents) +
      renderSection("sec-tech", "tech", "T", "Tech", tech) +
      renderSection(
        "sec-finance",
        "finance",
        "$",
        "Finance",
        renderFinance(day.finance)
      ) +
      '<p class="foot">' +
      esc(day.foot) +
      "</p>"
    );
  }

  function getSelectedDayId() {
    try {
      var stored = localStorage.getItem(SELECT_KEY);
      if (stored && DAYS[stored]) return stored;
    } catch (e) {
      /* ignore */
    }
    return DAYS[DEFAULT_DAY] ? DEFAULT_DAY : DAY_ORDER[0];
  }

  function setSelectedDayId(id) {
    try {
      localStorage.setItem(SELECT_KEY, id);
    } catch (e) {
      /* ignore */
    }
  }

  function showDay(id) {
    if (!DAYS[id]) id = getSelectedDayId();
    setSelectedDayId(id);
    var day = DAYS[id];
    var titleEl = document.getElementById("day-title");
    if (titleEl) titleEl.textContent = day.title;
    var root = document.getElementById("app-root");
    if (root) root.innerHTML = renderDay(day);
    var sel = document.getElementById("day-select");
    if (sel && sel.value !== id) sel.value = id;
  }

  function initSelect() {
    var sel = document.getElementById("day-select");
    if (!sel) return;
    sel.innerHTML = DAY_ORDER.map(function (id) {
      var d = DAYS[id];
      return '<option value="' + esc(id) + '">' + esc(d.label) + "</option>";
    }).join("");
    sel.value = getSelectedDayId();
    sel.addEventListener("change", function () {
      showDay(sel.value);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  initSelect();
  showDay(getSelectedDayId());
})();
