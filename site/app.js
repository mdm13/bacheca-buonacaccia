"use strict";

// Bacheca eventi: legge eventi.json (generato dallo scraper) e gestisce filtri,
// ordinamento, filtri preferiti (localStorage) e stato nella query string.

const BRANCHE = [
  { id: "Formazione Capi", label: "Formazione Capi", pin: "var(--pin-fc)" },
  { id: "L/C", label: "L/C", pin: "var(--pin-lc)" },
  { id: "E/G", label: "E/G", pin: "var(--pin-eg)" },
  { id: "R/S", label: "R/S", pin: "var(--pin-rs)" },
  { id: "Speciale", label: "Speciale", pin: "var(--pin-aa)" },
];
const PIN = Object.fromEntries(BRANCHE.map((b) => [b.id, b.pin]));
const TILTS = ["-2deg", "1.5deg", "-1deg", "2deg", "-1.5deg"];
// Frase mostrata sotto il conteggio, per dire in che ordine si sta leggendo
const SPIEGA_ORDINE = {
  apertura: "In ordine di data di apertura delle iscrizioni, dalla più vecchia.",
  inizio: "In ordine di data di inizio dell'evento.",
};
// Le 20 regioni con i nomi usati da BuonaCaccia (e da italia-regioni.svg)
const REGIONI = [
  "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia Romagna", "Friuli Venezia Giulia", "Lazio",
  "Liguria", "Lombardia", "Marche", "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
  "Trentino Alto Adige", "Umbria", "Valle d'Aosta", "Veneto",
];
const NAZIONALE = "Nazionale";
const KEY_VISTA = "bacheca:vista-regioni";
const KEY_PREFERITI = "bacheca:preferiti";
const KEY_ULTIMO = "bacheca:ultimo";
const TUTTE_REGIONI = [NAZIONALE, ...REGIONI];
const TUTTE_BRANCHE = BRANCHE.map((b) => b.id);
// Selezione esplicita: si vede solo ciò che è selezionato. All'avvio è selezionato tutto.
// v: 2 distingue questo formato dal precedente, dove un elenco vuoto voleva dire "tutte".
const DEFAULT = {
  v: 2, r: [...TUTTE_REGIONI], c: [...TUTTE_BRANCHE], t: "", q: "", o: "apertura", pieni: false, daAprire: false,
};
const tutte = (lista, universo) => universo.every((x) => lista.includes(x));

const $ = (id) => document.getElementById(id);
const el = {
  aggiornato: $("aggiornato"), preferitiBox: $("preferiti-box"), preferiti: $("preferiti"),
  formAppunta: $("form-appunta"), nomePreferito: $("nome-preferito"), annulla: $("annulla-appunta"),
  q: $("q"), ordine: $("ordine"), branche: $("branche"), chipRegione: $("chip-regione"), chipTipo: $("chip-tipo"),
  pannello: $("pannello"), regioni: $("regioni"), tipo: $("tipo"), pieni: $("pieni"), daAprire: $("da-aprire"),
  regioniScelte: $("regioni-scelte"), scegliRegioni: $("scegli-regioni"), dialogo: $("dialogo-regioni"),
  chkNazionale: $("chk-nazionale"), nNazionale: $("n-nazionale"), mappa: $("mappa"), mappaTip: $("mappa-tip"),
  vistaMappa: $("vista-mappa"), btnMappa: $("vista-mappa-btn"), btnElenco: $("vista-elenco-btn"),
  dlgNessuna: $("dlg-nessuna"), dlgTutte: $("dlg-tutte"), dlgOk: $("dlg-ok"),
  appunta: $("appunta"), azzera: $("azzera"), risultati: $("risultati"), lista: $("lista"), vuoto: $("vuoto"),
  condividi: $("condividi"),
};

let eventi = [];
let filtri = { ...DEFAULT };
let preferiti = [];
let gestione = false;
let perRegione = new Map();
let mappaPronta = null;
let storageOk = true;

/* ---------- storage sicuro ---------- */
function leggi(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    storageOk = false;
    return fallback;
  }
}
function scrivi(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    storageOk = false;
  }
}

/* ---------- date ---------- */
const oggi = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
const parse = (iso) => (iso ? new Date(iso + "T00:00:00") : null);
const giorni = (a, b) => Math.round((b - a) / 86400000);
const fmtGiorno = new Intl.DateTimeFormat("it-IT", { weekday: "short", day: "numeric", month: "short" });
const fmtBreve = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short" });
const fmtAnno = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", year: "numeric" });
const fmtOra = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function traGiorni(n) {
  if (n < 0) return "in corso";
  if (n === 0) return "oggi";
  if (n === 1) return "domani";
  return `tra ${n} giorni`;
}
function intervallo(ini, fin) {
  if (!ini) return "";
  const fmt = ini.getFullYear() !== oggi.getFullYear() || (fin && fin.getFullYear() !== ini.getFullYear()) ? fmtAnno : fmtBreve;
  if (!fin || +fin === +ini) return fmt.format(ini);
  if (ini.getMonth() === fin.getMonth() && ini.getFullYear() === fin.getFullYear()) return `${ini.getDate()}–${fmt.format(fin)}`;
  return `${fmtBreve.format(ini)} – ${fmt.format(fin)}`;
}

/* ---------- arricchimento dati ---------- */
function prepara(e) {
  const apertura = parse(e.apertura_iscrizioni);
  const chiusura = parse(e.chiusura_iscrizioni);
  const inizio = parse(e.inizio);
  const fine = parse(e.fine);
  const daAprire = apertura ? apertura > oggi : false;
  const durata = inizio && fine ? giorni(inizio, fine) + 1 : null;
  return {
    ...e, categoria: PIN[e.categoria] ? e.categoria : "Speciale",
    quota: /\d/.test(e.quota || "") ? e.quota : "", apertura, chiusura, inizio, fine, daAprire, durata,
    testo: [e.descrizione, e.tipo, e.regione, e.localita, e.categoria].join(" ").toLowerCase(),
  };
}

/* ---------- filtri ---------- */
function filtra(lista, f, ignoraPieni = false) {
  const q = f.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return lista.filter((e) =>
    (f.r.includes(e.regione) || (!TUTTE_REGIONI.includes(e.regione) && tutte(f.r, TUTTE_REGIONI))) &&
    f.c.includes(e.categoria) &&
    (!f.t || e.tipo === f.t) &&
    (ignoraPieni || f.pieni || !e.pieno) &&
    (!f.daAprire || e.daAprire) &&
    q.every((w) => e.testo.includes(w))
  );
}

const MAX_DATA = 8.64e15;
function ordina(lista, o) {
  const t = (d) => (d ? +d : MAX_DATA);
  const copia = [...lista];
  if (o === "inizio") return copia.sort((a, b) => t(a.inizio) - t(b.inizio));
  return copia.sort((a, b) => t(a.apertura) - t(b.apertura) || t(a.inizio) - t(b.inizio));
}

const stessiFiltri = (a, b) => JSON.stringify(normalizza(a)) === JSON.stringify(normalizza(b));
function normalizza(f) {
  let r = [...(f.r || [])];
  let c = [...(f.c || [])];
  if (!f.v) {
    // Formato precedente (preferiti e ultimo filtro salvati prima): elenco vuoto = tutte
    if (!r.length) r = [...TUTTE_REGIONI];
    if (!c.length) c = [...TUTTE_BRANCHE];
  }
  const n = {
    ...DEFAULT, ...f, v: 2,
    r: r.filter((x) => TUTTE_REGIONI.includes(x)).sort(),
    c: c.filter((x) => TUTTE_BRANCHE.includes(x)).sort(),
    q: (f.q || "").trim(),
  };
  // Ordinamenti non più disponibili (es. "prossime" in preferiti o link vecchi) tornano al default
  if (!(n.o in SPIEGA_ORDINE)) n.o = DEFAULT.o;
  return n;
}

/* ---------- query string ---------- */
function daQuery() {
  const p = new URLSearchParams(location.search);
  if (![...p.keys()].length) return null;
  // Parametro assente = tutte; presente ma vuoto = nessuna
  const lista = (k, tutti) => (p.has(k) ? p.get(k).split(",").filter(Boolean) : [...tutti]);
  return normalizza({
    v: 2, r: lista("regione", TUTTE_REGIONI), c: lista("branca", TUTTE_BRANCHE), t: p.get("tipo") || "", q: p.get("q") || "",
    o: p.get("ordine") || DEFAULT.o, pieni: p.get("pieni") === "1", daAprire: p.get("da_aprire") === "1",
  });
}
function aQuery(f) {
  const p = new URLSearchParams();
  if (!tutte(f.r, TUTTE_REGIONI)) p.set("regione", f.r.join(","));
  if (!tutte(f.c, TUTTE_BRANCHE)) p.set("branca", f.c.join(","));
  if (f.t) p.set("tipo", f.t);
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.o !== DEFAULT.o) p.set("ordine", f.o);
  if (f.pieni) p.set("pieni", "1");
  if (f.daAprire) p.set("da_aprire", "1");
  const s = p.toString();
  history.replaceState(null, "", s ? `?${s}` : location.pathname);
}

/* ---------- render: controlli ---------- */
function costruisciControlli() {
  el.branche.replaceChildren(...BRANCHE.map((b) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.dataset.branca = b.id;
    btn.style.setProperty("--p", b.pin);
    btn.innerHTML = `<span class="dot" aria-hidden="true"></span>`;
    btn.append(b.label);
    btn.addEventListener("click", () => {
      const c = new Set(filtri.c);
      c.has(b.id) ? c.delete(b.id) : c.add(b.id);
      aggiorna({ c: [...c] });
    });
    return btn;
  }));

  const conteggio = (campo) => eventi.reduce((m, e) => m.set(e[campo], (m.get(e[campo]) || 0) + 1), new Map());
  perRegione = conteggio("regione");
  el.nNazionale.textContent = perRegione.get(NAZIONALE) || 0;
  el.regioni.replaceChildren(...REGIONI.map((r) => {
    const label = document.createElement("label");
    label.className = "check";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = r;
    input.addEventListener("change", () => scegliRegione(r, input.checked));
    const nome = document.createElement("span");
    nome.textContent = r;
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = perRegione.get(r) || 0;
    label.append(input, nome, n);
    return label;
  }));

  const tipi = [...conteggio("tipo").keys()].filter(Boolean).sort((a, b) => a.localeCompare(b, "it"));
  el.tipo.replaceChildren(new Option("Tutte le tipologie", ""), ...tipi.map((t) => new Option(t, t)));
}

function sincronizzaControlli() {
  el.q.value = filtri.q;
  el.ordine.value = filtri.o;
  el.tipo.value = eventi.some((e) => e.tipo === filtri.t) ? filtri.t : "";
  el.pieni.checked = filtri.pieni;
  el.daAprire.checked = filtri.daAprire;
  el.branche.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", filtri.c.includes(b.dataset.branca)));
  el.regioni.querySelectorAll("input").forEach((i) => { i.checked = filtri.r.includes(i.value); });
  el.chkNazionale.checked = filtri.r.includes(NAZIONALE);
  renderChipRegioni();
  sincronizzaMappa();
  const n = filtra(eventi, filtri).length;
  el.dlgOk.textContent = `Mostra ${n} ${n === 1 ? "evento" : "eventi"}`;
  el.chipRegione.lastElementChild.textContent = descriviRegioni(filtri.r);
  el.chipRegione.classList.toggle("is-set", !tutte(filtri.r, TUTTE_REGIONI));
  el.chipTipo.firstElementChild.textContent = filtri.t || "Tutte le tipologie";
  el.chipTipo.classList.toggle("is-set", !!filtri.t);
}

/* ---------- regioni: chip, finestra e mappa ---------- */
function scegliRegione(nome, attiva) {
  const r = new Set(filtri.r);
  attiva ? r.add(nome) : r.delete(nome);
  aggiorna({ r: [...r] });
}

const etichettaRegione = (r) => (r === NAZIONALE ? "Eventi nazionali" : r);
const contaEventi = (n) => `${n} ${n === 1 ? "evento" : "eventi"}`;

const ordinaRegioni = (r) => [...r].sort((a, b) =>
  a === NAZIONALE ? -1 : b === NAZIONALE ? 1 : a.localeCompare(b, "it"));

function descriviRegioni(r) {
  if (tutte(r, TUTTE_REGIONI)) return "Tutte le regioni";
  if (!r.length) return "Nessuna regione";
  if (r.length === 1) return etichettaRegione(r[0]);
  if (r.length <= 4) return `${etichettaRegione(ordinaRegioni(r)[0])} +${r.length - 1}`;
  const n = r.filter((x) => x !== NAZIONALE).length;
  return `${n} regioni${r.includes(NAZIONALE) ? " + nazionali" : ""}`;
}

function renderChipRegioni() {
  const r = filtri.r;
  if (tutte(r, TUTTE_REGIONI) || !r.length || r.length > 4) {
    // Riepilogo: tutte, nessuna o molte regioni. Il tocco apre la finestra.
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "region-none" + (r.length ? "" : " is-empty");
    btn.textContent = tutte(r, TUTTE_REGIONI) ? "Tutte le regioni e gli eventi nazionali" : descriviRegioni(r);
    btn.addEventListener("click", apriRegioni);
    el.regioniScelte.replaceChildren(btn);
    return;
  }
  el.regioniScelte.replaceChildren(...ordinaRegioni(r).map((r) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip chip-x";
    btn.setAttribute("aria-label", `Togli ${etichettaRegione(r)}`);
    btn.append(etichettaRegione(r));
    btn.insertAdjacentHTML("beforeend", `<svg class="icon" aria-hidden="true"><use href="#i-x"/></svg>`);
    btn.addEventListener("click", () => scegliRegione(r, false));
    return btn;
  }));
}

function caricaMappa() {
  mappaPronta ??= fetch("italia-regioni.svg")
    .then((resp) => {
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return resp.text();
    })
    .then((testo) => {
      const svg = document.importNode(new DOMParser().parseFromString(testo, "image/svg+xml").documentElement, true);
      svg.setAttribute("role", "group");
      svg.setAttribute("aria-label", "Mappa delle regioni");
      svg.classList.add("mappa-svg");
      const puntine = document.createElementNS(svg.namespaceURI, "g");
      puntine.setAttribute("aria-hidden", "true");
      for (const path of svg.querySelectorAll("path[data-regione]")) {
        const nome = path.dataset.regione;
        path.setAttribute("role", "checkbox");
        path.addEventListener("click", () => attivaPath(path));
        path.addEventListener("keydown", (ev) => {
          if (ev.key === " " || ev.key === "Enter") { ev.preventDefault(); attivaPath(path); }
        });
        for (const tipo of ["pointerenter", "focus"]) {
          path.addEventListener(tipo, () => {
            el.mappaTip.textContent = `${nome} · ${contaEventi(perRegione.get(nome) || 0)}`;
          });
        }
        const pin = document.createElementNS(svg.namespaceURI, "circle");
        pin.setAttribute("cx", path.dataset.cx);
        pin.setAttribute("cy", path.dataset.cy);
        pin.setAttribute("r", "5");
        pin.dataset.regione = nome;
        puntine.append(pin);
      }
      puntine.classList.add("mappa-puntine");
      svg.append(puntine);
      el.mappa.replaceChildren(svg);
      sincronizzaMappa();
    })
    .catch(() => {
      mappaPronta = null;
      el.mappa.innerHTML = `<p class="mappa-loading">La mappa non si è caricata: usa l'elenco.</p>`;
      impostaVista("elenco", false);
    });
  return mappaPronta;
}

function attivaPath(path) {
  scegliRegione(path.dataset.regione, path.getAttribute("aria-checked") !== "true");
}

function sincronizzaMappa() {
  const svg = el.mappa.querySelector("svg");
  if (!svg) return;
  for (const path of svg.querySelectorAll("path[data-regione]")) {
    const nome = path.dataset.regione;
    const n = perRegione.get(nome) || 0;
    const scelta = filtri.r.includes(nome);
    path.setAttribute("aria-checked", scelta);
    path.setAttribute("aria-label", `${nome}, ${contaEventi(n)}`);
    path.setAttribute("tabindex", "0");
    path.classList.toggle("scelta", scelta);
    path.classList.toggle("vuota", !n);
  }
  // Con tutto selezionato 20 puntine sarebbero solo rumore: compaiono quando la scelta è mirata
  const tutto = tutte(filtri.r, TUTTE_REGIONI);
  svg.querySelectorAll(".mappa-puntine circle").forEach((c) => {
    c.classList.toggle("on", !tutto && filtri.r.includes(c.dataset.regione));
  });
}

function impostaVista(vista, ricorda = true) {
  const mappa = vista === "mappa";
  el.vistaMappa.hidden = !mappa;
  el.regioni.hidden = mappa;
  el.btnMappa.setAttribute("aria-pressed", mappa);
  el.btnElenco.setAttribute("aria-pressed", !mappa);
  if (mappa) caricaMappa();
  if (ricorda) scrivi(KEY_VISTA, vista);
}

function apriRegioni() {
  const vista = leggi(KEY_VISTA, matchMedia("(min-width: 600px)").matches ? "mappa" : "elenco");
  impostaVista(vista === "elenco" ? "elenco" : "mappa", false);
  el.dialogo.showModal();
}

/* ---------- render: preferiti ---------- */
function renderPreferiti() {
  el.preferitiBox.hidden = !storageOk;
  if (!storageOk) return;
  const items = preferiti.map((p, i) => {
    const li = document.createElement("li");
    if (gestione) {
      const box = document.createElement("span");
      box.className = "note-edit";
      const input = document.createElement("input");
      input.value = p.nome;
      input.maxLength = 40;
      input.setAttribute("aria-label", `Rinomina ${p.nome}`);
      input.addEventListener("change", () => {
        const nome = input.value.trim();
        if (nome) { p.nome = nome; scrivi(KEY_PREFERITI, preferiti); } else input.value = p.nome;
      });
      const del = document.createElement("button");
      del.type = "button";
      del.className = "icon-btn";
      del.setAttribute("aria-label", `Elimina ${p.nome}`);
      del.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#i-x"/></svg>`;
      del.addEventListener("click", () => {
        preferiti.splice(i, 1);
        scrivi(KEY_PREFERITI, preferiti);
        if (!preferiti.length) gestione = false;
        renderPreferiti();
      });
      box.append(input, del);
      li.append(box);
    } else {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "note";
      btn.textContent = p.nome;
      btn.style.setProperty("--tilt", TILTS[i % TILTS.length]);
      btn.style.setProperty("--p", PIN[p.filtri.c?.[0]] || "var(--pin-rs)");
      btn.setAttribute("aria-pressed", stessiFiltri(p.filtri, filtri));
      btn.addEventListener("click", () => {
        btn.classList.remove("pushed");
        void btn.offsetWidth;
        btn.classList.add("pushed");
        aggiorna(normalizza(p.filtri), true);
      });
      li.append(btn);
    }
    return li;
  });

  const add = document.createElement("li");
  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "note note-add";
  addBtn.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#i-plus"/></svg>Appunta`;
  addBtn.title = "Appunta il filtro corrente tra i preferiti";
  addBtn.addEventListener("click", apriFormAppunta);
  add.append(addBtn);
  items.push(add);

  if (preferiti.length) {
    const li = document.createElement("li");
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "link-btn";
    edit.textContent = gestione ? "Fatto" : "Modifica";
    edit.setAttribute("aria-pressed", gestione);
    edit.addEventListener("click", () => { gestione = !gestione; renderPreferiti(); });
    li.append(edit);
    items.push(li);
  }
  el.preferiti.replaceChildren(...items);
}

function suggerisciNome() {
  const parti = [];
  if (filtri.t) parti.push(filtri.t);
  else if (!tutte(filtri.c, TUTTE_BRANCHE)) parti.push(filtri.c.join(" + "));
  if (!tutte(filtri.r, TUTTE_REGIONI)) {
    parti.push(filtri.r.length > 2 ? descriviRegioni(filtri.r) : filtri.r.map(etichettaRegione).join(" + "));
  }
  if (filtri.q.trim()) parti.push(`“${filtri.q.trim()}”`);
  return parti.join(" ") || "Tutti gli eventi";
}
function apriFormAppunta() {
  el.formAppunta.hidden = false;
  el.nomePreferito.value = suggerisciNome();
  el.nomePreferito.focus();
  el.nomePreferito.select();
}

/* ---------- condivisione ---------- */
// WhatsApp e simili mostrano per ogni link la stessa anteprima (meta og: in index.html):
// la selezione viaggia nel testo del messaggio, con i primi eventi in elenco.
const MAX_CONDIVISI = 5;

function testoCondivisione() {
  const visibili = ordina(filtra(eventi, filtri), filtri.o);
  const parti = [contaEventi(visibili.length)];
  if (filtri.t) parti.push(filtri.t);
  else if (!tutte(filtri.c, TUTTE_BRANCHE)) parti.push(filtri.c.join(", "));
  // Nel messaggio le regioni scelte si leggono per esteso, se poche
  const r = filtri.r;
  parti.push(r.length && r.length <= 4 && !tutte(r, TUTTE_REGIONI) ? ordinaRegioni(r).map(etichettaRegione).join(", ") : descriviRegioni(r));
  if (filtri.q.trim()) parti.push(`“${filtri.q.trim()}”`);
  if (filtri.daAprire) parti.push("iscrizioni da aprire");
  else if (!filtri.pieni) parti.push("con posti liberi");

  const righe = visibili.slice(0, MAX_CONDIVISI).map((e) => {
    const dove = [e.regione, e.localita].filter(Boolean).join(", ");
    let stato;
    if (e.pieno) stato = "PIENO";
    else if (e.daAprire) stato = `iscrizioni dal ${fmtBreve.format(e.apertura)}`;
    else if (e.chiusura && e.chiusura >= oggi) stato = `iscrizioni fino al ${fmtBreve.format(e.chiusura)}`;
    else stato = "iscrizioni aperte";
    return `• ${intervallo(e.inizio, e.fine) || "data da definire"} – ${e.descrizione.replace(/\s+/g, " ")} (${dove}) · ${stato}`;
  });
  if (visibili.length > MAX_CONDIVISI) righe.push(`…e altri ${visibili.length - MAX_CONDIVISI}`);
  return [`Bacheca eventi BuonaCaccia: ${parti.join(" · ")}`, ...righe].join("\n");
}

async function condividi() {
  const url = location.href;
  const text = testoCondivisione();
  if (navigator.share) {
    try {
      await navigator.share({ title: "Bacheca eventi", text, url });
    } catch (err) {
      if (err.name !== "AbortError") copia(`${text}\n\n${url}`);
    }
    return;
  }
  copia(`${text}\n\n${url}`);
}

async function copia(testo) {
  const etichetta = el.condividi.lastElementChild;
  try {
    await navigator.clipboard.writeText(testo);
    etichetta.textContent = "Copiato!";
  } catch {
    etichetta.textContent = "Copia non riuscita";
  }
  setTimeout(() => { etichetta.textContent = "Condividi"; }, 2000);
}

/* ---------- render: lista ---------- */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function locandina(e) {
  // La data grande è sempre quella su cui si sta ordinando; le altre vanno nella nota accanto al timbro
  let data, conto, nota = "";
  const chiuse = e.chiusura && e.chiusura < oggi;
  const chiude = e.chiusura ? `${chiuse ? "chiusa" : "chiude"} ${fmtBreve.format(e.chiusura)}` : "";
  if (filtri.o === "inizio" && e.inizio) {
    data = `Inizia ${fmtGiorno.format(e.inizio)}`;
    conto = traGiorni(giorni(oggi, e.inizio));
    nota = e.daAprire ? `apre ${fmtBreve.format(e.apertura)}` : chiude;
  } else if (e.daAprire) {
    data = `Apre ${fmtGiorno.format(e.apertura)}`;
    conto = traGiorni(giorni(oggi, e.apertura));
  } else if (filtri.o === "apertura" && e.apertura) {
    data = `Aperte dal ${fmtBreve.format(e.apertura)}`;
    conto = chiude;
  } else {
    data = e.chiusura ? `${chiuse ? "Chiusa" : "Chiude"} ${fmtGiorno.format(e.chiusura)}` : "Iscrizioni aperte";
    conto = e.chiusura && !chiuse ? traGiorni(giorni(oggi, e.chiusura)) : "";
    nota = e.apertura ? `dal ${fmtBreve.format(e.apertura)}` : "";
  }
  let timbro = (e.daAprire ? `<span class="stamp soon">DA APRIRE</span>` : `<span class="stamp open">APERTE</span>`) +
    (nota ? `<span class="stamp-note">${esc(nota)}</span>` : "");
  if (e.pieno) timbro = `<span class="stamp full">PIENO</span><span class="stamp-note">lista d'attesa su BuonaCaccia</span>`;

  let posti;
  if (e.posti == null) posti = `<span class="seats unknown">posti non indicati</span>`;
  else if (e.pieno) posti = `<span class="seats"><b>${e.iscritti}</b> iscritti su ${e.posti}</span>`;
  else posti = `<span class="seats"><b>${e.posti_liberi}</b> ${e.posti_liberi === 1 ? "posto libero" : "posti liberi"} su ${e.posti}</span>`;

  const durata = e.durata
    ? `<div class="dur"><div class="dur-bar" aria-hidden="true"><i style="--w:${Math.min(100, Math.max(8, (e.durata / 8) * 100))}%"></i></div>` +
      `<span class="dur-label">${e.durata === 1 ? "1 giorno" : e.durata > 45 ? `modulare, ${Math.round(e.durata / 30)} mesi` : `${e.durata} giorni`}</span></div>`
    : `<div class="dur"></div>`;

  // La tipologia si ripete spesso all'inizio del titolo: in quel caso non serve ripeterla
  const tipo = e.tipo && !e.descrizione.toLowerCase().startsWith(e.tipo.toLowerCase()) ? e.tipo : "";
  const dove = [esc(e.regione), e.localita && esc(e.localita), esc(intervallo(e.inizio, e.fine)),
    tipo && esc(tipo), e.quota && `<span class="nowrap">${esc(e.quota)}</span>`].filter(Boolean).join(" · ");
  return `<li><article class="flyer${e.pieno ? " is-full" : ""}" style="--p:${PIN[e.categoria] || "var(--pin-aa)"}">
    <div class="when"><p class="when-date">${esc(data)}</p><span class="when-count">${esc(conto)}</span></div>
    ${timbro}
    <h3><a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.descrizione)}<svg class="icon out" aria-hidden="true"><use href="#i-out"/></svg><span class="visually-hidden"> (su BuonaCaccia, nuova scheda)</span></a></h3>
    <p class="where">${dove}</p>
    <div class="facts">${durata}${posti}</div>
  </article></li>`;
}

function renderLista() {
  const visibili = ordina(filtra(eventi, filtri), filtri.o);
  const pieniNascosti = filtri.pieni ? 0 : filtra(eventi, filtri, true).length - visibili.length;

  el.lista.setAttribute("aria-busy", "false");
  el.lista.innerHTML = visibili.map(locandina).join("");

  const nome = visibili.length === 1 ? "evento" : "eventi";
  el.risultati.innerHTML = `<span><b>${visibili.length}</b> ${nome}${filtri.pieni ? "" : " con posti liberi o non indicati"}</span>` +
    (pieniNascosti ? `<span>· ${pieniNascosti} pieni nascosti</span><button type="button" data-azione="pieni">Mostrali</button>` : "") +
    `<span class="ordine">${SPIEGA_ORDINE[filtri.o] || ""}</span>`;

  el.vuoto.hidden = visibili.length > 0;
  if (!visibili.length && (!filtri.r.length || !filtri.c.length)) {
    const cosa = !filtri.r.length ? "nessuna regione" : "nessuna categoria";
    el.vuoto.innerHTML = `<h3>Non hai selezionato ${cosa}</h3>
      <p>La bacheca mostra solo gli eventi delle regioni e delle categorie selezionate.</p>
      <div class="actions"><button type="button" class="btn btn-ink" data-azione="${!filtri.r.length ? "tutte-r" : "tutte-c"}">
      Seleziona ${!filtri.r.length ? "tutte le regioni" : "tutte le categorie"}</button>
      <button type="button" class="btn btn-ghost" data-azione="azzera">Mostra tutto</button></div>`;
  } else if (!visibili.length) {
    el.vuoto.innerHTML = `<h3>Nessuna locandina con questi filtri</h3>
      <p>${pieniNascosti ? `Ci sono ${pieniNascosti} eventi pieni che corrispondono: puoi mostrarli, o allargare i filtri.` : "Prova ad aggiungere regioni o categorie, a togliere la tipologia, oppure mostra tutto."}</p>
      <div class="actions">${pieniNascosti ? `<button type="button" class="btn btn-ink" data-azione="pieni">Mostra gli eventi pieni</button>` : ""}
      <button type="button" class="btn btn-ghost" data-azione="azzera">Mostra tutto</button></div>`;
  }
}

function render() {
  sincronizzaControlli();
  renderPreferiti();
  renderLista();
}

function aggiorna(parziale, animato = false) {
  filtri = normalizza({ ...filtri, ...parziale });
  aQuery(filtri);
  scrivi(KEY_ULTIMO, filtri);
  if (animato && document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.startViewTransition(render);
  } else {
    render();
  }
}

/* ---------- eventi UI ---------- */
function collega() {
  let timer;
  el.q.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => aggiorna({ q: el.q.value }), 120);
  });
  el.ordine.addEventListener("change", () => aggiorna({ o: el.ordine.value }));
  el.tipo.addEventListener("change", () => aggiorna({ t: el.tipo.value }));
  el.pieni.addEventListener("change", () => aggiorna({ pieni: el.pieni.checked }));
  el.daAprire.addEventListener("change", () => aggiorna({ daAprire: el.daAprire.checked }));
  el.azzera.addEventListener("click", () => aggiorna({ ...DEFAULT }));
  el.appunta.addEventListener("click", apriFormAppunta);
  el.condividi.addEventListener("click", condividi);
  el.annulla.addEventListener("click", () => { el.formAppunta.hidden = true; });
  el.chipTipo.addEventListener("click", () => {
    const open = el.chipTipo.getAttribute("aria-expanded") !== "true";
    el.pannello.classList.toggle("open", open);
    el.chipTipo.setAttribute("aria-expanded", open);
    if (open) {
      el.tipo.focus({ preventScroll: true });
      el.pannello.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
  el.chipRegione.addEventListener("click", apriRegioni);
  el.scegliRegioni.addEventListener("click", apriRegioni);
  el.chkNazionale.addEventListener("change", () => scegliRegione(NAZIONALE, el.chkNazionale.checked));
  el.btnMappa.addEventListener("click", () => impostaVista("mappa"));
  el.btnElenco.addEventListener("click", () => impostaVista("elenco"));
  el.dlgNessuna.addEventListener("click", () => aggiorna({ r: [] }));
  el.dlgTutte.addEventListener("click", () => aggiorna({ r: [...TUTTE_REGIONI] }));
  // Clic sullo sfondo fuori dalla finestra: chiude
  el.dialogo.addEventListener("click", (ev) => { if (ev.target === el.dialogo) el.dialogo.close(); });
  el.mappa.addEventListener("pointerleave", () => {
    el.mappaTip.textContent = "Tocca una regione per sceglierla, toccala di nuovo per toglierla.";
  });
  el.formAppunta.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const nome = el.nomePreferito.value.trim();
    if (!nome) return;
    preferiti.push({ nome, filtri: normalizza(filtri) });
    scrivi(KEY_PREFERITI, preferiti);
    el.formAppunta.hidden = true;
    renderPreferiti();
  });
  document.addEventListener("click", (ev) => {
    const azione = ev.target.closest("[data-azione]")?.dataset.azione;
    if (azione === "pieni") aggiorna({ pieni: true });
    if (azione === "azzera") aggiorna({ ...DEFAULT });
    if (azione === "tutte-r") aggiorna({ r: [...TUTTE_REGIONI] });
    if (azione === "tutte-c") aggiorna({ c: [...TUTTE_BRANCHE] });
    if (azione === "nessuna-c") aggiorna({ c: [] });
  });
}

/* ---------- avvio ---------- */
async function avvia() {
  preferiti = leggi(KEY_PREFERITI, []);
  if (!Array.isArray(preferiti)) preferiti = [];
  filtri = daQuery() || normalizza(leggi(KEY_ULTIMO, DEFAULT));
  collega();
  renderPreferiti();

  try {
    const resp = await fetch("eventi.json", { cache: "no-cache" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const dati = await resp.json();
    eventi = dati.eventi.map(prepara);
    const agg = new Date(dati.aggiornato);
    el.aggiornato.textContent = `Aggiornata ${fmtOra.format(agg)}`;
    el.aggiornato.title = `Dati scaricati da BuonaCaccia il ${agg.toLocaleString("it-IT")}`;
  } catch (err) {
    el.aggiornato.textContent = "Dati non disponibili";
    el.lista.setAttribute("aria-busy", "false");
    el.lista.replaceChildren();
    el.vuoto.hidden = false;
    el.vuoto.innerHTML = `<h3>Non riesco a leggere gli eventi</h3>
      <p>Il file dei dati non si è caricato (${esc(err.message)}). Ricarica la pagina tra poco, oppure consulta direttamente
      <a href="https://buonacaccia.agesci.it/Events.aspx">BuonaCaccia</a>.</p>`;
    return;
  }

  costruisciControlli();
  render();
}

avvia();
