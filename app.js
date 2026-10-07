/* AI Digest – render z JSON dát (data/days/*.json + data/benchmarks-*.json). Bez buildu. */
(function () {
  "use strict";

  var DAYS_INDEX = "data/days/index.json";
  var EUROPE = ["fr", "de", "it", "es", "nl", "be", "at", "pl", "cz", "sk", "se", "fi", "dk", "ie", "pt", "gb", "uk", "ch", "no", "lu", "ee", "lt", "lv", "si", "hr", "hu", "ro", "bg", "gr"];
  var COUNTRY = { us: "USA", cn: "Čína", fr: "Francúzsko", de: "Nemecko", gb: "Veľká Británia", ae: "SAE", kr: "Kórea", jp: "Japonsko", ca: "Kanada", il: "Izrael" };

  /* Stále vysvetlivky k benchmarkom (rovnaké každý deň). */
  var BENCH_TERMS = [
    { key: "aa", term: "Artificial Analysis", explain: "Nezávislá firma, ktorá AI modely testuje rovnakou sadou skúšok a meria aj ich rýchlosť a cenu. Rebríčky zverejňuje na artificialanalysis.ai." },
    { key: "aa-index", term: "Intelligence Index", explain: "Súhrnné skóre schopností modelu z viacerých testov (programovanie, vedecké otázky, kancelárska a agentická práca…). Nie je to percento ani IQ. Slúži na porovnanie: vyššie číslo = schopnejší model v ich meraniach." },
    { key: "token", term: "Token", explain: "Kúsok textu, s ktorým AI pracuje: krátke slovo, časť dlhšieho slova alebo interpunkcia. V angličtine je 1 token približne 3/4 slova, v slovenčine býva slovo rozdelené na viac tokenov." },
    { key: "tps", term: "Tokeny za sekundu", explain: "Rýchlosť písania odpovede: koľko tokenov model vypíše za sekundu, keď už začal odpovedať. 100 tokenov/s je zhruba 75 anglických slov za sekundu, rýchlejšie, ako človek stíha čítať." },
    { key: "price1m", term: "Cena za 1 milión tokenov", explain: "Koľko dolárov zaplatí vývojár či firma za spracovanie 1 milióna tokenov cez API (približne 750 000 anglických slov). Uvádzame zmiešanú cenu: 3 tokeny vstupu na 1 token výstupu. Nižšie = lacnejšie. Mesačné predplatné typu ChatGPT Plus sa počíta inak." },
    { key: "elo", term: "Elo skóre (aréna)", explain: "Ľudia naslepo porovnávajú dva výsledky k rovnakému zadaniu a vyberú lepší. Z tisícok hlasov vznikne skóre ako v šachu. Rozdiel 100 bodov znamená, že vyššie hodnotený model vyhrá zhruba 64 % porovnaní." },
    { key: "reasoning", term: "Max / High / Xhigh pri názve modelu", explain: "Koľko „premýšľania“ dostane model pred odpoveďou. Viac premýšľania obvykle znamená lepšie výsledky, ale pomalšiu a drahšiu odpoveď." }
  ];

  var ICONS = {
    brain: '<path d="M9 4a3 3 0 0 0-3 3v.2A3 3 0 0 0 4 10a3 3 0 0 0 1 2.2A3 3 0 0 0 6 17a3 3 0 0 0 3 3V4z"/><path d="M15 4a3 3 0 0 1 3 3v.2A3 3 0 0 1 20 10a3 3 0 0 1-1 2.2A3 3 0 0 1 18 17a3 3 0 0 1-3 3V4z"/><path d="M9 4h6M9 20h6"/>',
    film: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    bot: '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9 16h6"/><circle cx="12" cy="3.5" r="1"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.5c-.4-1-1.4-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.2 0-2.2-.6-2.6-1.6M12 6.5v1.5M12 16v1.5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>'
  };
  function icon(name, cls) {
    return '<svg class="ico ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || ICONS.spark) + "</svg>";
  }

  /* ---------- pomocné ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  var TERMS = {}; // key -> {term, explain}
  /* [[text|kľúč]] → klikateľný pojem, **tučné** */
  function rich(s) {
    return esc(s)
      .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, function (_, text, key) {
        if (!TERMS[key]) return text;
        return '<button type="button" class="term" data-term="' + esc(key) + '">' + text + "</button>";
      })
      .replace(/\[\[([^\]]+)\]\]/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }
  function nf(n, d) {
    if (n == null || isNaN(n)) return "–";
    return Number(n).toLocaleString("sk-SK", { minimumFractionDigits: d || 0, maximumFractionDigits: d == null ? 2 : d });
  }
  function usd(n, d) { return nf(n, d == null ? 2 : d) + " $"; }
  function pctFixed(n, d) { return (n > 0 ? "+" : n < 0 ? "−" : "") + nf(Math.abs(n), d == null ? 2 : d) + " %"; }
  function dirClass(n) { return n > 0 ? "up" : n < 0 ? "down" : "flat"; }
  function baseName(name) { return String(name || "").replace(/\s*\(.*\)\s*$/, ""); }
  function variant(name) { var m = String(name || "").match(/\(([^)]*)\)\s*$/); return m ? m[1].replace(/ with fallback/i, "") : ""; }
  function links(list, label) {
    if (!list || !list.length) return "";
    return '<p class="links"><span class="links__label">' + esc(label || "Zdroje") + ":</span> " +
      list.map(function (l) { return '<a href="' + esc(l.href) + '" target="_blank" rel="noopener noreferrer">' + esc(l.label) + "</a>"; }).join('<span class="dot">·</span>') + "</p>";
  }
  function getJSON(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(url + " → HTTP " + r.status);
      return r.json();
    });
  }

  var TAG_LABEL = { eu: "eu", open: "open", preview: "preview", closed: "closed", device: "device", safety: "safety", money: "money", standard: "standard", cn: "cn" };
  function tags(list) {
    if (!list || !list.length) return "";
    return '<div class="tags">' + list.map(function (t) {
      return '<span class="tag tag--' + esc(TAG_LABEL[t.kind] || "plain") + '">' + (t.kind === "eu" ? '<span class="eu-stars" aria-hidden="true">★</span>' : "") + esc(t.label) + "</span>";
    }).join("") + "</div>";
  }

  /* ---------- správy ---------- */
  function termsBox(list) {
    if (!list || !list.length) return "";
    return '<details class="explain"><summary>Čo to znamená? <span class="explain__count">' + list.length + (list.length === 1 ? " pojem" : list.length < 5 ? " pojmy" : " pojmov") + "</span></summary><dl>" +
      list.map(function (t) { return "<dt>" + esc(t.term) + "</dt><dd>" + esc(t.explain) + "</dd>"; }).join("") + "</dl></details>";
  }
  function story(it, sec, isLead) {
    var kf = it.keyFact ? '<div class="keyfact"><span class="keyfact__value">' + esc(it.keyFact.value) + '</span><span class="keyfact__label">' + esc(it.keyFact.label) + "</span></div>" : "";
    return '<article class="story story--' + esc(sec.id) + (isLead ? " story--lead" : "") + '" id="' + esc(it.id) + '">' +
      (isLead ? '<div class="story__kicker">' + icon("star") + " Hlavná správa dňa · " + esc(sec.title) + "</div>" : "") +
      '<div class="story__meta"><span class="story__date">' + esc(it.dateText) + "</span></div>" +
      "<h3 class=\"story__title\">" + esc(it.title) + "</h3>" +
      tags(it.tags) +
      (isLead ? '<div class="story__cols"><div class="story__text">' : "") +
      (!isLead ? kf : "") +
      (it.body || []).map(function (p) { return "<p>" + rich(p) + "</p>"; }).join("") +
      (it.whyItMatters ? '<div class="why"><div class="why__label">' + icon("spark") + "Prečo na tom záleží</div><p>" + rich(it.whyItMatters) + "</p></div>" : "") +
      termsBox(it.terms) +
      links(it.links) +
      (isLead ? '</div><div class="story__aside">' + kf + "</div></div>" : "") +
      "</article>";
  }
  function section(sec, leadId) {
    var items = (sec.items || []).filter(function (it) { return it.id !== leadId; });
    if (!items.length) return "";
    return '<section class="sec sec--' + esc(sec.id) + '" id="sec-' + esc(sec.id) + '">' +
      '<header class="sec__head"><span class="sec__icon">' + icon(sec.icon) + "</span><div><h2>" + esc(sec.title) + "</h2>" +
      (sec.kicker ? '<p class="sec__kicker">' + esc(sec.kicker) + "</p>" : "") + "</div></header>" +
      '<div class="stories">' + items.map(function (it) { return story(it, sec, false); }).join("") + "</div></section>";
  }

  /* ---------- financie ---------- */
  function finance(f) {
    if (!f) return '<section class="fin" id="sec-finance"><h2>Financie</h2><p class="muted">Dnes bez finančných dát.</p></section>';
    var b = f.btc, html = "";
    html += '<section class="fin" id="sec-finance"><header class="sec__head"><span class="sec__icon">' + icon("coin") + "</span><div><h2>Financie</h2><p class=\"sec__kicker\">Krypto a AI akcie</p></div></header>";
    if (f.summary) html += '<p class="fin__summary">' + rich(f.summary) + "</p>";
    if (b) {
      var pos = b.high24h > b.low24h ? Math.max(0, Math.min(100, (b.priceUsd - b.low24h) / (b.high24h - b.low24h) * 100)) : 50;
      html += '<div class="fcard fcard--btc">' +
        '<div class="fcard__top"><span class="fcard__name">Bitcoin <small>BTC</small></span><span class="chip chip--' + dirClass(b.changePct) + '">' + pctFixed(b.changePct, 1) + " za 24 h</span></div>" +
        '<div class="fcard__price">' + usd(b.priceUsd) + '</div><div class="fcard__sub">' + nf(b.priceEur, 2) + " € · " + pctFixed(b.changePctEur, 1) + "</div>" +
        (b.low24h ? '<div class="range" aria-label="Rozpätie za 24 hodín"><div class="range__bar"><span class="range__dot" style="left:' + pos.toFixed(1) + '%"></span></div><div class="range__labels"><span>min ' + usd(b.low24h, 0) + "</span><span>24 h</span><span>max " + usd(b.high24h, 0) + "</span></div></div>" : "") +
        (b.moodLabel ? '<div class="mood mood--' + esc(b.mood) + '">' + esc(b.moodLabel) + "</div>" : "") +
        '<p class="fcard__comment">' + rich(b.comment) + "</p>" + links(b.links) + "</div>";
    }
    if (f.stocks && f.stocks.length) {
      var maxAbs = Math.max.apply(null, f.stocks.map(function (s) { return Math.abs(s.changePct); }).concat([1]));
      html += '<h3 class="fin__h">AI akcie</h3><div class="stocks">' + f.stocks.map(function (s) {
        var w = Math.abs(s.changePct) / maxAbs * 50;
        return '<div class="stock"><div class="stock__top"><span class="stock__ticker">' + esc(s.ticker) + '</span><span class="stock__name">' + esc(s.name) + "</span></div>" +
          '<div class="stock__row"><span class="stock__price">' + usd(s.close) + '</span><span class="chip chip--' + dirClass(s.changePct) + '">' + pctFixed(s.changePct, 2) + "</span></div>" +
          '<div class="diverge"><span class="diverge__bar diverge__bar--' + dirClass(s.changePct) + '" style="width:' + w.toFixed(1) + "%;" + (s.changePct < 0 ? "right:50%" : "left:50%") + '"></span></div>' +
          '<p class="stock__comment">' + rich(s.comment) + "</p></div>";
      }).join("") + "</div>" + links(f.stocksLinks, "Ceny");
    }
    var g = f.gem;
    if (g) {
      html += '<div class="gem"><div class="gem__label">' + icon("star") + "Tip na sledovanie</div>" +
        '<div class="fcard__top"><span class="fcard__name">' + esc(g.ticker) + " <small>" + esc(g.name) + '</small></span><span class="chip chip--' + dirClass(g.changePct) + '">' + pctFixed(g.changePct, 2) + "</span></div>" +
        '<div class="fcard__price">' + usd(g.close) + "</div>" +
        "<p>" + rich(g.why) + "</p>" + (g.risks ? '<p class="muted">' + rich(g.risks) + "</p>" : "") +
        '<p class="disclaimer">' + esc(g.disclaimer || "Toto nie je investičná rada.") + "</p>" + links(g.links) + "</div>";
    }
    if (f.asOfText) html += '<p class="fin__asof">' + esc(f.asOfText) + "</p>";
    html += termsBox(f.terms) + "</section>";
    return html;
  }

  /* ---------- benchmarky ---------- */
  function originBadges(m) {
    var out = "";
    if (m.isEuropean) out += '<span class="mini mini--eu" title="Európsky model">EÚ</span>';
    else if (m.country === "cn") out += '<span class="mini mini--cn" title="Čínsky model">CN</span>';
    if (m.isOpenWeights) out += '<span class="mini mini--open" title="Otvorené váhy">open</span>';
    return out;
  }
  function bars(rows, opts) {
    var vals = rows.map(function (r) { return r.value; }).filter(function (v) { return v != null; });
    var max = Math.max.apply(null, vals), min = opts.base != null ? opts.base : 0;
    return '<ol class="bars bars--' + (opts.tone || "a") + '">' + rows.map(function (r) {
      var w = r.value == null ? 0 : Math.max(2, (r.value - min) / (max - min || 1) * 100);
      return '<li class="bars__row' + (r.hl ? " is-hl" : "") + (r.isNew ? " is-new" : "") + '">' +
        '<span class="bars__label"><span class="bars__name">' + esc(r.label) + "</span>" + (r.sub ? '<span class="bars__sub">' + esc(r.sub) + "</span>" : "") + (r.badges || "") + (r.isNew ? '<span class="mini mini--new">nový</span>' : "") + "</span>" +
        '<span class="bars__track"><span class="bars__fill" style="width:' + w.toFixed(1) + '%"></span></span>' +
        '<span class="bars__val">' + (r.value == null ? '<span class="muted">bez merania</span>' : esc(r.display)) + "</span></li>";
    }).join("") + "</ol>";
  }
  function chartCard(id, title, what, rowsHtml, takeaway, foot) {
    return '<figure class="chart" id="' + id + '"><figcaption><h3>' + title + '</h3><p class="chart__what">' + what + "</p></figcaption>" + rowsHtml +
      (takeaway ? '<p class="chart__take">' + takeaway + "</p>" : "") + (foot ? '<p class="chart__foot">' + foot + "</p>" : "") + "</figure>";
  }
  function benchmarks(bm, snap, err) {
    var head = '<section class="bench" id="sec-bench"><header class="sec__head"><span class="sec__icon">' + icon("chart") + '</span><div><h2>Benchmarky: ktorá AI je najlepšia</h2><p class="sec__kicker">Nezávislé merania [[Artificial Analysis|aa]]: schopnosti, rýchlosť a cena</p></div></header>';
    head = head.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, function (_, t, k) { return '<button type="button" class="term" data-term="' + k + '">' + t + "</button>"; });
    if (!snap) {
      return head + '<div class="banner banner--warn">Benchmarky sa dnes nepodarilo načítať' + (err ? " (" + esc(err) + ")" : "") + ". Čísla si nevymýšľame, preto je sekcia prázdna.</div></section>";
    }
    var all = (snap.llm && snap.llm.models) || [];
    var N = all.length;
    var ch = snap.changes || {};
    var newSlugs = {};
    (ch.items || []).forEach(function (i) { if (i.type === "llm-new" && i.slug) newSlugs[i.slug] = 1; });
    var recent = {};
    (ch.recentReleases || []).forEach(function (r) { recent[r.name] = 1; });
    var top = all.slice(0, 10);
    var html = head;

    // baner zmien
    if (ch.hasChange) {
      html += '<div class="banner banner--change"><strong>' + icon("spark") + "Zmena v rebríčku</strong> oproti " + esc(fmtDate(ch.comparedTo)) + ":<ul>" +
        ch.items.map(function (i) { return "<li>" + esc(i.text) + "</li>"; }).join("") + "</ul></div>";
    } else if (!ch.comparedTo) {
      html += '<div class="banner banner--info"><strong>Prvé meranie.</strong> Od ďalšieho vydania tu uvidíš, či pribudol nový model alebo sa zmenilo poradie. Grafy sa naplno ukážu len vtedy, keď sa niečo zmení.' +
        ((ch.recentReleases || []).length ? " Nové za posledných 7 dní: " + ch.recentReleases.map(function (r) { return esc(baseName(r.name)) + " (" + esc(r.creator) + ", " + r.rank + ". miesto)"; }).join(", ") + "." : "") + "</div>";
    } else {
      html += '<div class="banner banner--calm">Oproti ' + esc(fmtDate(ch.comparedTo)) + " bez zmeny v top 5 a bez nového modelu. Grafy sú zbalené nižšie.</div>";
    }
    if (bm && bm.note) html += '<p class="bench__note">' + rich(bm.note) + "</p>";

    // rýchly prehľad
    var leader = all[0];
    var fastest = top.filter(function (m) { return m.medianOutputSpeed != null; }).sort(function (a, b) { return b.medianOutputSpeed - a.medianOutputSpeed; })[0];
    var cheapest = top.filter(function (m) { return m.priceBlended != null && m.priceBlended > 0; }).sort(function (a, b) { return a.priceBlended - b.priceBlended; })[0];
    var eu = all.filter(function (m) { return m.isEuropean; })[0];
    var openBest = all.filter(function (m) { return m.isOpenWeights; })[0];
    html += '<div class="stats">' +
      stat("Najschopnejší", leader && baseName(leader.shortName), leader && (leader.creator + " · index " + nf(leader.intelligenceIndex, 1))) +
      stat("Najrýchlejší z top 10", fastest && baseName(fastest.shortName), fastest && (nf(fastest.medianOutputSpeed, 0) + " tokenov/s")) +
      stat("Najlacnejší z top 10", cheapest && baseName(cheapest.shortName), cheapest && (usd(cheapest.priceBlended) + " / 1 mil. tokenov")) +
      (openBest ? stat("Najlepší otvorený", baseName(openBest.shortName), openBest.creator + (COUNTRY[openBest.country] ? " (" + COUNTRY[openBest.country] + ")" : "") + " · " + openBest.rank + ". miesto") : "") +
      (eu ? stat("Najlepší európsky", baseName(eu.shortName), eu.creator + " (" + (COUNTRY[eu.country] || "Európa") + ") · " + eu.rank + ". z " + N, "eu") : "") +
      "</div>";

    // grafy
    var open = ch.hasChange || !ch.comparedTo;
    html += '<details class="charts"' + (open ? " open" : "") + '><summary>' + (open ? "Grafy" : "Zobraziť grafy") + " · 10 najschopnejších modelov z " + N + " sledovaných</summary><div class=\"charts__grid\">";

    // 1) Intelligence
    var usLead = 0; for (var i = 0; i < all.length && all[i].country === "us"; i++) usLead++;
    var ref = all[6] || all[all.length - 1];
    var rowsI = top.map(function (m) {
      return { label: baseName(m.shortName), sub: m.creator + (variant(m.shortName) ? " · " + variant(m.shortName) : ""), value: m.intelligenceIndex, display: nf(m.intelligenceIndex, 1), badges: originBadges(m), isNew: !!recent[m.shortName], hl: m.isEuropean };
    });
    var takeI = "Vedie <strong>" + esc(baseName(leader.shortName)) + "</strong> od " + esc(leader.creator) + " s indexom " + nf(leader.intelligenceIndex, 1) + ". " +
      (usLead >= 3 ? "Prvých " + usLead + " miest patrí americkým firmám. " : "") +
      (openBest ? "Najlepší model s otvorenými váhami je " + esc(baseName(openBest.shortName)) + " (" + esc(openBest.creator) + (COUNTRY[openBest.country] ? ", " + COUNTRY[openBest.country] : "") + ") na " + openBest.rank + ". mieste. " : "") +
      (eu ? "Najlepší európsky model, " + esc(baseName(eu.shortName)) + ", je na " + eu.rank + ". mieste z " + N + " s indexom " + nf(eu.intelligenceIndex, 1) + "." : "");
    html += chartCard("chart-index", "Ako schopné sú modely", "<button type=\"button\" class=\"term\" data-term=\"aa-index\">Intelligence Index</button> spája výsledky z viacerých náročných testov do jedného čísla. Vyššie = schopnejší. Pre predstavu: " +
      (ref ? esc(baseName(ref.shortName)) + " s indexom " + nf(ref.intelligenceIndex, 1) + " je dnes " + ref.rank + ". z " + N + ", čiže veľmi dobrý model, ale špička je o " + nf(leader.intelligenceIndex - ref.intelligenceIndex, 1) + " bodu vyššie." : ""),
      bars(rowsI, { tone: "a", base: 0 }), takeI);

    // 2) Speed
    var bySpeed = top.slice().sort(function (a, b) { return (b.medianOutputSpeed || -1) - (a.medianOutputSpeed || -1); });
    var fastAll = all.filter(function (m) { return m.medianOutputSpeed != null; }).sort(function (a, b) { return b.medianOutputSpeed - a.medianOutputSpeed; })[0];
    var slow = bySpeed.filter(function (m) { return m.medianOutputSpeed != null; }).slice(-1)[0];
    html += chartCard("chart-speed", "Ako rýchlo píšu odpoveď", "Koľko <button type=\"button\" class=\"term\" data-term=\"token\">tokenov</button> za sekundu model vypíše, keď už začne odpovedať (medián meraní). Vyššie = rýchlejšie. 100 tokenov/s je zhruba odsek textu za sekundu.",
      bars(bySpeed.map(function (m) { return { label: baseName(m.shortName), sub: m.creator, value: m.medianOutputSpeed, display: nf(m.medianOutputSpeed, 0) + " t/s", badges: originBadges(m), hl: m.isEuropean }; }), { tone: "b", base: 0 }),
      (fastest ? "Z desiatky najschopnejších píše najrýchlejšie <strong>" + esc(baseName(fastest.shortName)) + "</strong> (" + nf(fastest.medianOutputSpeed, 0) + " t/s)" + (slow ? ", najpomalšie " + esc(baseName(slow.shortName)) + " (" + nf(slow.medianOutputSpeed, 0) + " t/s)" : "") + ". " : "") +
      (fastAll && top.indexOf(fastAll) < 0 ? "Najrýchlejší zo všetkých sledovaných je " + esc(baseName(fastAll.shortName)) + " (" + esc(fastAll.creator) + ", " + nf(fastAll.medianOutputSpeed, 0) + " t/s), ten je však v schopnostiach až " + fastAll.rank + ". " : "") +
      "Najschopnejšie modely často najprv dlhšie „premýšľajú“, takže na celú odpoveď sa čaká dlhšie.");

    // 3) Price
    var byPrice = top.slice().filter(function (m) { return m.priceBlended != null; }).sort(function (a, b) { return a.priceBlended - b.priceBlended; });
    var exp = byPrice[byPrice.length - 1];
    html += chartCard("chart-price", "Koľko stojí používanie", "<button type=\"button\" class=\"term\" data-term=\"price1m\">Cena v dolároch za 1 milión tokenov</button> pri používaní cez API (zmes 3 : 1 vstup/výstup). Kratší pruh = lacnejšie. Milión tokenov je zhruba 750 000 anglických slov.",
      bars(byPrice.map(function (m) { return { label: baseName(m.shortName), sub: m.creator, value: m.priceBlended, display: usd(m.priceBlended), badges: originBadges(m), hl: m.isEuropean }; }), { tone: "c", base: 0 }),
      (cheapest && exp ? "Najlacnejší z top 10 je <strong>" + esc(baseName(cheapest.shortName)) + "</strong> (" + usd(cheapest.priceBlended) + "), najdrahší " + esc(baseName(exp.shortName)) + " (" + usd(exp.priceBlended) + "), teda asi " + nf(exp.priceBlended / cheapest.priceBlended, 0) + "-krát viac. Vyšší index neznamená automaticky vyššiu cenu." : ""));

    // 4) arény
    ["image", "video"].forEach(function (kind) {
      var a = snap[kind] && snap[kind].models;
      if (!a || !a.length) return;
      var t5 = a.slice(0, 5);
      var minE = Math.min.apply(null, t5.map(function (x) { return x.elo; }));
      var euA = a.filter(function (x) { return x.isEuropean; })[0];
      html += chartCard("chart-" + kind, kind === "image" ? "Najlepšie modely na obrázky" : "Najlepšie modely na video",
        "Top 5 v aréne, kde ľudia naslepo vyberajú lepší " + (kind === "image" ? "obrázok" : "videoklip") + ". Číslo je <button type=\"button\" class=\"term\" data-term=\"elo\">Elo skóre</button>: rozdiel 100 bodov ≈ 64 % výhier. Os nezačína od nuly, aby boli rozdiely viditeľné.",
        bars(t5.map(function (x) { return { label: x.name, sub: x.creator, value: x.elo, display: nf(x.elo, 0), badges: (x.isEuropean ? '<span class="mini mini--eu">EÚ</span>' : "") + (x.isOpenWeights ? '<span class="mini mini--open">open</span>' : ""), hl: x.isEuropean }; }), { tone: kind === "image" ? "d" : "e", base: minE - 40 }),
        "Vedie <strong>" + esc(t5[0].name) + "</strong> (" + esc(t5[0].creator) + "), náskok pred druhým je " + nf(t5[0].elo - t5[1].elo, 0) + " bodov." +
        (euA ? " Európsky zástupca: " + esc(euA.name) + " od " + esc(euA.creator) + " (Nemecko) na " + euA.rank + ". mieste." : ""));
    });
    html += "</div></details>";
    html += '<p class="bench__src">Zdroj: <a href="https://artificialanalysis.ai/models" target="_blank" rel="noopener noreferrer">Artificial Analysis – modely</a>, <a href="https://artificialanalysis.ai/image/leaderboard/text-to-image" target="_blank" rel="noopener noreferrer">aréna obrázkov</a>, <a href="https://artificialanalysis.ai/video/leaderboard/text-to-video" target="_blank" rel="noopener noreferrer">aréna videa</a>. Dáta načítané ' + esc(snap.fetchedAtLabel || snap.date) + '. Štítky: <span class="mini mini--eu">EÚ</span> európsky, <span class="mini mini--cn">CN</span> čínsky, <span class="mini mini--open">open</span> otvorené váhy.</p>';
    html += "</section>";
    return html;
  }
  function stat(label, value, sub, mod) {
    if (!value) return "";
    return '<div class="stat' + (mod ? " stat--" + mod : "") + '"><span class="stat__label">' + esc(label) + '</span><span class="stat__value">' + esc(value) + '</span><span class="stat__sub">' + esc(sub || "") + "</span></div>";
  }
  var MONTHS = ["januára", "februára", "marca", "apríla", "mája", "júna", "júla", "augusta", "septembra", "októbra", "novembra", "decembra"];
  function fmtDate(iso) {
    if (!iso) return "";
    var p = iso.split("-");
    return parseInt(p[2], 10) + ". " + MONTHS[parseInt(p[1], 10) - 1];
  }

  /* ---------- slovníček ---------- */
  function glossary(list) {
    var seen = {}, uniq = [];
    list.forEach(function (t) { if (!seen[t.key]) { seen[t.key] = 1; uniq.push(t); } });
    uniq.sort(function (a, b) { return a.term.localeCompare(b.term, "sk"); });
    return '<section class="gloss" id="sec-gloss"><header class="sec__head"><span class="sec__icon">' + icon("book") + '</span><div><h2>Slovníček dňa</h2><p class="sec__kicker">Všetky pojmy z dnešného vydania na jednom mieste. Podčiarknuté slová v texte sa dajú aj rozkliknúť.</p></div></header><dl class="gloss__list">' +
      uniq.map(function (t) { return '<div class="gloss__item" id="g-' + esc(t.key) + '"><dt>' + esc(t.term) + "</dt><dd>" + esc(t.explain) + "</dd></div>"; }).join("") + "</dl></section>";
  }

  /* ---------- celý deň ---------- */
  function renderDay(day, snap, snapErr) {
    TERMS = {};
    var allTerms = [];
    function addTerms(l) { (l || []).forEach(function (t) { TERMS[t.key] = t; allTerms.push(t); }); }
    (day.sections || []).forEach(function (s) { (s.items || []).forEach(function (it) { addTerms(it.terms); }); });
    if (day.finance) addTerms(day.finance.terms);
    addTerms(BENCH_TERMS);

    var lead = null, leadSec = null;
    (day.sections || []).forEach(function (s) { (s.items || []).forEach(function (it) { if (it.id === day.leadId) { lead = it; leadSec = s; } }); });

    var h = "";
    h += '<section class="intro"><div class="intro__text"><p class="intro__date">' + esc(day.label) + "</p>" +
      (day.greeting ? '<h1 class="intro__greet">' + esc(day.greeting) + "</h1>" : "") + '<p class="intro__lede">' + rich(day.intro || "") + "</p></div>" +
      (day.highlights && day.highlights.length ? '<div class="intro__box"><h2>Dnes v skratke</h2><ul>' + day.highlights.map(function (x) { return "<li>" + rich(x) + "</li>"; }).join("") + "</ul></div>" : "") + "</section>";
    if (lead) h += story(lead, leadSec, true);
    h += '<div class="layout"><div class="layout__main">' + (day.sections || []).map(function (s) { return section(s, day.leadId); }).join("") +
      benchmarks(day.benchmarks, snap, snapErr) + '</div><aside class="layout__side">' + finance(day.finance) + glossary(allTerms) + "</aside></div>";
    if (day.skipped && day.skipped.length) h += '<section class="skipped"><h2>Čo sme vedome vynechali</h2><ul>' + day.skipped.map(function (x) { return "<li>" + rich(x) + "</li>"; }).join("") + "</ul></section>";
    h += '<footer class="foot">AI Digest pre Samuela · ' + esc(day.label) + " · Fakty len z overených zdrojov uvedených pri správach.</footer>";
    return h;
  }

  function buildNav(day) {
    var nav = document.getElementById("jump-nav");
    if (!nav) return;
    var items = (day.sections || []).map(function (s) { return '<a href="#sec-' + esc(s.id) + '">' + esc(s.title) + "</a>"; });
    items.push('<a href="#sec-finance">Financie</a>', '<a href="#sec-bench">Benchmarky</a>', '<a href="#sec-gloss">Slovníček</a>');
    nav.innerHTML = '<div class="jump__inner">' + items.join("") + "</div>";
  }

  /* ---------- popover pojmov ---------- */
  var pop = document.getElementById("term-pop"), popFor = null;
  function showPop(btn) {
    var t = TERMS[btn.getAttribute("data-term")];
    if (!t || !pop) return;
    pop.innerHTML = "<strong>" + esc(t.term) + "</strong><span>" + esc(t.explain) + '</span><a href="#g-' + esc(t.key) + '">Slovníček →</a>';
    pop.hidden = false;
    var r = btn.getBoundingClientRect(), pw = Math.min(340, window.innerWidth - 24);
    pop.style.width = pw + "px";
    var left = Math.max(12, Math.min(window.innerWidth - pw - 12, r.left + window.scrollX - 20));
    pop.style.left = left + "px";
    pop.style.top = (r.bottom + window.scrollY + 8) + "px";
    popFor = btn;
  }
  function hidePop() { if (pop) pop.hidden = true; popFor = null; }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".term");
    if (btn) { e.preventDefault(); if (popFor === btn) hidePop(); else showPop(btn); return; }
    if (pop && !pop.contains(e.target)) hidePop();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hidePop(); });
  window.addEventListener("resize", hidePop);

  /* ---------- načítanie ---------- */
  var INDEX = null;
  function currentFromUrl() {
    var m = location.search.match(/[?&]d=(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : null;
  }
  function load(date, push) {
    var root = document.getElementById("app-root");
    var entry = INDEX.days.filter(function (d) { return d.date === date; })[0] || INDEX.days[0];
    date = entry.date;
    var sel = document.getElementById("day-select");
    if (sel) sel.value = date;
    var title = document.getElementById("day-title");
    if (title) title.textContent = entry.label;
    if (push) {
      var url = date === INDEX.days[0].date ? location.pathname : location.pathname + "?d=" + date;
      history.replaceState(null, "", url);
    }
    getJSON("data/days/" + date + ".json").then(function (day) {
      var snapUrl = day.benchmarks && day.benchmarks.snapshot;
      var p = snapUrl ? getJSON(snapUrl).then(function (s) { return [s, null]; }, function (e) { return [null, e.message]; }) : Promise.resolve([null, "chýba odkaz na snapshot"]);
      return p.then(function (r) {
        root.innerHTML = renderDay(day, r[0], r[1]);
        buildNav(day);
        document.title = "AI Digest · " + entry.label;
      });
    }).catch(function (e) {
      root.innerHTML = '<div class="banner banner--warn">Vydanie sa nepodarilo načítať: ' + esc(e.message) + "</div>";
    });
  }
  getJSON(DAYS_INDEX).then(function (idx) {
    INDEX = idx;
    var sel = document.getElementById("day-select");
    sel.innerHTML = idx.days.map(function (d) { return '<option value="' + esc(d.date) + '">' + esc(d.label) + "</option>"; }).join("");
    sel.addEventListener("change", function () { load(sel.value, true); window.scrollTo({ top: 0, behavior: "smooth" }); });
    load(currentFromUrl() || idx.days[0].date, false);
  }).catch(function (e) {
    document.getElementById("app-root").innerHTML = '<div class="banner banner--warn">Nepodarilo sa načítať zoznam vydaní: ' + esc(e.message) + "</div>";
  });

  // pre testy
  window.__AIDigest = { renderDay: renderDay };
})();
