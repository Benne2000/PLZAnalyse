// ═══════════════════════════════════════════════════════════════════════════
//  SAP Custom Widget – Geo-PLZ-Analyse
//  Refactored Version
//
//  Änderungen ggü. Vorversion:
//    • Kein globaler Scope-Leak mehr (alles in IIFE, keine let außerhalb)
//    • disconnectedCallback räumt Timer, Listener & Leaflet sauber auf
//    • Ein zentraler AbortController für alle DOM-Listener
//    • Click-Handler auf GeoLayer werden genau einmal gebunden (vorher: pro
//      updateGeoLayer für jedes Polygon neu → O(n) Listener-Leaks)
//    • XSS-sicheres HTML-Templating über escapeHtml()
//    • PLZ-Namen-Labels auf der Karte ab Zoom 11 mit Collision-Detection
//    • Toter Code entfernt (prepareDropdownData, updateNeighbours,
//      restoreFilterUI, hasTriggeredClick, Debug-Utilities)
//    • Mehrfach duplizierte Helfer (_bad, buildStruktur) konsolidiert
//    • Bug gefixt: `if (isCrossErhebung || true)` → korrekte Bedingung
//    • Inline-Styles größtenteils in CSS-Klassen überführt
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── Geteilte Konstanten ───────────────────────────────────────────────
  const GEOJSON_URL      = 'https://raw.githubusercontent.com/Benne2000/PLZAnalyse/main/PLZ.geojson';
  const COMPETITORS_URL  = 'https://raw.githubusercontent.com/Benne2000/PLZAnalyse/main/competitor.json';
  const LEAFLET_JS       = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  const LEAFLET_CSS  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  const OSM_TILES    = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const NULL_TOKENS   = new Set(['', '@NullMember', '@TotalMembers']);
  const CATEGORIES    = ['stationaer', 'pluscard', 'ra', 'online'];
  const PLZ_FILTER_KEYS    = ['0POSTALCODE', 'dimension_plz_0', 'dimension_plz'];
  const ERH_FILTER_KEYS    = ['BGFBNR', 'dimension_erhebung_0', 'dimension_erhebung'];
  const JAHR_FILTER_KEYS   = ['0CALYEAR', 'dimension_jahr_0', 'dimension_jahr'];
  const NUMMER_FILTER_KEYS = ['BERHBNUM', 'dimension_erhebungsnummer_0', 'dimension_erhebungsnummer'];
  const ALL_STALE_KEYS = [...ERH_FILTER_KEYS, ...JAHR_FILTER_KEYS, ...NUMMER_FILTER_KEYS];

  const LABEL_ZOOM_MIN   = 11;   // ab diesem Zoom erscheinen PLZ-Namen
  const LABEL_ZOOM_CLEAR = 12;   // ab hier etwas größer / kräftiger
  const LABEL_MAX_COUNT  = 140;  // Hard-Cap damit die Karte nicht überflutet wird

  const isNull = v => v == null || NULL_TOKENS.has(v);

  // HTML-Escape gegen XSS bei nutzergenerierten oder BW-Dimension-Inhalten
  const escapeHtml = (s) => {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const fmtNum = (x) => Math.round(Number(x || 0)).toLocaleString('de-DE');
  const fmtDec = (x) => Number(x || 0).toFixed(2);

  /**
   * Formatiert einen 15-stelligen Erhebungsnummer-Char aus BW.
   *
   * Zwei Varianten:
   *   "000000000000000"  → "0. Laufendes Jahr"
   *   "XXXXXNNSSSSEEEE"  → "N. SS.SS–EE.EE"
   *     XXXXX = Padding (ignoriert)
   *     NN    = lfd. Nummer (2-stellig, führende 0 entfernt)
   *     SSSS  = Start: DDMM
   *     EEEE  = Ende:  DDMM
   *
   * Beispiel: "00000120040305" → Stelle 5-6="01", 7-8="20", 9-10="04", 11-12="03", 13-14="05"
   *           → "1. 20.04–03.05"
   */
  function fmtNummer(raw) {
    if (!raw) return raw;
    const s = String(raw).replace(/\s/g, '');
    if (!s || /^0+$/.test(s)) return '0. Laufendes Jahr';
    // Von hinten lesen: letzte 8 Stellen = DDMMDDMM, davor 1+ Stellen = Nummer
    const meaningful = s.replace(/^0+/, '') || '0';  // führende Nullen weg
    if (meaningful.length < 9) return meaningful;     // unbekanntes Format
    const edMon = meaningful.slice(-2);
    const edDay = meaningful.slice(-4, -2);
    const sdMon = meaningful.slice(-6, -4);
    const sdDay = meaningful.slice(-8, -6);
    const nr    = meaningful.slice(0, -8);
    return `${nr}. ${sdDay}.${sdMon}–${edDay}.${edMon}`;
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  Template (Styles + DOM)
  // ═══════════════════════════════════════════════════════════════════════
  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      /* ─── Design Tokens ─────────────────────────────────────────── */
      :host {
        --red:          #b41821;
        --red-dark:     #8e1219;
        --red-light:    #d42030;
        --red-bg:       #fdf2f2;
        --red-bg-hover: #fce8e8;
        --red-border:   rgba(180,24,33,0.2);
        --red-shadow:   rgba(180,24,33,0.15);
        --white:        #ffffff;
        --gray-50:  #f8f9fa;  --gray-100: #f1f3f5;  --gray-200: #e9ecef;
        --gray-300: #dee2e6;  --gray-400: #ced4da;  --gray-500: #adb5bd;
        --gray-600: #6c757d;  --gray-700: #495057;  --gray-800: #343a40;  --gray-900: #212529;
        --shadow-xs: 0 1px 3px rgba(0,0,0,0.06);
        --shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
        --shadow-md: 0 4px 16px rgba(0,0,0,0.10);
        --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
        --shadow-red: 0 4px 16px rgba(180,24,33,0.25);
        --radius-sm: 5px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px;
        --font: 'Segoe UI', system-ui, -apple-system, sans-serif;
        --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
        --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
        display: block; height: 100%; width: 100%; box-sizing: border-box;
        font-family: var(--font);
      }
      *, *::before, *::after { box-sizing: border-box; }

      /* ─── Layout ────────────────────────────────────────────────── */
      .layout { display: flex; height: 100%; width: 100%; background: var(--gray-50); }

      .filter-container {
        width: 30%; padding: 14px 12px;
        background: var(--white); border-right: 1px solid var(--gray-200);
        display: flex; flex-direction: column; height: 100%;
        position: relative; z-index: 2;
        box-shadow: 2px 0 12px rgba(0,0,0,0.04);
      }
      .filter-container::before {
        content: ''; display: block; height: 3px;
        background: linear-gradient(90deg, var(--red), var(--red-light));
        margin: -14px -12px 12px;
      }
      .filter-container label {
        display: block; margin-top: 8px; font-size: 0.72rem; font-weight: 700;
        letter-spacing: 0.06em; text-transform: uppercase; color: var(--gray-500);
      }
      .filter-container select {
        width: 100%; margin-top: 4px; padding: 7px 10px; font-size: 0.85rem;
        font-family: var(--font);
        border: 1.5px solid var(--gray-200); border-radius: var(--radius-md);
        background: var(--gray-50); color: var(--gray-800);
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236c757d' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat; background-position: right 10px center;
        cursor: pointer;
        transition: border-color 0.18s var(--ease-in-out),
                    box-shadow   0.18s var(--ease-in-out),
                    background   0.18s var(--ease-in-out);
        outline: none;
      }
      .filter-container select:hover:not(:disabled) { border-color: var(--red-border); background-color: var(--white); }
      .filter-container select:focus    { border-color: var(--red); box-shadow: 0 0 0 3px var(--red-shadow); background-color: var(--white); }
      .filter-container select:disabled { opacity: 0.45; cursor: not-allowed; }

      #filter-button {
        width: 100%; margin-top: 10px; padding: 9px 16px; font-size: 0.87rem;
        font-family: var(--font); font-weight: 600; color: var(--white);
        background: var(--gray-300); border: none; border-radius: var(--radius-md);
        cursor: not-allowed; position: relative; overflow: hidden;
        transition: background 0.22s var(--ease-in-out), transform 0.12s, box-shadow 0.18s;
        opacity: 0.6;
      }
      #filter-button.ready { background: var(--red); cursor: pointer; opacity: 1; }
      #filter-button.ready::after {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%);
        pointer-events: none;
      }
      #filter-button.ready:hover  { background: var(--red-light); box-shadow: var(--shadow-red); transform: translateY(-1px); }
      #filter-button.ready:active { transform: translateY(0); box-shadow: none; }

      .info-toggle-btn {
        width: 100%; margin-top: 8px; padding: 7px 12px; font-size: 0.8rem;
        font-family: var(--font); font-weight: 600; color: var(--red);
        background: transparent; border: 1.5px solid var(--red-border);
        border-radius: var(--radius-md); cursor: pointer;
        transition: background 0.18s, border-color 0.18s;
        display: flex; align-items: center; justify-content: center; gap: 6px;
      }
      .info-toggle-btn:hover { background: var(--red-bg); border-color: var(--red); }

      /* ─── Tabelle ───────────────────────────────────────────────── */
      .table-container {
        margin-top: 10px; background: var(--white); border-radius: var(--radius-lg);
        border: 1px solid var(--gray-200); box-shadow: var(--shadow-xs);
        position: relative; overflow: hidden;
        display: flex; flex-direction: column; flex: 1; min-height: 0;
        transition: box-shadow 0.2s;
      }
      .table-container:hover { box-shadow: var(--shadow-sm); }
      .table-wrapper {
        flex: 1; display: flex; flex-direction: column; min-height: 0;
        transition: transform 0.36s var(--ease-out); overflow: hidden;
      }
      .table-scroll {
        flex: 1; overflow-y: auto; min-height: 0;
        scrollbar-width: thin; scrollbar-color: var(--red) var(--gray-100);
      }
      .table-scroll::-webkit-scrollbar       { width: 5px; }
      .table-scroll::-webkit-scrollbar-track { background: var(--gray-100); }
      .table-scroll::-webkit-scrollbar-thumb { background: var(--red); border-radius: 10px; }
      .table-container table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      .table-container thead { position: sticky; top: 0; z-index: 2; }
      .table-container th {
        background: var(--red); color: var(--white); padding: 8px 10px;
        text-align: left; font-size: 0.72rem; font-weight: 700;
        letter-spacing: 0.05em; text-transform: uppercase; white-space: pre-line;
        cursor: pointer; user-select: none; transition: background 0.15s;
      }
      .table-container th:hover { background: var(--red-dark); }
      .table-container td {
        padding: 6px 10px; border-bottom: 1px solid var(--gray-100);
        text-align: left; font-size: 0.8rem; color: var(--gray-700);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        transition: background 0.12s;
      }
      .table-container tbody tr        { transition: background 0.12s; cursor: pointer; }
      .table-container tbody tr:hover td { background: var(--red-bg); color: var(--gray-900); }
      .table-row-selected td { background: #fff3f3 !important; }
      .table-row-selected td:first-child { border-left: 3px solid var(--red) !important; }

      #streuverlust-box {
        flex-shrink: 0; background: var(--red-bg); border-top: 2px solid var(--red);
        padding: 8px 12px; font-size: 0.8rem; color: var(--gray-700);
        display: flex; justify-content: space-between; align-items: center; gap: 8px;
      }
      #streuverlust-box strong { color: var(--red); }

      /* ─── NL-Info-Panel ─────────────────────────────────────────── */
      #nl-info-container {
        position: absolute; left: 0; right: 0; bottom: 0;
        height: 100%; max-height: 100%;
        background: var(--white); border-top: 2px solid var(--red);
        box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
        transform: translateY(102%); opacity: 0;
        transition: transform 0.36s var(--ease-out), opacity 0.28s ease;
        display: flex; flex-direction: column; overflow: hidden; z-index: 10;
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      }
      #nl-info-container.show { transform: translateY(0); opacity: 1; }
      .nl-info-scroll {
        flex: 1; min-height: 0; overflow-y: auto;
        scrollbar-width: thin; scrollbar-color: var(--red) var(--gray-100);
      }
      .nl-info-scroll::-webkit-scrollbar       { width: 5px; }
      .nl-info-scroll::-webkit-scrollbar-thumb { background: var(--red); border-radius: 10px; }
      .nl-info-table { width: 100%; border-collapse: collapse; table-layout: auto; font-size: 0.78rem; }
      .nl-info-table th {
        background: var(--red); color: white; padding: 6px 8px;
        position: sticky; top: 0; z-index: 2;
        white-space: normal; word-break: break-word; text-align: center;
        border-right: 1px solid rgba(255,255,255,0.2);
        font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
        line-height: 1.3;
      }
      .nl-info-table td {
        padding: 6px 8px; border-bottom: 1px solid var(--gray-100);
        font-size: 0.78rem; white-space: nowrap; color: var(--gray-700);
        transition: background 0.12s;
      }
      .nl-info-row { cursor: pointer; transition: background 0.12s; }
      .nl-info-row:hover td { background: var(--red-bg); }
      .nl-info-row.table-row-selected td             { background: #fff3f3; }
      .nl-info-row.table-row-selected td:first-child { border-left: 3px solid var(--red); }
      .filter-container.nl-info-active .table-wrapper { transform: translateY(-100%); }

      /* ─── Map ───────────────────────────────────────────────────── */
      .map-container { width: 70%; height: 100%; position: relative; z-index: 10; isolation: isolate; }
      #map { height: 100%; width: 100%; background: #e8ecf0; }

      #map-interaction-block {
        position: absolute; inset: 0; z-index: 500;
        cursor: default; pointer-events: all;
      }
      #map-interaction-block.hidden { display: none; }

      .spinner {
        width: 42px; height: 42px;
        border: 3px solid rgba(180,24,33,0.15);
        border-top: 3px solid var(--red);
        border-radius: 50%;
        animation: spin 0.9s linear infinite;
        position: absolute; top: 50%; left: 50%;
        transform: translate(-50%, -50%); z-index: 2000;
      }
      @keyframes spin {
        0%   { transform: translate(-50%,-50%) rotate(0deg); }
        100% { transform: translate(-50%,-50%) rotate(360deg); }
      }
      #loading-spinner.hidden { display: none; }

      /* PLZ-Label auf der Karte (ab Zoom-Level LABEL_ZOOM_MIN) */
      .plz-map-label {
        background: rgba(255,255,255,0.88);
        border: 1px solid rgba(0,0,0,0.06);
        padding: 1px 5px;
        font-size: 10px;
        color: var(--gray-700);
        border-radius: 3px;
        font-family: var(--font);
        font-weight: 600;
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 1px 2px rgba(0,0,0,0.08);
        line-height: 1.25;
        display: inline-block;
        width: fit-content;
        transform: translate(-50%, -50%);
      }
      .plz-map-label.plz-map-label-strong {
        background: rgba(255,255,255,0.96);
        font-size: 11px;
        color: var(--gray-800);
        padding: 2px 6px;
      }
      .plz-map-label .plz-code { color: var(--red); font-weight: 700; }

      /* ─── Radius-Slider ─────────────────────────────────────────── */
      #radius-slider-container {
        position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
        background: var(--white); padding: 7px 14px; border-radius: 100px;
        box-shadow: var(--shadow-md); font-size: 13px; z-index: 9999;
        display: flex; align-items: center; gap: 10px;
        border: 1px solid var(--gray-200); animation: slideDown 0.4s var(--ease-out);
      }
      @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-12px); opacity: 0; }
        to   { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      #radius-slider-container label { color: var(--gray-600); font-size: 0.8rem; font-weight: 500; white-space: nowrap; }
      #radius-value { color: var(--red); font-weight: 700; min-width: 24px; display: inline-block; text-align: right; }
      #radius-slider {
        -webkit-appearance: none; appearance: none; width: 110px; height: 4px;
        border-radius: 2px;
        background: linear-gradient(90deg, var(--red) 0%, var(--gray-200) 0%);
        cursor: pointer; outline: none;
      }
      #radius-slider::-webkit-slider-thumb {
        -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%;
        background: var(--white); border: 2.5px solid var(--red);
        box-shadow: 0 1px 4px rgba(0,0,0,0.18); cursor: pointer;
        transition: transform 0.12s, box-shadow 0.12s;
      }
      #radius-slider::-webkit-slider-thumb:hover { transform: scale(1.15); box-shadow: 0 2px 6px var(--red-shadow); }
      #radius-slider::-moz-range-thumb {
        width: 16px; height: 16px; border-radius: 50%;
        background: var(--white); border: 2.5px solid var(--red); cursor: pointer;
      }

      /* ─── Map-Buttons ───────────────────────────────────────────── */
      #map-tile-toggle-btn {
        position: absolute; bottom: 20px; right: calc(26% + 14px);
        width: 48px; height: 48px;
        background: var(--white); border-radius: 50%;
        box-shadow: var(--shadow-md); cursor: pointer; z-index: 50;
        border: 1.5px solid var(--gray-200);
        transition: transform 0.18s var(--ease-out), box-shadow 0.18s, border-color 0.18s;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23b41821" viewBox="0 0 24 24"><path d="M3 6.5l6-2 6 2 6-2v13l-6 2-6-2-6 2v-13zm6 0v11l4 1.3v-11l-4-1.3zm10 0l-4 1.3v11l4-1.3v-11zm-14 0v11l4-1.3v-11l-4 1.3z"/></svg>');
        background-size: 52%; background-repeat: no-repeat; background-position: center;
      }
      #map-tile-toggle-btn:hover { transform: scale(1.1); box-shadow: var(--shadow-lg); border-color: var(--red); }

      #legend-toggle-btn {
        position: absolute; bottom: 20px; left: 14px;
        width: 48px; height: 48px;
        background: var(--white); border-radius: 50%;
        box-shadow: var(--shadow-md); cursor: pointer; z-index: 9999;
        border: 1.5px solid var(--gray-200);
        transition: transform 0.18s var(--ease-out), box-shadow 0.18s, border-color 0.18s;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23b41821" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="2" rx="1"/><rect x="4" y="11" width="12" height="2" rx="1"/><rect x="4" y="17" width="8" height="2" rx="1"/></svg>');
        background-size: 52%; background-repeat: no-repeat; background-position: center;
      }
      #legend-toggle-btn:hover { transform: scale(1.1); box-shadow: var(--shadow-lg); border-color: var(--red); }

      #heatmap-legend {
        position: absolute; bottom: 78px; left: 14px;
        background: rgba(255,255,255,0.97); border: 1.5px solid var(--gray-200);
        border-radius: var(--radius-lg); padding: 12px 14px; width: 210px;
        font-size: 11.5px; font-family: var(--font);
        z-index: 9998; box-shadow: var(--shadow-lg); pointer-events: none;
        transform-origin: bottom left;
        transition: opacity 0.22s ease, transform 0.22s var(--ease-out), visibility 0.22s;
      }
      #heatmap-legend.hidden { opacity: 0; transform: scale(0.94); visibility: hidden; }
      #heatmap-legend strong {
        font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase;
        color: var(--gray-500); font-weight: 700; display: block; margin-bottom: 8px;
      }
      .heatmap-legend-row {
        display: flex; align-items: center; gap: 8px;
        margin-bottom: 4px; color: var(--gray-700);
      }
      .heatmap-legend-color {
        width: 18px; height: 11px; border-radius: 3px;
        border: 1px solid rgba(0,0,0,0.08); flex-shrink: 0;
      }

      /* ─── Side-Popups ───────────────────────────────────────────── */
      .side-popup {
        position: absolute; right: 0; top: 0;
        width: 26%; height: calc(100% - 36% - 10px); max-height: 68%;
        background: var(--white); border-left: 3px solid var(--red);
        border-top-left-radius: var(--radius-xl);
        border-bottom-left-radius: var(--radius-xl);
        font-family: var(--font);
        overflow-y: auto; z-index: 99999; box-shadow: -4px 0 24px rgba(0,0,0,0.12);
        scrollbar-width: thin; scrollbar-color: var(--red) var(--gray-100);
        opacity: 0; transform: translateX(16px);
        transition: opacity 0.28s ease, transform 0.28s var(--ease-out);
      }
      .side-popup::-webkit-scrollbar       { width: 5px; }
      .side-popup::-webkit-scrollbar-thumb { background: var(--red); border-radius: 10px; }
      .side-popup.show   { opacity: 1; transform: translateX(0); }
      .side-popup.hidden { opacity: 0; transform: translateX(16px); pointer-events: none; }
      .popup-header-strip {
        background: linear-gradient(135deg, var(--red) 0%, var(--red-light) 100%);
        color: white; padding: 12px 14px 10px;
        border-radius: var(--radius-xl) 0 0 0; position: relative;
      }
      .popup-header-strip .popup-location {
        font-size: 0.68rem; font-weight: 500; letter-spacing: 0.04em;
        opacity: 0.75; margin-top: 2px;
      }
      .popup-header-strip .popup-title {
        font-size: 1rem; font-weight: 700; line-height: 1.3;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 32px;
      }
      .side-popup .close-btn {
        position: absolute; top: 10px; right: 10px;
        width: 26px; height: 26px;
        background: rgba(255,255,255,0.2); color: white;
        border: 1.5px solid rgba(255,255,255,0.35); border-radius: 50%;
        font-size: 13px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.15s, transform 0.15s; line-height: 1;
      }
      .side-popup .close-btn:hover { background: rgba(255,255,255,0.35); transform: scale(1.1); }
      .side-popup table { width: 100%; table-layout: fixed; border-collapse: collapse; margin: 0; }
      .side-popup th {
        background: var(--red); color: white; font-weight: 600; padding: 7px 12px;
        text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        border: none; font-size: 0.8rem;
      }
      .side-popup th.subtitle-cell {
        background: var(--gray-50); color: var(--gray-600); font-weight: 600;
        font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase;
        border-bottom: 1px solid var(--gray-200);
      }
      .side-popup td {
        font-size: 0.82rem; padding: 6px 12px; color: var(--gray-700);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        border: none; border-bottom: 1px solid var(--gray-100);
        transition: background 0.1s;
      }
      .side-popup tbody tr:hover td { background: var(--red-bg); }
      .side-popup td.label-cell { width: 62%; text-align: left;  color: var(--gray-600); font-weight: 500; }
      .side-popup td.value-cell { width: 38%; text-align: right; font-weight: 700; color: var(--gray-800); font-variant-numeric: tabular-nums; }
      .side-popup .section-title {
        background: var(--gray-50); color: var(--gray-500);
        font-weight: 700; font-size: 0.68rem;
        letter-spacing: 0.08em; text-transform: uppercase; padding: 6px 12px;
        border-top: 1px solid var(--gray-200); border-bottom: 1px solid var(--gray-200);
      }

      #side-popup-umsatz, #side-popup-overview { display: flex; flex-direction: column; }
      #side-popup-umsatz .popup-header,
      #side-popup-overview .popup-header {
        color: white; padding: 12px 14px 10px;
        font-size: 0.97rem; font-weight: 700;
        display: flex; justify-content: space-between; align-items: flex-start;
        border-radius: var(--radius-xl) 0 0 0; line-height: 1.3; flex-shrink: 0;
      }
      /* PLZ-Detail (rot) */
      #side-popup-umsatz .popup-header {
        background: linear-gradient(135deg, var(--red) 0%, var(--red-light) 100%);
      }
      /* ─── Overview-Popup: eigener visueller Identitäts-Akzent ─────
         Klares Unterscheidungsmerkmal ggü. den PLZ-Detail-Popups:
         dunkler Anthrazit-Header mit rotem Streifen oben, anderer
         Border-Akzent links, "GESAMT"-Badge im Header. So sieht der
         User auf einen Blick, ob ein PLZ-Detail oder die Gesamt-
         Übersicht offen ist. */
      #side-popup-overview {
        border-left: 3px solid var(--gray-800);
      }
      #side-popup-overview .popup-header {
        background: linear-gradient(135deg, #2a2f36 0%, #3a4049 100%);
        position: relative;
        padding-top: 14px;
      }
      #side-popup-overview .popup-header::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0;
        height: 3px; background: var(--gray-800);
      }
      .overview-badge {
        display: inline-flex; align-items: center; gap: 4px;
        background: var(--red); color: white;
        font-size: 0.6rem; font-weight: 700;
        padding: 2px 7px; border-radius: 10px;
        letter-spacing: 0.1em; text-transform: uppercase;
        margin-bottom: 4px; line-height: 1.2;
        box-shadow: 0 1px 3px rgba(180,24,33,0.4);
      }
      .overview-badge::before {
        content: '▦'; font-size: 0.7rem; line-height: 1;
      }
      /* PLZ-Detail-Badge für WK- und Umsatz-Popups (zur Abgrenzung
         gegen "Gesamt"-Popup). Dezenter Look – semitransparent auf
         dem roten Header. */
      .detail-badge {
        display: inline-flex; align-items: center; gap: 4px;
        background: rgba(255,255,255,0.22); color: white;
        font-size: 0.6rem; font-weight: 700;
        padding: 2px 7px; border-radius: 10px;
        letter-spacing: 0.1em; text-transform: uppercase;
        margin-bottom: 4px; line-height: 1.2;
        border: 1px solid rgba(255,255,255,0.3);
      }
      .detail-badge::before {
        content: '◉'; font-size: 0.65rem; line-height: 1;
      }
      #side-popup-umsatz .popup-header .close-btn,
      #side-popup-overview .popup-header .close-btn {
        position: static; flex-shrink: 0; width: 26px; height: 26px;
        background: rgba(255,255,255,0.2); color: white;
        border: 1.5px solid rgba(255,255,255,0.35); border-radius: 50%;
        font-size: 13px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.15s, transform 0.15s;
        margin-left: 8px; margin-top: 2px;
      }
      #side-popup-umsatz .popup-header .close-btn:hover,
      #side-popup-overview .popup-header .close-btn:hover {
        background: rgba(255,255,255,0.35); transform: scale(1.1);
      }
      /* Im Overview-Popup auch den Subheader anders einfärben:
         neutrales Grau statt Rot, damit "Gesamt-Charakter" konsistent bleibt */
      #side-popup-overview .umsatz-subheader {
        background: var(--gray-50);
        border-bottom: 1px solid var(--gray-200);
      }
      #side-popup-overview .umsatz-subheader .strong {
        color: var(--gray-900);
      }

      .umsatz-subheader {
        padding: 12px 14px 6px; font-size: 0.87rem; line-height: 1.55;
        background: var(--red-bg); border-bottom: 1px solid var(--red-border);
      }
      .umsatz-subheader .strong { font-weight: 700; color: var(--gray-900); }
      .section-title {
        margin: 0; padding: 6px 14px;
        background: var(--gray-50);
        border-top: 1px solid var(--gray-200); border-bottom: 1px solid var(--gray-200);
        font-weight: 700; font-size: 0.68rem;
        letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray-500);
      }
      .umsatz-grid {
        display: grid; grid-template-columns: 1.3fr 0.9fr 0.9fr;
        gap: 5px 10px; padding: 8px 14px; align-items: center;
      }
      .umsatz-grid .label { font-weight: 500; color: var(--gray-600); font-size: 0.82rem; }
      .umsatz-grid .value {
        text-align: right; font-weight: 700; color: var(--gray-800);
        font-size: 0.82rem; font-variant-numeric: tabular-nums;
      }
      .umsatz-bar {
        height: 10px; border-radius: 5px; overflow: hidden;
        display: flex; margin: 6px 14px; background: var(--gray-100);
      }
      .umsatz-bar > div { transition: width 0.5s var(--ease-out); }
      .share-stationaer { background: var(--red);  }
      .share-pluscard   { background: #1f78b4; }
      .share-ra         { background: #33a02c; }
      .share-online     { background: #ffb000; }
      .umsatz-legend {
        display: flex; gap: 10px; flex-wrap: wrap;
        padding: 4px 14px 10px; font-size: 0.78rem; color: var(--gray-600);
      }
      .umsatz-legend > span { display: flex; align-items: center; gap: 4px; }
      .disabled-cell { opacity: 0.3; filter: grayscale(1); }

      /* ─── Control-Panel ─────────────────────────────────────────── */
      #map-control-panel {
        position: absolute; right: 0; bottom: 0;
        width: 26%; height: 25%; max-height: 68%;
        overflow-y: auto;
        background: rgba(255,255,255,0.97); backdrop-filter: blur(8px);
        border-left: 1px solid var(--gray-200); border-top: 1px solid var(--gray-200);
        border-top-left-radius: var(--radius-xl); padding: 14px;
        font-family: var(--font); z-index: 20;
        display: flex; flex-direction: column; gap: 12px;
        transition: height 0.32s var(--ease-out);
        box-shadow: -2px -2px 16px rgba(0,0,0,0.08);
        scrollbar-width: thin; scrollbar-color: var(--red) var(--gray-100);
      }
      #map-control-panel.panel-auto   { height: auto; max-height: 68%; overflow-y: visible; }
      #map-control-panel.panel-large  { height: 68%; }
      #map-control-panel.panel-medium { height: 30%; }
      #map-control-panel::before {
        content: ''; display: block; position: absolute; top: 0; left: 24px; right: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--red), transparent);
        pointer-events: none;
      }
      #panel-footer {
        margin-top: 4px; padding-top: 10px;
        border-top: 1px solid var(--gray-100);
        display: flex; gap: 6px; flex-shrink: 0;
      }
      .panel-footer-btn {
        flex: 1; padding: 8px 6px; font-size: 0.75rem;
        font-family: var(--font); font-weight: 600;
        border: 1.5px solid var(--gray-200); border-radius: var(--radius-md);
        background: var(--white); color: var(--gray-500); cursor: pointer;
        transition: background 0.18s, border-color 0.18s, color 0.18s;
        display: flex; align-items: center; justify-content: center; gap: 5px;
        white-space: nowrap;
      }
      .panel-footer-btn:hover:not(:disabled) { background: var(--red-bg); border-color: var(--red); color: var(--red); }
      .panel-footer-btn:disabled { opacity: 0.35; cursor: not-allowed; }

      .panel-card {
        background: var(--white); border: 1px solid var(--gray-200);
        border-radius: var(--radius-lg); padding: 12px;
        box-shadow: var(--shadow-xs);
        display: flex; flex-direction: column; gap: 10px;
        animation: panelCardIn 0.3s var(--ease-out) both;
      }
      @keyframes panelCardIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .panel-title {
        font-size: 0.7rem; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: var(--gray-400); margin-bottom: 2px;
      }
      .switch-row { display: flex; gap: 6px; }
      .switch-btn {
        flex: 1; padding: 8px 10px; border-radius: var(--radius-md);
        border: 1.5px solid var(--gray-200); background: var(--white); color: var(--gray-600);
        font-weight: 600; font-size: 0.83rem; font-family: var(--font); cursor: pointer;
        transition: all 0.18s var(--ease-in-out);
        display: flex; align-items: center; justify-content: center; gap: 5px;
      }
      .switch-btn:hover:not(.active) { border-color: var(--red-border); background: var(--red-bg); color: var(--red); }
      .switch-btn.active { background: var(--red); border-color: var(--red); color: var(--white); box-shadow: 0 2px 8px var(--red-shadow); }
      .option-row {
        display: flex; gap: 10px; font-size: 0.82rem;
        color: var(--gray-600); align-items: center;
      }
      .option-row label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
      .option-row input[type=checkbox] { accent-color: var(--red); cursor: pointer; width: 14px; height: 14px; }

      .compact-switch {
        display: flex; background: var(--gray-100);
        border-radius: var(--radius-md); padding: 3px; gap: 2px;
        cursor: pointer; user-select: none; border: 1px solid var(--gray-200);
      }
      .compact-switch span {
        flex: 1; text-align: center; padding: 5px 4px;
        font-size: 0.76rem; font-weight: 600; border-radius: 5px;
        transition: all 0.18s var(--ease-in-out); color: var(--gray-500);
      }
      .compact-switch span:hover { color: var(--red); }
      .compact-switch.active-left  .mode-left  { background: var(--white); color: var(--red); box-shadow: var(--shadow-xs); }
      .compact-switch.active-right .mode-right { background: var(--white); color: var(--red); box-shadow: var(--shadow-xs); }
      .switch-label {
        font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em;
        text-transform: uppercase; color: var(--gray-400); margin-bottom: 1px;
      }
      .big-check {
        display: flex; align-items: center; gap: 7px; padding: 6px 10px;
        border: 1.5px solid var(--gray-200); border-radius: var(--radius-md);
        background: var(--white); font-size: 0.82rem; font-weight: 600;
        cursor: pointer; transition: border-color 0.18s, background 0.18s;
        color: var(--gray-700);
      }
      .big-check:hover { border-color: var(--red-border); background: var(--red-bg); }
      .big-check input { transform: scale(1.2); accent-color: var(--red); }
      .triple-switch {
        display: flex; background: var(--gray-100);
        border-radius: var(--radius-md); padding: 3px; gap: 2px;
        user-select: none; border: 1px solid var(--gray-200);
      }
      .triple-switch span {
        flex: 1; text-align: center; padding: 5px 2px;
        font-size: 0.74rem; font-weight: 600; border-radius: 5px;
        cursor: pointer; transition: all 0.18s var(--ease-in-out); color: var(--gray-500);
      }
      .triple-switch span.active   { background: var(--white); color: var(--red); box-shadow: var(--shadow-xs); }
      .triple-switch span.disabled { opacity: 0.35; cursor: not-allowed; }
      .category-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
      .category-toggle {
        padding: 7px 8px; border-radius: var(--radius-md);
        border: 1.5px solid var(--gray-200); background: var(--white); color: var(--gray-600);
        font-size: 0.78rem; font-weight: 600; font-family: var(--font);
        text-align: center; cursor: pointer; transition: all 0.18s var(--ease-in-out);
      }
      .category-toggle:hover:not(.active) { border-color: var(--red-border); background: var(--red-bg); color: var(--red); }
      .category-toggle.active {
        background: var(--red-bg); border-color: var(--red); color: var(--red);
        font-weight: 700; box-shadow: 0 0 0 3px var(--red-shadow);
      }

      /* ─── Animationen ───────────────────────────────────────────── */
      @keyframes criticalPulse {
        0%, 100% { transform: scale(1);   filter: drop-shadow(0 0 0px rgba(240,165,0,0)); }
        50%      { transform: scale(1.6); filter: drop-shadow(0 0 6px rgba(240,165,0,0.7)); }
      }
      @keyframes bestreuungPulse {
        0%   { opacity: 0.9;  stroke-width: 2.5; }
        50%  { opacity: 0.35; stroke-width: 1.5; }
        100% { opacity: 0.9;  stroke-width: 2.5; }
      }
      .bestreuung-pulse-path {
        fill: none; stroke: #1565c0; stroke-width: 2.5;
        stroke-dasharray: 6 3;
        animation: bestreuungPulse 2s ease-in-out infinite;
        pointer-events: none;
      }

      /* ─── Cinematic Loader ──────────────────────────────────────── */
      #cinematic-loader {
        position: absolute; inset: 0; z-index: 99999;
        background: rgba(255,255,255,0.96); backdrop-filter: blur(6px);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        font-family: var(--font); animation: loaderFadeIn 0.25s ease;
      }
      @keyframes loaderFadeIn { from { opacity: 0; } to { opacity: 1; } }
      #cinematic-loader .loader-logo { width: 64px; height: 64px; margin-bottom: 28px; position: relative; }
      #cinematic-loader .loader-logo::before {
        content: ''; position: absolute; inset: 0; border-radius: 50%;
        border: 3px solid rgba(180,24,33,0.12);
        border-top-color: var(--red); border-right-color: var(--red);
        animation: spinSlow 1.6s linear infinite;
      }
      #cinematic-loader .loader-logo::after {
        content: ''; position: absolute; inset: 10px; border-radius: 50%;
        border: 2px solid rgba(180,24,33,0.08);
        border-bottom-color: rgba(180,24,33,0.4);
        animation: spinFast 0.85s linear infinite reverse;
      }
      #cinematic-loader .loader-core {
        position: absolute; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 12px; height: 12px; border-radius: 50%;
        background: var(--red); box-shadow: 0 0 16px rgba(180,24,33,0.35);
        animation: corePulse 1.6s ease-in-out infinite;
      }
      @keyframes spinSlow  { to { transform: rotate(360deg); } }
      @keyframes spinFast  { to { transform: rotate(360deg); } }
      @keyframes corePulse {
        0%,100% { transform: translate(-50%,-50%) scale(1);    opacity: 1; }
        50%     { transform: translate(-50%,-50%) scale(1.35); opacity: 0.7; }
      }
      #cinematic-loader .loader-phase {
        color: var(--gray-700); font-size: 0.95rem; font-weight: 600;
        letter-spacing: 0.02em; margin-bottom: 4px; min-height: 1.4em;
        text-align: center; transition: opacity 0.22s ease;
      }
      #cinematic-loader .loader-bar-track {
        width: 240px; height: 3px; background: var(--gray-200);
        border-radius: 2px; margin-top: 18px; overflow: hidden;
      }
      #cinematic-loader .loader-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--red), #e96a3a);
        border-radius: 2px; width: 0%;
        transition: width 0.48s var(--ease-in-out);
      }
      #cinematic-loader .loader-dots { display: flex; gap: 20px; margin-top: 22px; }
      #cinematic-loader .loader-dot {
        display: flex; flex-direction: column; align-items: center; gap: 6px;
        opacity: 0.25; transition: opacity 0.35s ease;
      }
      #cinematic-loader .loader-dot.active { opacity: 1; }
      #cinematic-loader .loader-dot.done   { opacity: 0.5; }
      #cinematic-loader .dot-circle {
        width: 8px; height: 8px; border-radius: 50%;
        background: var(--red);
        transition: transform 0.28s var(--ease-out), box-shadow 0.28s;
      }
      #cinematic-loader .loader-dot.active .dot-circle {
        transform: scale(1.5); box-shadow: 0 0 8px var(--red-shadow);
      }
      #cinematic-loader .dot-label {
        font-size: 0.62rem; color: var(--gray-400);
        font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
        white-space: nowrap;
      }
      #cinematic-loader.fade-out { animation: loaderFadeOut 0.35s ease forwards; }
      @keyframes loaderFadeOut { to { opacity: 0; pointer-events: none; } }
      #cinematic-loader .loader-data-progress {
        width: 240px; margin-top: 14px; display: none;
        flex-direction: column; gap: 5px;
      }
      #cinematic-loader .loader-data-bar-track {
        width: 100%; height: 6px; background: var(--gray-200);
        border-radius: 3px; overflow: hidden;
      }
      #cinematic-loader .loader-data-bar-fill {
        height: 100%; border-radius: 3px; width: 0%;
        background: linear-gradient(90deg, var(--red), #e96a3a);
        transition: width 0.35s var(--ease-in-out);
      }
      #cinematic-loader .loader-data-label {
        font-size: 0.72rem; color: var(--gray-500); font-weight: 600;
        text-align: center; letter-spacing: 0.02em;
        font-variant-numeric: tabular-nums;
      }

      /* ─── Doppelbestreuungs-Toggle ──────────────────────────────── */
      #doppel-toggle-bar {
        margin-top: 10px; flex-shrink: 0;
        border: 1.5px solid var(--gray-200); border-radius: var(--radius-md);
        background: var(--gray-50); overflow: hidden;
      }
      #doppel-toggle-header {
        display: flex; align-items: center; gap: 8px;
        padding: 8px 10px 6px 10px;
      }
      .doppel-toggle-icon { font-size: 1rem; line-height: 1; flex-shrink: 0; }
      .doppel-toggle-title-block { display: flex; flex-direction: column; gap: 1px; flex: 1; }
      .doppel-toggle-label {
        font-size: 0.72rem; font-weight: 700; color: var(--gray-700);
        letter-spacing: 0.04em; text-transform: uppercase;
      }
      .doppel-toggle-subtitle { font-size: 0.67rem; color: var(--gray-500); font-weight: 400; }
      #doppel-toggle-options {
        display: flex; flex-direction: column; gap: 0;
        border-top: 1px solid var(--gray-200);
      }
      .doppel-option {
        display: flex; align-items: center; gap: 10px;
        padding: 7px 10px; cursor: pointer;
        transition: background 0.15s;
        border-bottom: 1px solid var(--gray-100);
        background: white;
      }
      .doppel-option:last-child { border-bottom: none; }
      .doppel-option:hover { background: var(--red-bg); }
      .doppel-option.active { background: var(--red-bg); }
      .doppel-option-radio {
        width: 14px; height: 14px; border-radius: 50%;
        border: 2px solid var(--gray-300); flex-shrink: 0;
        transition: border-color 0.15s, background 0.15s;
        position: relative;
      }
      .doppel-option.active .doppel-option-radio {
        border-color: var(--red); background: var(--red);
        box-shadow: 0 0 0 3px rgba(180,24,33,0.12);
      }
      .doppel-option.active .doppel-option-radio::after {
        content: ''; position: absolute; inset: 2px;
        border-radius: 50%; background: white;
      }
      .doppel-option-text { display: flex; flex-direction: column; gap: 1px; }
      .doppel-option-name { font-size: 0.78rem; font-weight: 600; color: var(--gray-800); }
      .doppel-option.active .doppel-option-name { color: var(--red); }
      .doppel-option-desc { font-size: 0.67rem; color: var(--gray-500); line-height: 1.3; }

      /* ─── Tooltip ───────────────────────────────────────────────── */
      .doppel-tooltip {
        position: absolute; z-index: 99999;
        background: var(--white); border: 1.5px solid var(--red-border);
        border-radius: var(--radius-md); padding: 8px 11px;
        font-size: 0.76rem; font-family: var(--font);
        box-shadow: var(--shadow-md);
        pointer-events: none; max-width: 220px;
        animation: tooltipFadeIn 0.18s var(--ease-out);
      }
      @keyframes tooltipFadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .doppel-tooltip-title {
        font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em;
        text-transform: uppercase; color: var(--gray-400); margin-bottom: 5px;
      }
      .doppel-tooltip-row {
        display: flex; align-items: center; gap: 6px;
        padding: 3px 0; border-bottom: 1px solid var(--gray-100);
        color: var(--gray-700);
      }
      .doppel-tooltip-row:last-child { border-bottom: none; }

      /* ─── Buttons ───────────────────────────────────────────────── */
      /* ─── Mitbewerber-Tooltip ───────────────────────────────────────── */
      .competitor-tooltip {
        background: var(--white); border: 1.5px solid #f26522;
        border-radius: var(--radius-md); padding: 6px 10px;
        font-family: var(--font); font-size: 0.8rem;
        box-shadow: var(--shadow-md); line-height: 1.5;
      }
      .competitor-tooltip::before { display: none; }

      .hidden { display: none; }

      @keyframes rowFadeIn {
        from { opacity: 0; transform: translateX(-6px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      .table-row-animated { animation: rowFadeIn 0.2s var(--ease-out) both; }

      /* Preview-Animationen für Vorschau-Rundgang */
      @keyframes previewPing {
        0%   { transform: translate(-50%,-50%) scale(0.2); opacity: 0.9; }
        100% { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
      }
      @keyframes previewFadeIn {
        from { opacity: 0; transform: translate(-50%,-80%) rotate(-45deg) scale(0.3); }
        to   { opacity: 1; transform: translate(-50%,-80%) rotate(-45deg) scale(1); }
      }
      #preview-erh-label {
        position: absolute; top: 58px; left: 50%;
        transform: translateX(-50%);
        background: rgba(255,255,255,0.93);
        border: 1px solid var(--gray-200);
        border-radius: 100px; padding: 5px 16px;
        font-size: 0.72rem; font-weight: 700;
        color: var(--gray-500); letter-spacing: .06em; text-transform: uppercase;
        pointer-events: none; box-shadow: var(--shadow-sm);
        z-index: 9000; transition: opacity 0.3s ease;
      }
    </style>

    <div class="layout">
      <div class="filter-container">
        <label for="erhebung-select">ErhebungsID</label>
        <select id="erhebung-select"></select>
        <label for="jahr-select">Jahr</label>
        <select id="jahr-select" disabled></select>
        <label for="nummer-select">Erhebungsnummer</label>
        <select id="nummer-select" disabled></select>
        <button id="filter-button">Anzeigen</button>

        <div class="table-container">
          <div class="table-wrapper" id="table-container">
            <div id="streuverlust-box"></div>
          </div>
          <div id="nl-info-container"></div>
        </div>
      </div>

      <div class="map-container">
        <div id="map-interaction-block"></div>
        <div id="map-preview-overlay" style="position:absolute;inset:0;z-index:400;pointer-events:none;overflow:hidden;"></div>
        <div id="loading-spinner" class="spinner hidden"></div>
        <div id="radius-slider-container">
          <label>Radius: <span id="radius-value">40</span> km</label>
          <input type="range" id="radius-slider" min="10" max="100" value="40" step="5">
        </div>
        <div id="map"></div>
        <div id="legend-toggle-btn" title="Legende"></div>
        <div id="heatmap-legend" class="heatmap-legend hidden"></div>
      </div>

      <div id="side-popup"          class="side-popup hidden"></div>
      <div id="side-popup-umsatz"   class="side-popup hidden"></div>
      <div id="side-popup-overview" class="side-popup hidden"></div>
    </div>

    <div id="map-tile-toggle-btn" title="Kartenstil wechseln"></div>
    <div id="map-control-panel">
      <div class="panel-card">
        <div class="panel-title">Analyse-Modus</div>
        <div class="switch-row">
          <button id="btn-wk"     class="switch-btn active">📊 WK</button>
          <button id="btn-umsatz" class="switch-btn">💶 Umsatz</button>
        </div>
        <div id="wk-extra" class="option-row">
          <label><input type="checkbox" id="chk-doppelbestreuung"> Doppelbestreuung</label>
        </div>
        <div id="competitor-row-wk" class="option-row">
          <label><input type="checkbox" id="chk-competitors-wk"> 🔨 Mitbewerber</label>
        </div>
        <div id="umsatz-options-row" class="option-row hidden">
          <label><input type="checkbox" id="chk-bestreuung"> 📍 Bestreuung</label>
          <label><input type="checkbox" id="chk-competitors-umsatz"> 🔨 Mitbewerber</label>
        </div>
      </div>
      <div id="umsatz-panel" class="panel-card hidden">
        <div class="panel-title">Umsatz-Einstellungen</div>
        <div class="switch-label">Umsatztyp</div>
        <div id="umsatz-type-switch" class="compact-switch active-left">
          <span class="mode-left">Umsatz</span>
          <span class="mode-right">Werbeumsatz</span>
        </div>
        <div id="werbe-options-row" class="option-row hidden">
          <label class="big-check"><input type="checkbox" id="chk-werbeumsatz" checked> Werbeumsatz</label>
          <label class="big-check"><input type="checkbox" id="chk-mitgekauft"> Mitgekauft</label>
        </div>
        <div class="switch-label">Darstellung</div>
        <div id="umsatz-analysis-switch" class="triple-switch">
          <span class="mode-abs active">Absolut</span>
          <span class="mode-hh">pro HH</span>
          <span class="mode-werbeanteil disabled">Werbeanteil</span>
        </div>
        <div class="category-grid">
          <div class="category-toggle active" data-cat="stationaer">🏬 Stationär</div>
          <div class="category-toggle active" data-cat="pluscard">💳 Pluscard</div>
          <div class="category-toggle active" data-cat="ra">📦 R&amp;A</div>
          <div class="category-toggle active" data-cat="online">🛒 KUBE OS</div>
        </div>
      </div>
      <div id="panel-footer">
        <button id="panel-home-btn"     class="panel-footer-btn" disabled>← Hauptmenü</button>
        <button id="panel-overview-btn" class="panel-footer-btn" disabled>📋 Übersicht</button>
      </div>
    </div>
  `;


  // ═══════════════════════════════════════════════════════════════════════
  //  GeoMapWidget – Custom Element
  // ═══════════════════════════════════════════════════════════════════════
  class GeoMapWidget extends HTMLElement {

    constructor() {
      super();

      // Shadow DOM
      this._shadowRoot = this.attachShadow({ mode: 'open' });
      this._shadowRoot.appendChild(template.content.cloneNode(true));

      // Lifecycle-Infrastruktur (wird in disconnectedCallback konsumiert)
      this._timers        = new Set();   // alle active setTimeout/setInterval-IDs
      this._intervals     = new Set();   // separate Menge für Intervalle
      this._abortCtrl     = new AbortController();
      this._signal        = this._abortCtrl.signal;

      // Datenmodell
      this._myDataSource       = null;
      this._erhebungIndex      = null;
      this._plzNormCache       = null;
      this._rawPLZCache        = {};
      this._crossErhebungPLZ   = {};
      this._distanceCache      = null;
      this._distanceCacheNLKey = null;
      this._plzCenterCache     = {};
      this._layerByPLZ         = null;
      this._geoData            = null;
      this.geoNotes            = {};

      // Map-Objekte
      this.map              = null;
      this._tileLayer       = null;
      this._geoLayer        = null;
      this._canvasRenderer  = null;
      this._tilesVisible    = false;
      this.filteredGroup    = null;
      this.neighbourGroup   = null;
      this.radiusGroup      = null;
      this.bestreuungGroup  = null;
      this.criticalMarkers  = {};
      this._labelLayer      = null;   // LayerGroup für PLZ-Namens-Labels
      this._labelByPLZ      = {};     // plz → Leaflet-Marker (Label)
      this.iconCache        = {};

      // UI-State
      this.currentMapMode        = 'wk';
      this.activeCategories      = new Set(CATEGORIES);
      this.umsatzMainMode        = 'gesamt';
      this.umsatzDarstellung     = 'abs';
      this.useWerbeUmsatz        = true;
      this.useZusatzUmsatz       = false;
      this.useRadiusFilter       = true;
      this.showBestreuung        = false;
      this.showCompetitors       = false;
      this.showCritical          = false;
      this._sortState            = { column: null, direction: 'asc' };
      this._selectedNLs          = new Set();
      this._nlSelectionInitialized = false;
      this._activeFilter         = null;
      this._activePopupPLZ       = null;
      this._activePopupType      = null;
      this._highlightedPLZ       = null;
      this._lastHighlightedRow   = null;
      this._lastHighlightedLayer = null;
      this.filteredData          = null;
      this.filteredKennwerte     = {};
      this.filteredPLZWerte      = {};
      this.plzImRadius           = new Set();
      this.allNLs                = [];
      this.allMarkers            = [];
      this.nlMarkers             = [];
      this.Niederlassung         = {};
      this.nlKoordinaten         = {};
      this.hzFlags               = {};
      this.extraNLs              = [];

      // Status-Flags
      this._bootstrapDone          = false;
      this._fullIndexReady         = false;
      this._fullDataLoaded         = false;
      this._renderInProgress       = false;
      this._pendingRender          = false;
      this._homeResetPending       = false;
      this._dropdownsInitialized   = false;
      this._plzFilterInitialized   = false;
      this._doppelbestreuungAktiv  = false;
      this._doppelTooltipEl        = null;
      this._geoClickBound          = false;

      // Geteilte Filter-Keys (werden beim ersten erfolgreichen set/remove gecached)
      this._plzFilterKey    = null;
      this._erhIDFilterKey  = null;
      this._jahrFilterKey   = null;
      this._nummerFilterKey = null;
    }

    // ── Lifecycle ──────────────────────────────────────────────────────
    connectedCallback() {
      // Re-Connect-fest: nach disconnect ist der AbortController aborted und alle
      // weiteren _on()-Calls würden ins Leere laufen. Bei jedem connect frisch.
      if (this._signal?.aborted) {
        this._abortCtrl = new AbortController();
        this._signal    = this._abortCtrl.signal;
      }
      // GeoJSON + Competitor-Daten parallel vorladen
      this._geoJsonPromise = fetch(GEOJSON_URL, { cache: 'force-cache' })
        .then(r => r.json())
        .catch(err => { console.error('[PLZ-Widget] GeoJSON prefetch:', err); return null; });

      fetch(COMPETITORS_URL, { cache: 'force-cache' })
        .then(r => r.text())
        .then(text => {
          // BOM (U+FEFF) und unsichtbare Zeichen am Anfang entfernen
          const clean = text.replace(/^\uFEFF/, '').trim();
          // Wenn GitHub eine 404-HTML-Seite liefert statt JSON
          if (clean.startsWith('<')) {
            console.warn('[PLZ-Widget] competitor.json: Server liefert HTML statt JSON — URL prüfen:', COMPETITORS_URL);
            console.warn('[PLZ-Widget] Erste 200 Zeichen:', clean.slice(0, 200));
            this._competitorData = [];
            return;
          }
          const data = JSON.parse(clean);
          this._competitorData = Array.isArray(data) ? data : [];
          console.info(`[PLZ-Widget] Mitbewerber geladen: ${this._competitorData.length} Einträge`);
          if (this.showCompetitors && this.map) this.updateCompetitorMarkers();
        })
        .catch(err => {
          console.warn('[PLZ-Widget] competitor.json nicht ladbar:', err);
          this._competitorData = [];
        });

      this._showCinematicLoader();
      this._updateLoaderPhase(1, 'Leaflet wird geladen…');

      if (!window.L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet'; link.href = LEAFLET_CSS;
        const script = document.createElement('script');
        script.src = LEAFLET_JS;
        script.onload = () => {
          if (!this.isConnected) return;   // Widget schon entfernt → abbrechen
          this._updateLoaderPhase(2, 'Karte wird initialisiert…');
          this.initializeMapBase();
        };
        this._shadowRoot.appendChild(link);
        this._shadowRoot.appendChild(script);
      } else {
        this._updateLoaderPhase(2, 'Karte wird initialisiert…');
        this.initializeMapBase();
      }
    }

    disconnectedCallback() {
      // Alle Timer stoppen
      for (const id of this._timers)    clearTimeout(id);
      for (const id of this._intervals) clearInterval(id);
      this._timers.clear();
      this._intervals.clear();

      // Alle DOM-Listener abhängen (addEventListener mit signal: this._signal)
      this._abortCtrl.abort();

      // Leaflet sauber abbauen
      if (this.map) {
        try { this.map.off(); this.map.remove(); } catch (e) { /* swallow */ }
        this.map = null;
      }
      // Layer-Referenzen explizit nullen, damit ein eventueller Re-Connect
      // (gleiche Instanz, neue map) die Layer korrekt neu aufbaut.
      this._geoLayer       = null;
      this._labelLayer     = null;
      this._tileLayer      = null;
      this._canvasRenderer = null;
      this.filteredGroup   = null;
      this.neighbourGroup  = null;
      this.radiusGroup     = null;
      this.bestreuungGroup = null;
      this.competitorGroup = null;   // Mitbewerber-Marker
      this._competitorData = null;   // geladene competitor.json
      this._previewGroup   = null;

      // Caches freigeben
      this._plzNormCache = null;
      this._erhebungIndex = null;
      this._distanceCache = null;
      this._plzCenterCache = null;
      this._layerByPLZ = null;
      this._labelByPLZ = {};
      this.criticalMarkers = {};
      this.iconCache = {};

      // Init-Flags zurücksetzen, damit ein eventueller Re-Connect sauber neu aufsetzt
      this._dropdownsInitialized = false;
      this._plzFilterInitialized = false;
      this._geoClickBound        = false;
      this._bootstrapDone        = false;
      this._fullIndexReady       = false;
      this._fullDataLoaded       = false;
      this._renderInProgress     = false;
      this._pendingRender        = false;
      this._dataPollTimer        = null;
      this._loadSecTimer         = null;
      this._previewInterval      = null;
    }

    // Tracked setTimeout/Interval — werden in disconnectedCallback aufgeräumt
    _setTimeout(fn, ms) {
      const id = setTimeout(() => { this._timers.delete(id); fn(); }, ms);
      this._timers.add(id);
      return id;
    }
    _setInterval(fn, ms) {
      const id = setInterval(fn, ms);
      this._intervals.add(id);
      return id;
    }
    _clearInterval(id) {
      if (id == null) return;
      clearInterval(id);
      this._intervals.delete(id);
    }

    // Shortcut für addEventListener mit AbortController-Signal
    _on(el, type, handler, opts) {
      if (!el) return;
      el.addEventListener(type, handler, { ...(opts || {}), signal: this._signal });
    }

    // Shortcut für getElementById im Shadow-Root
    $(id) { return this._shadowRoot.getElementById(id); }

    // ── PLZ-Normalisierung mit LRU-light Cache ─────────────────────────
    // BW liefert char(10) z.B. "0000069151" → letzte 5 Stellen = "69151".
    // Normale <=5-stellige PLZs werden mit padStart aufgefüllt.
    _normalizePLZ(raw) {
      if (raw == null) return null;
      if (!this._plzNormCache) this._plzNormCache = new Map();
      const cached = this._plzNormCache.get(raw);
      if (cached !== undefined) return cached;

      let s = String(raw);
      if (s.includes(' ')) s = s.replace(/\s/g, '');
      let result;
      if (!s || s === '@NullMember' || s === '@TotalMembers') result = null;
      else if (s.length > 5)                                  result = s.slice(-5);
      else                                                    result = s.padStart(5, '0');

      // Soft-Cap: vermeidet ewiges Wachstum
      if (this._plzNormCache.size > 20000) this._plzNormCache.clear();
      this._plzNormCache.set(raw, result);
      return result;
    }

    // Einheitliche GF-Bereich-Formatierung
    _fmtGF(id) { return id ? `GF-Bereich ${id}` : id; }


    // ── Erhebungs-Index (ein Pass über alle Rohdaten) ──────────────────
    // Für Fremd-Erhebungen nur HZ=X Rows → 80-90% kleinerer Index.
    _buildErhebungIndex(aktErhID) {
      const data = this._myDataSource?.data;
      if (!Array.isArray(data)) { this._erhebungIndex = {}; return; }
      const idx = {};
      const hasAktFilter = !!aktErhID;
      for (let i = 0, len = data.length; i < len; i++) {
        const row = data[i];
        const eID = row['dimension_erhebung_0']?.id;
        const yr  = row['dimension_jahr_0']?.id;
        const nr  = row['dimension_erhebungsnummer_0']?.id;
        if (isNull(eID) || isNull(yr) || isNull(nr)) continue;
        // Fremd-Erhebung: nur HZ=X Rows speichern
        if (hasAktFilter && eID !== aktErhID) {
          if (row['dimension_hzflag_0']?.id?.trim() !== 'X') continue;
        }
        const key = eID + '|' + yr + '|' + nr;
        (idx[key] ||= []).push(row);
      }
      this._erhebungIndex = idx;
    }

    _getErhebungRows(erhID, jahr, nummer) {
      if (!this._erhebungIndex) this._buildErhebungIndex(erhID);
      return this._erhebungIndex[erhID + '|' + jahr + '|' + nummer] || [];
    }

    // Gemeinsame Struktur-Ableitung: {erhID: {jahr: Set<nummer>}}
    _buildStrukturFromRows(rows) {
      const struktur = {};
      for (let i = 0, len = rows.length; i < len; i++) {
        const row   = rows[i];
        const erhID = row['dimension_erhebung_0']?.id?.trim();
        const jahr  = row['dimension_jahr_0']?.id?.trim();
        const nr    = row['dimension_erhebungsnummer_0']?.id?.trim();
        if (isNull(erhID) || isNull(jahr) || isNull(nr)) continue;
        (struktur[erhID] ||= {});
        (struktur[erhID][jahr] ||= new Set()).add(nr);
      }
      return struktur;
    }

    buildErhebungsStruktur(data) {
      // Falls Index vorhanden: daraus ableiten – ein Level flacher als Rohdaten
      if (this._erhebungIndex) {
        const struktur = {};
        for (const key of Object.keys(this._erhebungIndex)) {
          const [erhID, jahr, nummer] = key.split('|');
          (struktur[erhID] ||= {});
          (struktur[erhID][jahr] ||= new Set()).add(nummer);
        }
        return struktur;
      }
      return this._buildStrukturFromRows(data);
    }

    // ── SAC DataSource-Zugriff ─────────────────────────────────────────
    _getDataSource() {
      try {
        return this.dataBindings?.getDataBinding('myDataSource')?.getDataSource() ?? null;
      } catch (e) {
        console.warn('[PLZ-Widget] DataSource nicht verfügbar:', e);
        return null;
      }
    }

    // Alle potentiell gesetzten ErhID/Jahr/Nummer-Filter entfernen
    _removeAllErhebungFilters(ds) {
      for (const key of ALL_STALE_KEYS) {
        try { ds.removeDimensionFilter(key); } catch (e) { /* war nicht gesetzt */ }
      }
      this._erhIDFilterKey = null;
      this._jahrFilterKey  = null;
      this._nummerFilterKey = null;
    }

    // Versucht, einen Filter über eine der möglichen Key-Varianten zu setzen.
    // Gibt den erfolgreichen Key zurück oder null.
    _trySetFilter(ds, keys, values) {
      for (const key of keys) {
        try { ds.setDimensionFilter(key, values); return key; } catch (e) { /* weiter */ }
      }
      return null;
    }

    // Initialer PLZ=00000-Filter beim Widget-Start.
    // BW liefert dann nur ~161 Rows statt 27k → Bootstrap in <1s.
    _applyPLZ00000Filter() {
      const ds = this._getDataSource();
      if (!ds) return;
      try {
        this._removeAllErhebungFilters(ds);
        const key = this._trySetFilter(ds, PLZ_FILTER_KEYS, ['00000']);
        if (key) {
          this._plzFilterKey = key;
          console.info('[PLZ-Widget] PLZ=00000 Filter gesetzt (' + key + ')');
        } else {
          console.warn('[PLZ-Widget] PLZ=00000 Filter konnte nicht gesetzt werden');
        }
      } catch (e) {
        console.warn('[PLZ-Widget] _applyPLZ00000Filter:', e);
      }
    }

    // Wechsel der BW-Filter vor dem removeDimensionFilter für PLZ.
    // Doppelbestreuung aus → ErhebungsID + Jahr + Nummer (nur eigene Erhebung).
    // Doppelbestreuung ein → nur Jahr + Nummer (alle Erhebungen).
    _switchToErhebungFilter(erhID, jahr, nummer) {
      const ds = this._getDataSource();
      if (!ds) return false;
      const t0 = performance.now();

      if (!this._doppelbestreuungAktiv) {
        const kE = this._trySetFilter(ds, ERH_FILTER_KEYS,    [erhID]);
        const kJ = this._trySetFilter(ds, JAHR_FILTER_KEYS,   [jahr]);
        const kN = this._trySetFilter(ds, NUMMER_FILTER_KEYS, [nummer]);
        this._erhIDFilterKey  = kE;
        this._jahrFilterKey   = kJ;
        this._nummerFilterKey = kN;
      } else {
        // ErhID-Filter aus vorigem "ohne Doppelbestreuung"-Lauf sicher entfernen
        if (this._erhIDFilterKey) {
          try { ds.removeDimensionFilter(this._erhIDFilterKey); } catch (e) {}
          this._erhIDFilterKey = null;
        } else {
          for (const k of ERH_FILTER_KEYS) {
            try { ds.removeDimensionFilter(k); } catch (e) {}
          }
        }
        this._jahrFilterKey   = this._trySetFilter(ds, JAHR_FILTER_KEYS,   [jahr]);
        this._nummerFilterKey = this._trySetFilter(ds, NUMMER_FILTER_KEYS, [nummer]);
      }

      // PLZ-Filter zuletzt entfernen → triggert kombinierten BW-Query
      let removed = false;
      for (const k of PLZ_FILTER_KEYS) {
        try { ds.removeDimensionFilter(k); this._plzFilterKey = k; removed = true; break; } catch (e) {}
      }
      if (removed) {
        this._filterSwitchTime = Date.now();
        console.info(`[PLZ-Widget] Filter-Switch in ${(performance.now() - t0).toFixed(0)}ms`);
      }
      return removed;
    }

    // ── Bootstrap aus PLZ=00000-Rows ───────────────────────────────────
    _bootstrapFromPLZ00000(rows) {
      if (this._bootstrapDone) return;
      this._bootstrapDone = true;

      const t0 = performance.now();

      // Index aus den 00000-Rows aufbauen
      const idx = {};
      for (const row of rows) {
        const eID = row['dimension_erhebung_0']?.id;
        const yr  = row['dimension_jahr_0']?.id;
        const nr  = row['dimension_erhebungsnummer_0']?.id;
        if (isNull(eID) || isNull(yr) || isNull(nr)) continue;
        const k = eID + '|' + yr + '|' + nr;
        (idx[k] ||= []).push(row);
      }
      this._erhebungIndex = idx;

      this._erhData = this.buildErhebungsStruktur(rows);
      this.setupFilterDropdowns();

      // NL-Stammdaten
      this.Niederlassung = {};
      this.nlKoordinaten = {};
      for (const row of rows) {
        const nl  = row['dimension_niederlassung_0']?.id?.trim();
        const lat = parseFloat(row['dimension_Lat_0']?.label);
        const lon = parseFloat(row['dimension_lon_0']?.label);
        if (!nl || isNaN(lat) || isNaN(lon)) continue;
        this.Niederlassung[nl] = row['dimension_nl_name_0']?.label?.trim() || nl;
        this.nlKoordinaten[nl] = { lat, lon };
      }

      this.loadGeoJson();
      this._startPreviewAnimation();
      this._hideCinematicLoader();

      this._totalRowCount  = rows.length;
      this._fullIndexReady = true;
      this._cachedBootstrapRows     = rows;
      this._cachedBootstrapStruktur = this._buildStrukturFromRows(rows);

      // Panel-Footer-Buttons im Hauptmenü deaktivieren
      this.$('panel-home-btn')?.setAttribute('disabled', '');
      this.$('panel-overview-btn')?.setAttribute('disabled', '');

      console.info(`[PLZ-Widget] Bootstrap: ${rows.length} Rows in ${(performance.now() - t0).toFixed(0)}ms`);
    }

    // ── GeoJSON ────────────────────────────────────────────────────────
    async loadGeoJson() {
      if (this._geoLayer) return;
      try {
        const geoData = this._geoJsonPromise
          ? await this._geoJsonPromise
          : await fetch(GEOJSON_URL, { cache: 'force-cache' }).then(r => r.json());
        this._geoJsonPromise = null;
        if (!geoData || !this.isConnected) return;

        this._geoData = geoData;
        this.geoNotes = {};
        const features = geoData.features || [];
        for (let i = 0; i < features.length; i++) {
          const p = features[i].properties;
          if (p?.plz && p?.note) this.geoNotes[String(p.plz).padStart(5, '0')] = p.note.trim();
        }

        this._geoLayer = L.geoJSON(geoData, {
          renderer: this._canvasRenderer,
          style: () => ({ fillColor: '#e9ecef', weight: 0.8, opacity: 1, color: 'white', fillOpacity: 0.35 }),
        }).addTo(this.map);

        // Index: plz → layer
        this._layerByPLZ = {};
        this._geoLayer.eachLayer(layer => {
          const plz = String(layer.feature?.properties?.plz ?? '').padStart(5, '0');
          this._layerByPLZ[plz] = layer;
        });

        // Zentraler Click-Handler – ersetzt das Rebinden pro Layer in applyStyleToLayer
        this._bindGeoLayerClicks();
        // Label-Refresh an Zoom/Pan binden
        this._bindLabelUpdates();
      } catch (err) {
        console.error('[PLZ-Widget] GeoJSON:', err);
      }
    }

    // Ein einziger Click-Handler pro Layer (statt pro updateGeoLayer neu gebunden)
    _bindGeoLayerClicks() {
      if (this._geoClickBound || !this._geoLayer) return;
      this._geoClickBound = true;
      this._geoLayer.eachLayer(layer => {
        layer.on('click', () => {
          const plz = String(layer.feature?.properties?.plz ?? '').padStart(5, '0');
          this._handlePolygonClick(plz, layer);
        });
      });
    }

    _handlePolygonClick(plz, layer) {
      if (!this._activeFilter) return;  // Home-Ansicht: Klicks ignorieren
      this.closeAllPopups();
      this.highlightMapArea(plz);
      this.highlightTableRowByPLZ(plz);

      if (this.currentMapMode === 'umsatz-multi' || this.currentMapMode === 'werbeanteil') {
        const values = this.filteredPLZWerte?.[plz];
        if (values) this.showUmsatzPopup(plz, values);
        else        this.showEmptyUmsatzPopup(plz);
      } else {
        this.showPopup(layer.feature, this.filteredKennwerte?.[plz] || {});
      }
    }


    // ── PLZ-Namen auf der Karte (zoom-abhängig + Collision-Detection) ──
    //
    // Verhalten:
    //   • Zoom < LABEL_ZOOM_MIN            → alle Labels entfernen
    //   • Zoom >= LABEL_ZOOM_MIN           → Labels im Viewport anzeigen,
    //                                        mit Collision-Detection gegen
    //                                        Überlappungen
    //   • Zoom >= LABEL_ZOOM_CLEAR         → Labels etwas größer / klarer
    //   • Hard-Cap LABEL_MAX_COUNT         → bei zu vielen sichtbaren PLZs
    //                                        werden die priorisiert, die mit
    //                                        Daten belegt sind (filteredPLZWerte)
    //
    // Performance-Strategie:
    //   Labels werden als L.marker mit leerem HTML-Icon eingefügt und nur
    //   neu aufgebaut, wenn sich der sichtbare Set ändert. Wir halten einen
    //   labelByPLZ-Index, damit nur das Delta (add/remove) angefasst wird.
    _bindLabelUpdates() {
      if (!this.map) return;
      this._labelLayer = L.layerGroup().addTo(this.map);

      const schedule = () => this._scheduleLabelUpdate();
      this.map.on('zoomend', schedule);
      this.map.on('moveend', schedule);
      // Sofort initial rendern
      schedule();
    }

    _scheduleLabelUpdate() {
      if (this._labelUpdateScheduled) return;
      this._labelUpdateScheduled = true;
      // Ein Frame warten, um Zoom/Pan-Bursts zu poolen
      requestAnimationFrame(() => {
        this._labelUpdateScheduled = false;
        this._updateMapLabels();
      });
    }

    _updateMapLabels() {
      if (!this.map || !this._labelLayer || !this._layerByPLZ) return;

      const zoom = this.map.getZoom();
      // Unterhalb des Schwellwerts alle Labels entfernen
      if (zoom < LABEL_ZOOM_MIN) {
        if (Object.keys(this._labelByPLZ).length > 0) {
          this._labelLayer.clearLayers();
          this._labelByPLZ = {};
        }
        return;
      }

      const strong = zoom >= LABEL_ZOOM_CLEAR;
      const bounds = this.map.getBounds();

      // 1) Kandidaten einsammeln: alle PLZ-Polygone, deren Zentrum im Viewport liegt
      //    Mit Bias auf PLZs, die in filteredPLZWerte liegen (= relevant für aktive Erhebung).
      const centerCache = this._plzCenterCache ||= {};
      const candidates = [];
      const plzList = Object.keys(this._layerByPLZ);
      const haveData = this.filteredPLZWerte && Object.keys(this.filteredPLZWerte).length > 0;

      for (let i = 0; i < plzList.length; i++) {
        const plz = plzList[i];
        const layer = this._layerByPLZ[plz];
        if (!layer) continue;

        // Zentrum cachen (teuer, weil getBounds auf Polygonen)
        let c = centerCache[plz];
        if (!c) {
          try {
            const b = layer.getBounds();
            c = centerCache[plz] = { lat: (b._southWest.lat + b._northEast.lat) / 2,
                                     lng: (b._southWest.lng + b._northEast.lng) / 2 };
          } catch (e) { continue; }
        }
        if (!bounds.contains([c.lat, c.lng])) continue;

        // Priorität: PLZs mit Daten zuerst, dann Rest
        const hasData = haveData && this.filteredPLZWerte[plz] != null;
        candidates.push({ plz, lat: c.lat, lng: c.lng, priority: hasData ? 0 : 1 });
      }

      // Hard-Cap: auf LABEL_MAX_COUNT begrenzen (Daten-Labels priorisieren)
      if (candidates.length > LABEL_MAX_COUNT) {
        candidates.sort((a, b) => a.priority - b.priority);
        candidates.length = LABEL_MAX_COUNT;
      }

      // 2) Collision-Detection in Pixel-Koordinaten
      //    Approx. Label-Größe: 56 × 18 px bei normal, 72 × 22 px bei strong.
      //    Wir projizieren jedes Zentrum nach Pixel und verwerfen Kandidaten,
      //    deren Bounding-Box mit einem bereits akzeptierten überlappt.
      const labelW = strong ? 72 : 58;
      const labelH = strong ? 22 : 18;
      const accepted = [];
      // Kandidaten mit Daten zuerst, so bekommen sie Vorrang beim Overlap
      candidates.sort((a, b) => a.priority - b.priority);

      for (const cand of candidates) {
        const pt = this.map.latLngToContainerPoint([cand.lat, cand.lng]);
        const ax = pt.x - labelW / 2, ay = pt.y - labelH / 2;
        let collide = false;
        for (let j = 0; j < accepted.length; j++) {
          const a = accepted[j];
          if (ax < a.x + labelW && ax + labelW > a.x &&
              ay < a.y + labelH && ay + labelH > a.y) {
            collide = true; break;
          }
        }
        if (collide) continue;
        accepted.push({ plz: cand.plz, lat: cand.lat, lng: cand.lng, x: ax, y: ay });
      }

      // 3) Delta anwenden: existierende Labels behalten, fehlende hinzufügen,
      //    überzählige entfernen.
      const keepSet = new Set(accepted.map(a => a.plz));
      for (const plz of Object.keys(this._labelByPLZ)) {
        if (!keepSet.has(plz)) {
          this._labelLayer.removeLayer(this._labelByPLZ[plz]);
          delete this._labelByPLZ[plz];
        }
      }

      // Icon-Stilwechsel, falls sich "strong" geändert hat
      if (this._labelStrong !== strong) {
        this._labelStrong = strong;
        // alle bestehenden Icons neu stylen
        for (const plz of Object.keys(this._labelByPLZ)) {
          this._labelLayer.removeLayer(this._labelByPLZ[plz]);
          delete this._labelByPLZ[plz];
        }
      }

      for (const a of accepted) {
        if (this._labelByPLZ[a.plz]) continue;
        const gemeinde = this.geoNotes?.[a.plz]
          ? this.geoNotes[a.plz].replace(/^\d{4,5}\s*[-–]?\s*/, '').trim()
          : '';
        const inner = gemeinde
          ? `<span class="plz-code">${escapeHtml(a.plz)}</span>&nbsp;${escapeHtml(gemeinde)}`
          : `<span class="plz-code">${escapeHtml(a.plz)}</span>`;
        const icon = L.divIcon({
          html: `<div class="plz-map-label${strong ? ' plz-map-label-strong' : ''}">${inner}</div>`,
          className: '',
          iconSize: [0, 0],       // kein fixer Rahmen → div bestimmt Breite selbst
          iconAnchor: [0, 0],     // Anker oben-links, Label zentriert sich via CSS transform
        });
        const m = L.marker([a.lat, a.lng], { icon, interactive: false, keyboard: false, zIndexOffset: 400 });
        this._labelLayer.addLayer(m);
        this._labelByPLZ[a.plz] = m;
      }
    }

    _clearMapLabels() {
      if (this._labelLayer) this._labelLayer.clearLayers();
      this._labelByPLZ = {};
    }


    // ── Karte: Styling, Highlighting ───────────────────────────────────
    applyMapMode(mode) { this.currentMapMode = mode; this.updateGeoLayer(); }

    highlightTableRow(rowElement) {
      if (this._lastHighlightedRow) this._lastHighlightedRow.classList.remove('table-row-selected');
      rowElement.classList.add('table-row-selected');
      this._lastHighlightedRow = rowElement;
    }

    highlightTableRowByPLZ(plz) {
      const container = this.$('table-container');
      if (!container) return;
      const rows = container.querySelectorAll('tbody tr');
      for (const row of rows) {
        if (row.dataset.plz === plz) { this.highlightTableRow(row); break; }
      }
    }

    highlightMapArea(plz) {
      if (!this._layerByPLZ) return;
      const target = this._layerByPLZ[plz];
      if (!target) return;
      if (this._lastHighlightedLayer && this._lastHighlightedLayer !== target) {
        this.applyStyleToLayer(this._lastHighlightedLayer);
      }
      this._highlightedPLZ = plz;
      target.setStyle({ weight: 3, color: '#f0a500', fillOpacity: 0.72 });
      this._lastHighlightedLayer = target;
    }

    zoomToFilteredPLZ() {
      if (!this._layerByPLZ || !this.plzImRadius || this.plzImRadius.size === 0) return;
      const bounds = L.latLngBounds([]);
      this.plzImRadius.forEach(plz => {
        const layer = this._layerByPLZ[plz];
        if (layer) { const lb = layer.getBounds?.(); if (lb) bounds.extend(lb); }
      });
      if (bounds.isValid()) this.map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
    }

    // ── Tabellen-Rendering ─────────────────────────────────────────────
    renderDataTable(data) {
      let entries = Object.entries(data || {})
        .map(([plz, v]) => [String(plz).padStart(5, '0'), v])
        .filter(([plz]) => plz !== '00000');

      if (this.plzImRadius && this.plzImRadius.size > 0) {
        entries = entries.filter(([plz]) => this.plzImRadius.has(plz));
      }
      if (!this._sortState || this._sortState.column == null) {
        entries.sort(([a], [b]) => a.localeCompare(b));
      }
      this.renderDataTableFromEntries(entries);
      this.updateStreuverlustFooter();
    }

    updateStreuverlustFooter() {
      const box = this.$('streuverlust-box');
      if (!box) return;
      if (!this.streuverlust) { box.innerHTML = ''; return; }

      let totalInRadius = 0;
      if (this.filteredKennwerte) {
        for (const [plz, k] of Object.entries(this.filteredKennwerte)) {
          if (!this.plzImRadius || this.plzImRadius.size === 0 || this.plzImRadius.has(plz)) {
            totalInRadius += k['value_hr_n_umsatz_0']?.raw ?? 0;
          }
        }
      }
      box.innerHTML =
        `<span><strong>Streuverlust:</strong> ${fmtNum(this.streuverlust.umsatz)} €
          &nbsp;·&nbsp; ${(this.streuverlust.anteil * 100).toFixed(1)} %</span>
         <span style="font-weight:700;color:var(--red);white-space:nowrap">
           Ges.: ${fmtNum(totalInRadius)} €
         </span>`;
    }

    computeStreuverlust() {
      if (!this.filteredData) return;
      let streuverlustUmsatz = 0, totalErhebungUmsatz = 0;
      const selNLs = this._selectedNLs;
      const radius = this.plzImRadius;
      const hasNL   = selNLs && selNLs.size > 0;
      const hasRad  = radius instanceof Set && radius.size > 0;
      const data    = this.filteredData;
      for (let i = 0, len = data.length; i < len; i++) {
        const row = data[i];
        const nl  = row['dimension_niederlassung_0']?.id?.trim();
        if (hasNL && !selNLs.has(nl)) continue;
        const plz = this._normalizePLZ(row['dimension_plz_0']?.id ?? row['dimension_plz_0']?.raw);
        if (!plz) continue;
        const umsatz = row['value_hr_n_umsatz_0']?.raw ?? 0;
        totalErhebungUmsatz += umsatz;
        if (!hasRad || !radius.has(plz)) streuverlustUmsatz += umsatz;
      }
      this.streuverlust = {
        umsatz: streuverlustUmsatz,
        anteil: totalErhebungUmsatz > 0 ? streuverlustUmsatz / totalErhebungUmsatz : 0
      };
    }

    sortTableByColumn(columnIndex) {
      if (!this.filteredKennwerte) return;
      if (this._sortState.column === columnIndex) {
        this._sortState.direction = this._sortState.direction === 'asc' ? 'desc' : 'asc';
      } else {
        this._sortState.column = columnIndex;
        this._sortState.direction = 'desc';
      }
      const dir = this._sortState.direction === 'asc' ? 1 : -1;
      const entries = Object.entries(this.filteredKennwerte);
      const sorted = entries.sort(([plzA, a], [plzB, b]) => {
        let valA, valB;
        switch (columnIndex) {
          case 0: valA = plzA; valB = plzB; break;
          case 1: valA = this.geoNotes?.[plzA] || ''; valB = this.geoNotes?.[plzB] || ''; break;
          case 2:
            valA = a.isCritical ? 2 : (a.isHZ ? 1 : 0);
            valB = b.isCritical ? 2 : (b.isHZ ? 1 : 0);
            break;
          case 3: valA = a['value_hr_n_umsatz_0']?.raw ?? -Infinity; valB = b['value_hr_n_umsatz_0']?.raw ?? -Infinity; break;
          case 4: valA = a['value_wk_nachbar_0']?.raw  ?? -Infinity; valB = b['value_wk_nachbar_0']?.raw  ?? -Infinity; break;
          default: return 0;
        }
        if (typeof valA === 'string') return valA.localeCompare(valB) * dir;
        return (valA - valB) * dir;
      });
      this.renderDataTableFromEntries(sorted);
    }

    updateSortIcons(activeIndex) {
      const headers = this._shadowRoot.querySelectorAll('th .sort-icon');
      headers.forEach((icon, i) => {
        icon.textContent = i === activeIndex ? (this._sortState.direction === 'asc' ? '▲' : '▼') : '';
      });
    }

    _renderWelcomeGuide(container) {
      const guide = document.createElement('div');
      guide.style.cssText = 'padding:20px 14px;flex:1;display:flex;flex-direction:column;gap:14px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--red) var(--gray-100);';
      const modes = [
        ['📊', 'WK-Analyse',         'Werbekosten-Anteile je PLZ. Grün = HZ-bestreut, Blau = potentiell nicht bestreut. Klicke auf eine PLZ für Detailwerte.'],
        ['💶', 'Umsatz-Analyse',     'Umsatzverteilung nach Kategorien (Stationär, Pluscard, R&A, KUBE OS). Absolut-, Pro-HH- oder Werbeanteil-Darstellung.'],
        ['⚠️', 'Doppelbestreuung',   'Im WK-Modus: zeigt PLZs, die von mehreren Erhebungen (gleicher Jahr/Nummer) gleichzeitig bestreut werden.'],
        ['📍', 'Bestreuungs-Overlay', 'Im Umsatz-Modus: pulsierende Konturen für HZ-bestreute Gebiete.'],
      ];
      const tools = [
        ['🔴', 'Radius-Slider',     'Oben in der Mitte: Einzugsgebiet festlegen. Nur PLZs im Radius werden ausgewertet.'],
        ['🏢', 'NL-Filter',          '↕ Erhebungsübersicht: alle NLs mit Umsatz-Kennzahlen. Klick filtert auf diese NL; Mehrfachauswahl möglich.'],
        ['🗺️', 'Kartenebenen',       'Karten-Button: OpenStreetMap ein-/ausblenden. Legende-Button: Farbskala anzeigen.'],
        ['📋', 'Tabelle sortieren', 'Klick auf Spalten-Header sortiert. Klick auf Zeile markiert die PLZ auf der Karte.'],
      ];
      const card = (icon, title, desc) => `
        <div style="display:flex;gap:9px;align-items:flex-start;padding:7px 9px;background:var(--gray-50);border-radius:var(--radius-md);border:1px solid var(--gray-100);">
          <div style="font-size:1rem;flex-shrink:0;margin-top:1px;">${icon}</div>
          <div>
            <div style="font-size:0.76rem;font-weight:700;color:var(--gray-700);">${escapeHtml(title)}</div>
            <div style="font-size:0.7rem;color:var(--gray-500);margin-top:2px;line-height:1.45;">${escapeHtml(desc)}</div>
          </div>
        </div>`;
      guide.innerHTML = `
        <div style="text-align:center;padding:12px 0 6px;">
          <div style="font-size:2.2rem;margin-bottom:6px;">🗺️</div>
          <div style="font-size:0.9rem;font-weight:700;color:var(--gray-700);margin-bottom:3px;">Willkommen zur PLZ-Analyse</div>
          <div style="font-size:0.76rem;color:var(--gray-500);line-height:1.6;">
            Wähle oben <strong style="color:var(--gray-700)">ErhebungsID → Jahr → Nummer</strong>
            und klicke auf <strong style="color:var(--red)">Anzeigen</strong>.
          </div>
        </div>
        <div style="background:var(--red-bg);border:1px solid var(--red-border);border-radius:var(--radius-md);padding:8px 11px;font-size:0.74rem;color:var(--gray-600);line-height:1.6;">
          <strong style="color:var(--red);display:block;margin-bottom:3px;">⚡ Schnellstart</strong>
          <ol style="margin:0;padding-left:16px;display:flex;flex-direction:column;gap:2px;">
            <li>ErhebungsID im ersten Dropdown wählen</li>
            <li>Jahr auswählen → Erhebungsnummer auswählen</li>
            <li><strong>Anzeigen</strong> klicken</li>
            <li>PLZ auf Karte oder Tabelle anklicken</li>
          </ol>
        </div>
        <div style="font-size:0.68rem;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:var(--gray-400);margin-top:2px;margin-bottom:2px;">Analyse-Modi</div>
        <div style="display:flex;flex-direction:column;gap:6px;">${modes.map(m => card(...m)).join('')}</div>
        <div style="font-size:0.68rem;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:var(--gray-400);margin-top:2px;margin-bottom:2px;">Werkzeuge</div>
        <div style="display:flex;flex-direction:column;gap:6px;">${tools.map(t => card(...t)).join('')}</div>
        <div style="padding:8px 10px;background:var(--gray-50);border-radius:var(--radius-md);border:1px solid var(--gray-100);font-size:0.7rem;color:var(--gray-500);line-height:1.5;margin-top:2px;">
          💡 <strong style="color:var(--gray-600)">Tipp:</strong> Zoom in die Karte — ab Zoom-Stufe ${LABEL_ZOOM_MIN} werden PLZ-Namen direkt eingeblendet.
        </div>`;
      container.appendChild(guide);
    }

    renderDataTableFromEntries(entries) {
      const container = this.$('table-container');
      if (!container) return;
      container.innerHTML = '';
      container.style.cssText = 'display:flex;flex-direction:column;height:100%;min-height:0;';

      entries = entries.filter(([plz]) => plz !== '00000');
      if (this.plzImRadius && this.plzImRadius.size > 0) {
        entries = entries.filter(([plz]) => this.plzImRadius.has(plz));
      }

      if (!this._activeFilter) { this._renderWelcomeGuide(container); return; }

      if (!entries.length) {
        const empty = document.createElement('div');
        empty.style.cssText = 'padding:24px;text-align:center;color:#adb5bd;font-size:0.85rem;';
        empty.textContent = 'Keine Daten vorhanden';
        container.appendChild(empty);
        const footer = document.createElement('div');
        footer.id = 'streuverlust-box';
        container.appendChild(footer);
        return;
      }

      const scrollWrapper = document.createElement('div');
      scrollWrapper.classList.add('table-scroll');
      const table = document.createElement('table');
      table.style.cssText = 'width:100%;border-collapse:collapse;table-layout:fixed;';

      const isUmsatzMode = this.currentMapMode === 'umsatz-multi' || this.currentMapMode === 'werbeanteil';
      const lastColLabel = isUmsatzMode ? 'Umsatz-\nAnteil' : 'WK (%)';
      const headers = [
        { label: 'PLZ',                    width: '44px' },
        { label: 'Gemeinde',               width: '88px' },
        { label: 'HZ',                     width: '22px' },
        { label: 'Umsatz Brutto\n(hochger.)', width: '58px' },
        { label: lastColLabel,             width: '46px' }
      ];

      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      headers.forEach(({ label, width }, i) => {
        const th = document.createElement('th');
        th.innerHTML = `${escapeHtml(label)} <span class="sort-icon" style="font-size:9px;opacity:0.7"></span>`;
        th.style.width = width;
        th.style.whiteSpace = 'pre-line';
        this._on(th, 'click', () => this.sortTableByColumn(i));
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow); table.appendChild(thead);

      const totalUmsatz = isUmsatzMode
        ? Object.values(this.filteredPLZWerte || {}).reduce((s, v) => s + this.getUmsatzSumForPLZ(v), 0)
        : 0;

      const tbody = document.createElement('tbody');
      const fragment = document.createDocumentFragment();
      const tdBase = 'padding:6px 8px;border-bottom:1px solid #f1f3f5;font-size:0.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

      // Event-Delegation: ein Click-Handler auf tbody statt pro Row
      this._on(tbody, 'click', (ev) => {
        const tr = ev.target.closest('tr');
        if (!tr || !tr.dataset.plz) return;
        const plz = tr.dataset.plz;
        this.closeAllPopups();
        this.highlightMapArea(plz);
        this.openPopupFromTable(plz);
        this.highlightTableRow(tr);
      });

      entries.forEach(([plz, kennwerte], idx) => {
        const tr = document.createElement('tr');
        tr.classList.add('table-row-animated');
        tr.style.animationDelay = `${Math.min(idx * 18, 200)}ms`;
        tr.dataset.plz = plz;

        const note = (this.geoNotes?.[plz] || '').replace(/^\d{4,5}\s*[-–]?\s*/, '').trim() || '—';
        let symbol = '●', symbolColor = '#dee2e6';
        if (kennwerte?.isCritical) { symbol = '▲'; symbolColor = '#f0a500'; }
        else if (kennwerte?.isHZ)  { symbol = '●'; symbolColor = '#33a02c'; }

        let umsatz, lastColVal;
        if (isUmsatzMode) {
          const plzUmsatz = this.getUmsatzSumForPLZ(this.filteredPLZWerte?.[plz] || {});
          umsatz     = plzUmsatz > 0 ? Math.round(plzUmsatz).toLocaleString('de-DE') : '–';
          lastColVal = totalUmsatz > 0 ? (plzUmsatz / totalUmsatz * 100).toFixed(1) + ' %' : '–';
        } else {
          const rawUmsatz = kennwerte['value_hr_n_umsatz_0']?.raw;
          umsatz     = rawUmsatz != null ? Math.round(rawUmsatz).toLocaleString('de-DE') : '–';
          lastColVal = (kennwerte['value_wk_in_percent_0']?.raw?.toFixed(1) ?? '–') + ' %';
        }

        tr.innerHTML = `
          <td style="${tdBase}font-variant-numeric:tabular-nums;font-size:0.78rem;color:#495057;width:${headers[0].width}">${escapeHtml(plz)}</td>
          <td style="${tdBase}color:#6c757d;width:${headers[1].width}">${escapeHtml(note)}</td>
          <td style="${tdBase}text-align:center;width:${headers[2].width}"><span style="color:${symbolColor};font-size:10px">${symbol}</span></td>
          <td style="${tdBase}text-align:right;font-variant-numeric:tabular-nums;width:${headers[3].width}">${escapeHtml(umsatz)}</td>
          <td style="${tdBase}text-align:right;font-variant-numeric:tabular-nums;width:${headers[4].width}">${escapeHtml(lastColVal)}</td>`;

        fragment.appendChild(tr);
      });

      tbody.appendChild(fragment);
      table.appendChild(tbody);
      scrollWrapper.appendChild(table);
      container.appendChild(scrollWrapper);

      const footer = document.createElement('div');
      footer.id = 'streuverlust-box';
      container.appendChild(footer);

      if (this._sortState?.column != null) this.updateSortIcons(this._sortState.column);
      this.updateStreuverlustFooter();

      if (this._activePopupPLZ) {
        const rows = container.querySelectorAll('tbody tr');
        for (const row of rows) {
          if (row.dataset.plz === this._activePopupPLZ) { this.highlightTableRow(row); break; }
        }
      }
    }

    openPopupFromTable(plz) {
      if (!this._layerByPLZ) return;
      const targetLayer = this._layerByPLZ[plz];
      if (!targetLayer) return;
      this.closeAllPopups();
      if (this.currentMapMode === 'umsatz-multi' || this.currentMapMode === 'werbeanteil') {
        const values = this.filteredPLZWerte?.[plz];
        values ? this.showUmsatzPopup(plz, values) : this.showEmptyUmsatzPopup(plz);
        return;
      }
      this.showPopup(targetLayer.feature, this.filteredKennwerte?.[plz] || {});
    }


    // ── Distance-Cache (NL ↔ PLZ-Center, in km) ────────────────────────
    _buildDistanceCache() {
      if (!this._layerByPLZ || !this.nlMarkers?.length) return;

      const nlFingerprint = this.nlMarkers.map(m => m.lat.toFixed(4) + ',' + m.lng.toFixed(4)).join('|');
      if (this._distanceCacheNLKey === nlFingerprint &&
          this._distanceCache && Object.keys(this._distanceCache).length > 0) return;

      this._distanceCacheNLKey = nlFingerprint;
      this._distanceCache = {};
      this._plzCenterCache ||= {};

      const nls = this.nlMarkers.map(m => ({ lat: m.lat, lng: m.lng }));
      const nlLen = nls.length;
      const plzList = Object.keys(this._layerByPLZ);
      const cache = this._distanceCache;
      const centerCache = this._plzCenterCache;
      const layerByPLZ = this._layerByPLZ;
      const R = 6371, toRad = d => d * Math.PI / 180;

      for (let i = 0, len = plzList.length; i < len; i++) {
        const plz = plzList[i];
        if (!centerCache[plz]) {
          const b = layerByPLZ[plz].getBounds();
          centerCache[plz] = {
            lat: (b._southWest.lat + b._northEast.lat) / 2,
            lng: (b._southWest.lng + b._northEast.lng) / 2
          };
        }
        const { lat: lat1, lng: lng1 } = centerCache[plz];
        const rlat1 = toRad(lat1);
        let minDist = Infinity;
        for (let j = 0; j < nlLen; j++) {
          const { lat: lat2, lng: lng2 } = nls[j];
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lng2 - lng1);
          const a = Math.sin(dLat / 2) ** 2 + Math.cos(rlat1) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
          const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          if (d < minDist) minDist = d;
        }
        cache[plz] = minDist;
      }
    }

    applyRadiusFilter(radiusKm) {
      if (!this._layerByPLZ) return;
      if (!this._distanceCache || Object.keys(this._distanceCache).length === 0) this._buildDistanceCache();
      const plzImRadius = new Set();
      const cache = this._distanceCache;
      for (const plz of Object.keys(this._layerByPLZ)) {
        if ((cache[plz] ?? Infinity) <= radiusKm) plzImRadius.add(plz);
      }
      this.plzImRadius = plzImRadius;
      this.prepareUmsatzPLZWerte();
      this.computeWKKennwerte();
      this.computeStreuverlust();
      this.updateGeoLayer();
      this.renderDataTable(this.filteredKennwerte);
      this._rerenderActivePopup();
    }

    // ── Map-Initialisierung + Event-Wiring des Control-Panels ──────────
    initializeMapBase() {
      const mapContainer = this.$('map');
      if (!mapContainer) return;

      this._canvasRenderer = L.canvas({ padding: 0.5 });
      this.map = L.map(mapContainer, {
        preferCanvas: true,
        renderer: this._canvasRenderer,
        zoomAnimation: true,
        markerZoomAnimation: true,
      }).setView([51.2, 12.5], 6);

      // Default-State konsolidiert im Constructor; hier nur LayerGroups
      this.filteredGroup   = L.layerGroup().addTo(this.map);
      this.neighbourGroup  = L.layerGroup().addTo(this.map);
      this.radiusGroup     = L.layerGroup().addTo(this.map);
      this.bestreuungGroup = L.layerGroup().addTo(this.map);
      this.competitorGroup = L.layerGroup().addTo(this.map);

      // Daten-Ready?
      // ACHTUNG: render()-Aufrufe MÜSSEN über _renderInProgress geschützt werden,
      // sonst kann ein paralleler set myDataSource() einen zweiten render() starten.
      const startRender = () => {
        if (this._renderInProgress) return;
        this._fullDataLoaded = false;
        this._renderInProgress = true;
        this.render().finally(() => { this._renderInProgress = false; });
      };
      if (this._pendingRender) {
        this._pendingRender = false;
        if (this._myDataSource?.state === 'success') {
          if (!this._fullDataLoaded) this._bootstrapFromPLZ00000(this._myDataSource.data);
          else                       startRender();
        } else if (this._myDataSource) {
          this._scheduleDataPoll();
        }
      } else if (this._myDataSource?.state === 'success') {
        if (!this._fullDataLoaded) this._bootstrapFromPLZ00000(this._myDataSource.data);
        else                       startRender();
      } else if (this._myDataSource && !this._dataPollTimer) {
        this._scheduleDataPoll();
      }

      this.initRadiusSlider();
      this._wireControlPanel();
    }

    _wireControlPanel() {
      const btnWK      = this.$('btn-wk');
      const btnUmsatz  = this.$('btn-umsatz');
      const panel      = this.$('map-control-panel');
      const umsatzPanel= this.$('umsatz-panel');
      const wkExtra    = this.$('wk-extra');
      const umsatzOptionsRow = this.$('umsatz-options-row');
      const typeSwitch = this.$('umsatz-type-switch');
      const darstSwitch= this.$('umsatz-analysis-switch');
      const btnAbs     = darstSwitch?.querySelector('.mode-abs');
      const btnHH      = darstSwitch?.querySelector('.mode-hh');
      const btnWA      = darstSwitch?.querySelector('.mode-werbeanteil');
      const werbeRow   = this.$('werbe-options-row');
      const chkWerbe   = this.$('chk-werbeumsatz');
      const chkMit     = this.$('chk-mitgekauft');
      const chkBestreu = this.$('chk-bestreuung');
      const chkDoppel          = this.$('chk-doppelbestreuung');
      const chkCompetitorsWK   = this.$('chk-competitors-wk');
      const chkCompetitorsUms  = this.$('chk-competitors-umsatz');

      this.showCritical = !!chkDoppel?.checked;

      // Map-Buttons
      this._on(this.$('map-tile-toggle-btn'), 'click', () => this.toggleMapTiles());
      this._on(this.$('legend-toggle-btn'),   'click', () => this.$('heatmap-legend').classList.toggle('hidden'));
      this._on(this.$('panel-home-btn'),      'click', () => this._resetToHome());
      this._on(this.$('panel-overview-btn'),  'click', () => this.showOverviewPopup());

      const refreshMapAndPopup = () => {
        this._refreshAll();
        this._rerenderActivePopup();
      };

      // WK-Modus
      this._on(btnWK, 'click', () => {
        this.closeAllPopups();
        btnWK.classList.add('active'); btnUmsatz.classList.remove('active');
        this.currentMapMode = 'wk'; 
        wkExtra.style.display = ''; umsatzOptionsRow.classList.add('hidden');
        umsatzPanel.classList.add('hidden');
        panel.classList.remove('panel-large', 'panel-medium', 'panel-auto');
        this.showCritical = chkDoppel.checked;
        this.umsatzDarstellung = 'abs';
        darstSwitch.querySelectorAll('span').forEach(s => s.classList.remove('active'));
        btnAbs.classList.add('active'); btnWA.classList.add('disabled');
        this.bestreuungGroup?.clearLayers();
        this.activeCategories = new Set(CATEGORIES);
        this._shadowRoot.querySelectorAll('.category-toggle').forEach(t => t.classList.add('active'));
        if (this._activeFilter) { this.prepareUmsatzPLZWerte(); this.computeWKKennwerte(); }
        this.updateGeoLayer(); this.updateHeatmapLegend();
        if (this._activeFilter) {
          this.renderDataTable(this.filteredKennwerte);
          this.showOverviewPopup();
          this._rerenderActivePopup();
        }
      });

      // Umsatz-Modus
      this._on(btnUmsatz, 'click', () => {
        typeSwitch.classList.remove('active-right'); typeSwitch.classList.add('active-left');
        btnUmsatz.classList.add('active'); btnWK.classList.remove('active');
        this.closeAllPopups();
        this.currentMapMode = 'umsatz-multi'; 
        if (this._activeFilter) { this.prepareUmsatzPLZWerte(); this.computeWKKennwerte(); }
        wkExtra.style.display = 'none'; umsatzOptionsRow.classList.remove('hidden');
        umsatzPanel.classList.remove('hidden');
        this._syncPanelState();
        this.umsatzDarstellung = 'abs';
        darstSwitch.querySelectorAll('span').forEach(s => s.classList.remove('active'));
        btnAbs.classList.add('active'); btnWA.classList.add('disabled');
        if (!this.showBestreuung) this.bestreuungGroup?.clearLayers();
        this.updateGeoLayer(); this.updateHeatmapLegend();
        if (this._activeFilter) {
          this.renderDataTable(this.filteredKennwerte);
          this.showOverviewPopup();
          this._rerenderActivePopup();
        }
      });

      // Umsatz-Typ (Normal / Werbung)
      this._on(typeSwitch, 'click', () => {
        const switchingToWerbung = this.umsatzMainMode === 'gesamt';
        this.umsatzMainMode = switchingToWerbung ? 'werbung' : 'gesamt';
        typeSwitch.classList.toggle('active-right', switchingToWerbung);
        typeSwitch.classList.toggle('active-left', !switchingToWerbung);
        werbeRow.style.display = switchingToWerbung ? 'flex' : 'none';
        if (switchingToWerbung) {
          btnWA.classList.remove('disabled');
          this.useWerbeUmsatz = true; this.useZusatzUmsatz = false;
          chkWerbe.checked = true;    chkMit.checked = false; chkMit.disabled = false;
        } else {
          btnWA.classList.add('disabled');
          this.umsatzDarstellung = 'abs';
          darstSwitch.querySelectorAll('span').forEach(s => s.classList.remove('active'));
          btnAbs.classList.add('active');
        }
        refreshMapAndPopup();
      });

      this._on(chkWerbe, 'change', () => {
        this.useWerbeUmsatz = chkWerbe.checked;
        if (!this.useWerbeUmsatz && !this.useZusatzUmsatz) { this.useWerbeUmsatz = true; chkWerbe.checked = true; }
        refreshMapAndPopup();
      });
      this._on(chkMit, 'change', () => {
        this.useZusatzUmsatz = chkMit.checked;
        if (!this.useWerbeUmsatz && !this.useZusatzUmsatz) { this.useWerbeUmsatz = true; chkWerbe.checked = true; }
        refreshMapAndPopup();
      });

      // Darstellung
      const setDarst = (modus, mapMode, btn) => {
        this.umsatzDarstellung = modus; this.currentMapMode = mapMode; 
        darstSwitch.querySelectorAll('span').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
      };
      this._on(btnAbs, 'click', () => { setDarst('abs', 'umsatz-multi', btnAbs); refreshMapAndPopup(); });
      this._on(btnHH,  'click', () => { setDarst('hh',  'umsatz-multi', btnHH);  refreshMapAndPopup(); });
      this._on(btnWA,  'click', () => {
        if (this.umsatzMainMode !== 'werbung') return;
        setDarst('werbeanteil', 'werbeanteil', btnWA);
        chkWerbe.checked = true; this.useWerbeUmsatz = true;
        chkMit.checked = false; chkMit.disabled = true; this.useZusatzUmsatz = false;
        refreshMapAndPopup();
      });

      // Kategorien
      this._shadowRoot.querySelectorAll('.category-toggle').forEach(toggle => {
        this._on(toggle, 'click', () => {
          const cat = toggle.dataset.cat;
          if (!cat) return;
          const allActive = CATEGORIES.every(c => this.activeCategories.has(c));
          if (allActive) {
            this.activeCategories = new Set([cat]);
            this._shadowRoot.querySelectorAll('.category-toggle').forEach(t =>
              t.classList.toggle('active', t.dataset.cat === cat));
          } else if (this.activeCategories.has(cat)) {
            this.activeCategories.delete(cat);
            toggle.classList.remove('active');
            if (this.activeCategories.size === 0) {
              this.activeCategories = new Set(CATEGORIES);
              this._shadowRoot.querySelectorAll('.category-toggle').forEach(t => t.classList.add('active'));
            }
          } else {
            this.activeCategories.add(cat);
            toggle.classList.add('active');
          }
          this.currentMapMode = 'umsatz-multi'; 
          refreshMapAndPopup();
        });
      });

      this._on(chkDoppel, 'change', () => {
        this.showCritical = chkDoppel.checked;
        this.updateGeoLayer(); this.updateHeatmapLegend();
        if (this._activeFilter) this.renderDataTable(this.filteredKennwerte);
      });
      this._on(chkBestreu, 'change', () => {
        this.showBestreuung = chkBestreu.checked;
        this.updateBestreuungMarkers(); this.updateHeatmapLegend();
        if (this._activeFilter) this.renderDataTable(this.filteredKennwerte);
      });

      // Mitbewerber: beide Checkboxen spiegeln denselben State
      const onCompetitorChange = (checked) => {
        this.showCompetitors = checked;
        if (chkCompetitorsWK)  chkCompetitorsWK.checked  = checked;
        if (chkCompetitorsUms) chkCompetitorsUms.checked = checked;
        this.updateCompetitorMarkers();
      };
      this._on(chkCompetitorsWK,  'change', () => onCompetitorChange(chkCompetitorsWK.checked));
      this._on(chkCompetitorsUms, 'change', () => onCompetitorChange(chkCompetitorsUms.checked));
    }


    // ── Layer-Styling ──────────────────────────────────────────────────
    applyStyleToLayer(layer) {
      const plz = String(layer.feature?.properties?.plz ?? '').padStart(5, '0');
      const v   = this.filteredPLZWerte?.[plz];
      const hasRadius = this.plzImRadius instanceof Set && this.plzImRadius.size > 0;

      let inRadius;
      if (this.currentMapMode === 'umsatz-multi' || this.currentMapMode === 'werbeanteil') {
        inRadius = !this.useRadiusFilter || !hasRadius || this.plzImRadius.has(plz);
      } else {
        inRadius = !hasRadius || this.plzImRadius.has(plz);
      }

      if (!v || !inRadius) {
        layer.setStyle({ fillColor: '#e9ecef', fillOpacity: 0.35, color: '#ffffff', weight: 0.8 });
        this._removeCriticalMarker(plz);
        return;
      }

      layer.setStyle({
        fillColor: this.computeFillColor(plz),
        fillOpacity: 0.72,
        color: '#ffffff',
        weight: 0.8,
      });

      // Critical-Marker für Doppelbestreuung
      const showCritical = this.currentMapMode === 'wk' && this.showCritical;
      const isCriticalIntern = !!this.filteredKennwerte?.[plz]?.isCritical;
      const isCriticalCross  = !!(this._crossErhebungPLZ?.[plz] &&
                                  Object.keys(this._crossErhebungPLZ[plz]).length > 0);
      const isCritical = isCriticalIntern || isCriticalCross;

      if (!showCritical || !isCritical) { this._removeCriticalMarker(plz); return; }

      if (!this.criticalMarkers[plz]) {
        const center = layer.getBounds().getCenter();
        const icon = L.divIcon({
          html: `<div style="font-size:18px;line-height:1;animation:criticalPulse 1.8s ease-in-out infinite;display:block;transform-origin:center;cursor:pointer;">⚠️</div>`,
          className: '', iconSize: [22, 22], iconAnchor: [11, 11]
        });
        const marker = L.marker(center, { icon, interactive: true, zIndexOffset: 2000 }).addTo(this.map);
        const mapContainer = this._shadowRoot.querySelector('.map-container');
        marker.on('mouseover', (e) => this._showDoppelTooltip(plz, e.originalEvent, mapContainer));
        marker.on('mousemove', (e) => this._moveDoppelTooltip(e.originalEvent, mapContainer));
        marker.on('mouseout',  ()  => this._hideDoppelTooltip());
        this.criticalMarkers[plz] = marker;
      }
    }

    _removeCriticalMarker(plz) {
      const m = this.criticalMarkers?.[plz];
      if (m) { this.map.removeLayer(m); delete this.criticalMarkers[plz]; }
    }

    computeFillColor(plz) {
      const v = this.filteredPLZWerte?.[plz];
      if (!v) return '#cfd4da';
      if (this.currentMapMode === 'wk')           return this.getColor(v.hz ? v.wk : v.wkPot, v.hz);
      if (this.currentMapMode === 'umsatz-multi') return this.getDynamicHeatColor(this.getUmsatzSumForPLZ(v), this._maxValueCache || 1);
      if (this.currentMapMode === 'werbeanteil')  return this.getWerbeAnteilColor(v.werbeAnteil ?? 0);
      return '#cfd4da';
    }

    computeMaxValue() {
      const plzWerte = this.filteredPLZWerte || {};
      let maxValue = 0;
      if (this.currentMapMode === 'wk') {
        for (const v of Object.values(plzWerte)) {
          const val = v.hz ? v.wk : v.wkPot;
          if (Number.isFinite(val) && val > maxValue) maxValue = val;
        }
      } else if (this.currentMapMode === 'umsatz-multi') {
        for (const v of Object.values(plzWerte)) {
          const sum = this.getUmsatzSumForPLZ(v);
          if (sum > maxValue) maxValue = sum;
        }
      } else if (this.currentMapMode === 'werbeanteil') {
        this._maxValueCache = 1; return 1;
      }
      this._maxValueCache = maxValue || 1;
      return this._maxValueCache;
    }

    getColor(value, isHZ) {
      const v = typeof value === 'number' && !isNaN(value) ? value : 0;
      if (isHZ) return v > 25 ? '#e31a1c' : v > 15 ? '#fd8d3c' : v > 10 ? '#ffffb2' : v > 5 ? '#78c679' : v > 2 ? '#41ab5d' : v > 0 ? '#006837' : '#cfd4da';
      return v > 50 ? '#cfd4da' : v > 25 ? '#bdbdbd' : v > 15 ? '#969696' : v > 10 ? '#6baed6' : v > 5 ? '#2171b5' : v > 0 ? '#08306b' : '#cfd4da';
    }
    getDynamicHeatColor(value, max) {
      value = Number(value); max = Number(max);
      if (!Number.isFinite(value) || value <= 0 || !Number.isFinite(max) || max <= 0) return '#cfd4da';
      const r = value / max;
      return r > .95 ? '#7a0f17' : r > .85 ? '#9d131b' : r > .75 ? '#b41821' : r > .65 ? '#d9483b' :
             r > .55 ? '#e96a3a' : r > .45 ? '#f08a3c' : r > .35 ? '#f6b65b' : r > .20 ? '#f7d77a' : '#fce9b2';
    }
    getWerbeAnteilColor(ratio) {
      if (!Number.isFinite(ratio) || ratio <= 0) return '#cfd4da';
      return ratio > .80 ? '#7a0f17' : ratio > .60 ? '#b41821' : ratio > .40 ? '#e96a3a' :
             ratio > .20 ? '#f6b65b' : ratio > .10 ? '#f7d77a' : '#fce9b2';
    }

    updateGeoLayer() {
      if (!this._geoLayer) return;
      this.computeMaxValue();
      if (this.currentMapMode === 'wk' && this.showCritical) this._computeCrossErhebungDoppel();

      this._triggerSweepAnimation();
      if (this._layerByPLZ) {
        for (const plz of Object.keys(this._layerByPLZ)) this.applyStyleToLayer(this._layerByPLZ[plz]);
      } else {
        this._geoLayer.eachLayer(layer => this.applyStyleToLayer(layer));
      }
      this.updateBestreuungMarkers();
      this.updateHeatmapLegend();

      if (this._highlightedPLZ) {
        const layer = this._layerByPLZ?.[this._highlightedPLZ];
        if (layer) layer.setStyle({ weight: 3, color: '#f0a500', fillOpacity: layer.options.fillOpacity });
      }
    }

    _triggerSweepAnimation() {
      if (!this._geoLayer) return;
      const container = this._geoLayer.getPane?.() || this._geoLayer._map?.getPanes?.()?.overlayPane;
      if (!container) return;
      container.style.transition = 'opacity 0.05s';
      container.style.opacity = '0.1';
      requestAnimationFrame(() => {
        this._setTimeout(() => {
          container.style.transition = 'opacity 0.35s var(--ease-out)';
          container.style.opacity = '1';
        }, 50);
      });
    }

    updateBestreuungMarkers() {
      this.bestreuungGroup.clearLayers();
      if (this.currentMapMode === 'wk') return;
      if (!this.showBestreuung || !this._layerByPLZ) return;
      for (const plz of Object.keys(this._layerByPLZ)) {
        const daten = this.filteredKennwerte?.[plz];
        if (!daten?.isHZ) continue;
        const layer = this._layerByPLZ[plz];
        const pulseLayer = L.geoJSON(layer.feature, {
          renderer: this._canvasRenderer,
          style: {
            fillColor: 'transparent', fill: false,
            color: '#1565c0', weight: 2.5, opacity: 0.85,
            dashArray: '6 3', className: 'bestreuung-pulse-path'
          },
          interactive: false
        });
        this.bestreuungGroup.addLayer(pulseLayer);
      }
    }

    // ── Mitbewerber-Marker (Hornbach + künftig weitere Brands) ─────────
    updateCompetitorMarkers() {
      if (!this.competitorGroup) return;
      this.competitorGroup.clearLayers();
      if (!this.showCompetitors) return;
      if (!this._competitorData?.length) return;

      // Aktive NL-Koordinaten sammeln (nur die, die gerade selektiert sind)
      const activeNLCoords = [];
      const selNLs = this._selectedNLs;
      const allSelected = !selNLs || selNLs.size === 0 ||
                          selNLs.size === (this.allNLs?.length ?? 0);
      for (const [nl, coords] of Object.entries(this.nlKoordinaten || {})) {
        if (!allSelected && !selNLs.has(nl)) continue;
        activeNLCoords.push({ lat: coords.lat, lon: coords.lon });
      }
      if (activeNLCoords.length === 0) return;

      const RADIUS_KM = 100;
      const toRad = d => d * Math.PI / 180;
      const haversine = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };

      // Brand-spezifische Icon-Definitionen
      const brandConfig = {
        Hornbach: { color: '#f26522', emoji: '🔨', size: 32 },
        OBI:      { color: '#f5a800', emoji: '🪣', size: 32 },
        Globus:   { color: '#0066b2', emoji: '🌐', size: 32 },
      };
      const defaultConfig = { color: '#888', emoji: '🏪', size: 32 };

      for (const comp of this._competitorData) {
        const { brand, name, lat, lon } = comp;
        if (typeof lat !== 'number' || typeof lon !== 'number') continue;

        // Minimale Distanz zu einer aktiven NL berechnen
        let minDist = Infinity;
        for (const nl of activeNLCoords) {
          const d = haversine(nl.lat, nl.lon, lat, lon);
          if (d < minDist) minDist = d;
        }
        if (minDist > RADIUS_KM) continue;

        const cfg = brandConfig[brand] ?? defaultConfig;
        const distLabel = minDist < 999 ? `${Math.round(minDist)} km zur nächsten NL` : '';

        const icon = L.divIcon({
          html: `<div style="
            width:${cfg.size}px; height:${cfg.size}px;
            background:${cfg.color};
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:-1px 2px 6px rgba(0,0,0,0.35);
            display:flex; align-items:center; justify-content:center;
            border:2px solid rgba(255,255,255,0.7);
          "><span style="transform:rotate(45deg);font-size:14px;line-height:1">${cfg.emoji}</span></div>`,
          className: '',
          iconSize:   [0, 0],
          iconAnchor: [0, 0],
        });

        const marker = L.marker([lat, lon], { icon, interactive: true, zIndexOffset: 800 });
        marker.bindTooltip(
          `<strong style="color:${cfg.color}">${escapeHtml(brand)}</strong><br>
           ${escapeHtml(name)}<br>
           <span style="font-size:0.85em;color:#666">${escapeHtml(distLabel)}</span>`,
          { direction: 'top', offset: [0, -cfg.size / 2], className: 'competitor-tooltip' }
        );
        this.competitorGroup.addLayer(marker);
      }
    }

    initializeMapTiles() {
      if (!this.map) return;
      this._tileLayer = L.tileLayer(OSM_TILES, {
        attribution: '© OpenStreetMap', maxZoom: 19
      }).addTo(this.map);
    }
    removeMapTiles() {
      if (this.map && this._tileLayer) { this.map.removeLayer(this._tileLayer); this._tileLayer = null; }
    }
    toggleMapTiles() {
      if (this._tilesVisible) { this.removeMapTiles();     this._tilesVisible = false; }
      else                     { this.initializeMapTiles(); this._tilesVisible = true;  }
    }

    // ── Niederlassungen / Marker ───────────────────────────────────────
    createAllMarkers() {
      if (!this.filteredGroup) return;
      this.filteredGroup.clearLayers();
      this.neighbourGroup?.clearLayers();
      this.radiusGroup?.clearLayers();
      this.allMarkers = []; this.nlMarkers = [];
      if (!this.Niederlassung || !this.nlKoordinaten) return;

      const seen = new Set();
      for (const [nlKey, nlName] of Object.entries(this.Niederlassung)) {
        const coords = this.nlKoordinaten[nlKey];
        if (!coords || seen.has(nlKey)) continue;
        const marker = L.marker([coords.lat, coords.lon], {
          icon: this.createMarkerIcon(nlName),
          title: nlName,
          plzs: [nlKey]
        });
        marker.setZIndexOffset(1000);
        marker.on('click', () => this.toggleNLSelection(nlKey));
        this.allMarkers.push(marker);
        this.filteredGroup.addLayer(marker);
        this.nlMarkers.push({ lat: coords.lat, lng: coords.lon, marker });
        seen.add(nlKey);
      }
      if (Array.isArray(this.extraNLs)) {
        for (const { nl, lat, lon } of this.extraNLs) {
          const marker = L.marker([lat, lon], {
            icon: this.createMarkerIcon(nl), title: nl, plzs: [nl]
          });
          marker.setZIndexOffset(1000);
          marker.on('click', () => this.toggleNLSelection(nl));
          this.allMarkers.push(marker);
          this.filteredGroup.addLayer(marker);
          this.nlMarkers.push({ lat, lng: lon, marker });
        }
      }
      this.allNLs = [...Object.keys(this.Niederlassung), ...(this.extraNLs?.map(e => e.nl) ?? [])];
      this._selectedNLs = new Set(this.allNLs);
      this._nlSelectionInitialized = false;

      this.applyNLFilter([...this._selectedNLs]);
      this.updateMarkers();
      this._buildDistanceCache();
      const radius = Number(this.$('radius-slider')?.value ?? 0);
      // applyRadiusFilter ruft intern updateGeoLayer auf — kein extra-Aufruf nötig
      this.applyRadiusFilter(radius);
      this.updateCompetitorMarkers();
      this.updateNLSelectionUI?.();
    }

    applyNLFilter(selectedNLs) {
      this._selectedNLs = new Set(selectedNLs);
      if (!this.filteredData || this.filteredData.length === 0) return;
      const plzSet = new Set();
      const selNLs = this._selectedNLs;
      const data = this.filteredData;
      for (let i = 0, len = data.length; i < len; i++) {
        const row = data[i];
        const nl  = row['dimension_niederlassung_0']?.id?.trim();
        if (selNLs.size > 0 && !selNLs.has(nl)) continue;
        const plz = this._normalizePLZ(row['dimension_plz_0']?.id);
        if (plz) plzSet.add(plz);
      }
      this.filteredPLZs = [...plzSet];
      this.computeWKKennwerte();
    }

    createMarkerIcon(nl, isPhantom = false) {
      const key = nl + (isPhantom ? '_phantom' : '_active');
      if (!this.iconCache[key]) {
        const color  = isPhantom ? '#8c9099' : '#b41821';
        const border = isPhantom ? '1.5px solid rgba(60,60,80,0.4)' : 'none';
        const shadow = isPhantom ? '-1px 2px 4px rgba(0,0,0,0.25)' : '-1px 2px 6px rgba(180,24,33,0.4)';
        const opacity = isPhantom ? 0.75 : 1;
        const markerHtml = `<div style="width:30px;height:30px;background-color:${color};opacity:${opacity};border-radius:50% 50% 50% 0;box-shadow:${shadow};transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:white;font-family:system-ui;border:${border};"><div style="transform:rotate(45deg)">${escapeHtml(nl)}</div></div>`;
        this.iconCache[key] = L.divIcon({ html: markerHtml, className: '', iconSize: [30, 30], iconAnchor: [15, 30] });
      }
      return this.iconCache[key];
    }

    updateMarkers() {
      if (!this.filteredGroup || !this.allMarkers) return;
      this.filteredGroup.clearLayers();
      const data = this.filteredData || [];
      if (!data.length) return;

      const erhNLs = new Set();
      for (const row of data) {
        const nl = row['dimension_niederlassung_0']?.id?.trim();
        if (nl) erhNLs.add(nl);
      }
      const activeMarkers = [];
      for (const marker of this.allMarkers) {
        const nl = marker.options.plzs?.[0];
        if (!nl || !erhNLs.has(nl)) continue;
        this.filteredGroup.addLayer(marker);

        const isSelected = !this._selectedNLs?.size || this._selectedNLs.has(nl);
        marker.setIcon(this.createMarkerIcon(nl, !isSelected));
        // Alte Handler abhängen (z.B. von vorigem updateMarkers)
        marker.off('mouseover'); marker.off('mouseout');
        marker.on('mouseover', () => {
          const el = marker.getElement();
          if (el) { el.style.filter = 'brightness(1.2)'; el.style.zIndex = '10000'; }
        });
        marker.on('mouseout', () => {
          const el = marker.getElement();
          if (el) { el.style.filter = ''; el.style.zIndex = ''; }
        });
        if (isSelected) { marker.setZIndexOffset(1000); activeMarkers.push(marker); }
        else            { marker.setZIndexOffset(100); }
      }
      this.nlMarkers = activeMarkers.map(m => ({ lat: m.getLatLng().lat, lng: m.getLatLng().lng, marker: m }));
    }

    toggleNLSelection(nl) {
      if (!this._selectedNLs) this._selectedNLs = new Set();
      const allCount = this.allNLs?.length || 0;
      if (this._selectedNLs.size === allCount) {
        this._selectedNLs = new Set([nl]);
      } else if (this._selectedNLs.has(nl)) {
        this._selectedNLs.delete(nl);
        if (this._selectedNLs.size === 0) this._selectedNLs = new Set(this.allNLs);
      } else {
        this._selectedNLs.add(nl);
        if (this._selectedNLs.size === allCount) this._selectedNLs = new Set(this.allNLs);
      }
      this.updateNLSelectionUI();
      this.updateMarkers();
      this._distanceCacheNLKey = null;
      this._buildDistanceCache();
      // applyRadiusFilter ruft intern prepareUmsatzPLZWerte, computeWKKennwerte,
      // computeStreuverlust, updateGeoLayer, renderDataTable, _rerenderActivePopup auf
      const radius = Number(this.$('radius-slider').value);
      this.applyRadiusFilter(radius);
      this.updateCompetitorMarkers();
      // Nach NL-Wechsel immer Overview zeigen (überschreibt ggf. _rerenderActivePopup)
      this.showOverviewPopup();
    }

    initRadiusSlider() {
      const slider     = this.$('radius-slider');
      const valueLabel = this.$('radius-value');
      if (!slider) return;
      valueLabel.textContent = slider.value;
      const updateFill = () => {
        const min = +slider.min, max = +slider.max, val = +slider.value;
        const pct = ((val - min) / (max - min)) * 100;
        slider.style.background = `linear-gradient(90deg, var(--red) ${pct}%, var(--gray-200) ${pct}%)`;
      };
      updateFill();
      let debounceTimer = null;
      this._on(slider, 'input', () => {
        const radius = Number(slider.value);
        valueLabel.textContent = radius; updateFill();
        // Vorherigen Debounce-Timer aus beiden Stellen entfernen
        if (debounceTimer != null) {
          clearTimeout(debounceTimer);
          this._timers.delete(debounceTimer);
          debounceTimer = null;
        }
        debounceTimer = this._setTimeout(() => {
          debounceTimer = null;
          this.applyRadiusFilter(radius);
          if (this._activeFilter) this.showOverviewPopup();
        }, 80);
      });
    }


    // ── Side-Popups ────────────────────────────────────────────────────
    _onClosePopup(popup, { clearHighlight = true } = {}) {
      popup.classList.remove('show'); popup.classList.add('hidden');
      this._activePopupPLZ = null; this._activePopupType = null;
      if (clearHighlight && this._highlightedPLZ) {
        const l = this._layerByPLZ?.[this._highlightedPLZ];
        if (l) this.applyStyleToLayer(l);
        this._highlightedPLZ = null;
      }
      this._syncPanelState();
    }

    showPopup(feature, daten) {
      const plz  = String(feature.properties?.plz ?? '').padStart(5, '0').trim();
      const note = feature.properties?.note || 'Keine Notiz';
      this._activePopupPLZ = plz; this._activePopupType = 'wk';

      // Andere Popups schließen
      for (const id of ['side-popup-umsatz', 'side-popup-overview']) {
        const el = this.$(id);
        if (el) { el.classList.remove('show'); el.classList.add('hidden'); }
      }
      this._syncPanelState();

      const umsatz = this.filteredPLZWerte?.[plz] || {};
      let symbol = '📍';
      if (daten?.isCritical) symbol = '⚠️'; else if (daten?.isHZ) symbol = '✅';

      const beschreibungen = {
        value_hr_n_umsatz_0:      'Umsatz Brutto (hochgerechnet)',
        value_umsatz_p_hh_0:      'Umsatz p. HH',
        value_wk_in_percent_0:    'Werbekosten (%)',
        value_wk_nachbar_0:       'WK (%) inkl. Nachb.',
        value_hz_kosten_0:        'HZ-Werbekosten',
        value_werbeverweigerer_0: 'Werbeverweigerer (%)',
        value_haushalte_0:        'Haushalte',
        value_kaufkraft_0:        'BM-Kaufkraft-Idx',
        value_ums_erhebung_0:     'Umsatz',
        value_kd_erhebung_0:      'Anzahl Kunden',
        value_bon_erhebung_0:     'Ø-Bon',
        value_auflage_0:          'Auflage'
      };

      // Lokale Kopie — nie filteredKennwerte direkt mutieren
      const d = { ...daten };
      d.value_umsatz_p_hh_0 = { raw: umsatz.umsatzProHaushalt ?? 0 };
      d.value_haushalte_0   = { raw: umsatz.haushalte ?? 0 };
      d.value_kaufkraft_0   = { raw: umsatz.kaufkraftIndex ?? 0 };
      const kd = d.value_kd_erhebung_0?.raw ?? 0;
      const ue = d.value_ums_erhebung_0?.raw ?? 0;
      d.value_bon_erhebung_0 = { raw: kd > 0 ? Number((ue / kd).toFixed(2)) : 0 };

      // Felder die als ganze Euro-Beträge angezeigt werden sollen
      const euroFields = new Set([
        'value_hr_n_umsatz_0', 'value_hz_kosten_0', 'value_ums_erhebung_0',
        'value_hz_potentiell_0', 'value_wk_potentiell_0'
      ]);
      // Pro-HH-Felder: 2 Nachkommastellen
      const hhFields = new Set(['value_umsatz_p_hh_0']);

      let rowsHtml = '';
      Object.entries(beschreibungen).forEach(([id, label], idx) => {
        const raw = d?.[id]?.raw;
        let wert;
        if (typeof raw !== 'number') {
          wert = '–';
        } else if (euroFields.has(id)) {
          wert = Math.round(raw).toLocaleString('de-DE');
        } else if (hhFields.has(id)) {
          wert = Number(raw).toFixed(2).replace('.', ',');
        } else {
          wert = raw.toLocaleString('de-DE');
        }
        if (idx === 8) rowsHtml += `<tr><td colspan="2" class="section-title">Erhebungsdaten</td></tr>`;
        rowsHtml += `<tr><td class="label-cell">${escapeHtml(label)}</td><td class="value-cell">${escapeHtml(wert)}</td></tr>`;
      });

      const popup = this.$('side-popup');
      popup.innerHTML = `
        <div class="popup-header-strip">
          <span class="detail-badge">PLZ-Detail</span>
          <div class="popup-title" title="${escapeHtml(note)}">${symbol} ${escapeHtml(note)}</div>
          <div class="popup-location">PLZ ${escapeHtml(plz)}</div>
          <button class="close-btn" type="button">✕</button>
        </div>
        <table>
          <thead><tr><th colspan="2" class="subtitle-cell">Hochrechnung Jahr</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>`;
      popup.classList.remove('hidden'); void popup.offsetWidth; popup.classList.add('show');
      this._on(popup.querySelector('.close-btn'), 'click', () => this._onClosePopup(popup));
    }

    showUmsatzPopup(plz, values) {
      const popup = this.$('side-popup-umsatz');
      for (const id of ['side-popup', 'side-popup-overview']) {
        const el = this.$(id);
        if (el) { el.classList.remove('show'); el.classList.add('hidden'); }
      }
      this._activePopupPLZ = plz; this._activePopupType = 'umsatz';
      this._syncPanelState();

      const isWerbung = this.umsatzMainMode === 'werbung';
      const useWerbe  = this.useWerbeUmsatz === true;
      const useZusatz = this.useZusatzUmsatz === true;
      const note = this.geoNotes?.[plz] || plz;

      const pick = (base, werb, zusatz, baseHH, werbHH, zusatzHH) => {
        if (!isWerbung) return { abs: base, hh: baseHH };
        let abs = 0, hh = 0;
        if (useWerbe)  { abs += werb;   hh += werbHH;  }
        if (useZusatz) { abs += zusatz; hh += zusatzHH; }
        return { abs, hh };
      };

      const st = pick(values.umsatz,     values.umsatzWerbung,     values.umsatzZusatz,     values.umsatzProHaushalt,     values.umsatzWerbungProHaushalt,     values.umsatzZusatzProHaushalt);
      const pc = pick(values.pluscard,   values.pluscardWerbung,   values.pluscardZusatz,   values.pluscardProHaushalt,   values.pluscardWerbungProHaushalt,   values.pluscardZusatzProHaushalt);
      const ra = pick(values.ra,         values.raWerbung,         values.raZusatz,         values.raProHaushalt,         values.raWerbungProHaushalt,         values.raZusatzProHaushalt);
      const os = pick(values.onlineshop, values.onlineshopWerbung, values.onlineshopZusatz, values.onlineshopProHaushalt, values.onlineshopWerbungProHaushalt, values.onlineshopZusatzProHaushalt);

      const active = {
        stationaer: this.activeCategories.has('stationaer'),
        pluscard:   this.activeCategories.has('pluscard'),
        ra:         this.activeCategories.has('ra'),
        online:     this.activeCategories.has('online'),
      };
      const totalAbs = (active.stationaer?st.abs:0)+(active.pluscard?pc.abs:0)+(active.ra?ra.abs:0)+(active.online?os.abs:0);
      const totalHH  = (active.stationaer?st.hh :0)+(active.pluscard?pc.hh :0)+(active.ra?ra.hh :0)+(active.online?os.hh :0);

      const tN = values.umsatz        + values.pluscard        + values.ra        + values.onlineshop;
      const tW = values.umsatzWerbung  + values.pluscardWerbung + values.raWerbung + values.onlineshopWerbung;
      const tZ = values.umsatzZusatz   + values.pluscardZusatz  + values.raZusatz  + values.onlineshopZusatz;
      const antWA = tN > 0 ? ((tW / tN) * 100).toFixed(1) : '–';

      const pct = (x, t) => t > 0 ? (x / t) * 100 : 0;
      const hl = !isWerbung ? 'Gesamtumsatz'
               : useWerbe && useZusatz ? 'Werbeumsatz + Mitgekauft'
               : useWerbe ? 'Werbeumsatz' : 'Mitgekauft';
      const dis = (key) => !active[key] ? 'opacity:0.3;filter:grayscale(1)' : '';

      popup.innerHTML = `
        <div class="popup-header">
          <div style="overflow:hidden;min-width:0">
            <span class="detail-badge">PLZ-Detail</span>
            <div title="${escapeHtml(note)}" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.97rem;font-weight:700;">${escapeHtml(note)}</div>
            <div style="font-size:0.68rem;opacity:0.75;font-weight:500;margin-top:2px;letter-spacing:.04em;">PLZ ${escapeHtml(plz)}</div>
          </div>
          <button class="close-btn" type="button">✕</button>
        </div>
        <div style="overflow-y:auto;flex:1;min-height:0;">
          <div class="umsatz-subheader">
            <span class="strong">${escapeHtml(hl)}: ${fmtNum(totalAbs)} €</span><br>
            <span style="font-size:0.78rem;color:var(--gray-500)">${fmtDec(totalHH)} € / HH &nbsp;·&nbsp; Werbeanteil: ${escapeHtml(antWA)} %</span>
          </div>
          <div class="umsatz-bar" style="margin:8px 14px 2px">
            <div style="background:var(--red);width:${pct(tN,tN+tW+tZ)}%"></div>
            <div style="background:#1f78b4;width:${pct(tW,tN+tW+tZ)}%"></div>
            <div style="background:#ffb000;width:${pct(tZ,tN+tW+tZ)}%"></div>
          </div>
          <div class="umsatz-legend" style="padding:2px 14px 8px">
            <span><span style="color:var(--red)">⬤</span> Normal</span>
            <span><span style="color:#1f78b4">⬤</span> Werbung</span>
            <span><span style="color:#ffb000">⬤</span> Mitgekauft</span>
          </div>

          <div class="section-title">Nach Kategorien</div>
          <div class="umsatz-grid" style="padding:6px 14px">
            <div class="label" style="font-weight:700;color:var(--gray-800)">Kategorie</div>
            <div class="value" style="font-weight:700;color:var(--gray-800)">Absolut</div>
            <div class="value" style="font-weight:700;color:var(--gray-800)">/ HH</div>
            <div class="label" style="${dis('stationaer')}">🏬 Stationär</div>
            <div class="value" style="${dis('stationaer')}">${fmtNum(st.abs)} €</div>
            <div class="value" style="${dis('stationaer')}">${fmtDec(st.hh)} €</div>
            <div class="label" style="${dis('pluscard')}">💳 Pluscard</div>
            <div class="value" style="${dis('pluscard')}">${fmtNum(pc.abs)} €</div>
            <div class="value" style="${dis('pluscard')}">${fmtDec(pc.hh)} €</div>
            <div class="label" style="${dis('ra')}">📦 R&amp;A</div>
            <div class="value" style="${dis('ra')}">${fmtNum(ra.abs)} €</div>
            <div class="value" style="${dis('ra')}">${fmtDec(ra.hh)} €</div>
            <div class="label" style="${dis('online')}">🛒 KUBE OS</div>
            <div class="value" style="${dis('online')}">${fmtNum(os.abs)} €</div>
            <div class="value" style="${dis('online')}">${fmtDec(os.hh)} €</div>
          </div>

          <div class="section-title">Umsatzanteile (Gesamt)</div>
          <div class="umsatz-bar" style="margin:8px 14px 2px">
            <div class="share-stationaer" style="width:${pct(values.umsatz,tN)}%"></div>
            <div class="share-pluscard"   style="width:${pct(values.pluscard,tN)}%"></div>
            <div class="share-ra"         style="width:${pct(values.ra,tN)}%"></div>
            <div class="share-online"     style="width:${pct(values.onlineshop,tN)}%"></div>
          </div>
          <div class="umsatz-legend" style="padding:2px 14px 8px">
            <span><span style="color:var(--red)">⬤</span> Stationär</span>
            <span><span style="color:#1f78b4">⬤</span> Pluscard</span>
            <span><span style="color:#33a02c">⬤</span> R&amp;A</span>
            <span><span style="color:#ffb000">⬤</span> KUBE OS</span>
          </div>

          <div class="section-title">PLZ-Daten</div>
          <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:3px 10px;padding:8px 14px 14px;font-size:0.82rem;">
            <div style="color:var(--gray-600);font-weight:500">Haushalte</div>
            <div style="text-align:right;font-weight:700;color:var(--gray-800)">${fmtNum(values.haushalte)}</div>
            <div style="color:var(--gray-600);font-weight:500">Werbeverweigerer</div>
            <div style="text-align:right;font-weight:700;color:var(--gray-800)">${values.werbeverweigerer > 0 ? fmtNum(values.werbeverweigerer) + ' %' : '–'}</div>
            <div style="color:var(--gray-600);font-weight:500">Kaufkraft-Index</div>
            <div style="text-align:right;font-weight:700;color:var(--gray-800)">${values.kaufkraftIndex > 0 ? fmtNum(values.kaufkraftIndex) : '–'}</div>
          </div>
        </div>`;

      popup.classList.remove('hidden'); void popup.offsetWidth; popup.classList.add('show');
      this._on(popup.querySelector('.close-btn'), 'click', () => this._onClosePopup(popup));
    }

    showEmptyUmsatzPopup(plz) {
      const popup = this.$('side-popup-umsatz');
      if (!popup) return;
      const note = this.geoNotes?.[plz] || '—';
      this._activePopupPLZ = plz; this._activePopupType = 'umsatz';

      popup.innerHTML = `
        <div class="popup-header">
          <div style="overflow:hidden;min-width:0">
            <span class="detail-badge">PLZ-Detail</span>
            <div title="${escapeHtml(note)}" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.97rem;font-weight:700;">${escapeHtml(note)}</div>
            <div style="font-size:0.68rem;opacity:0.75;font-weight:500;margin-top:2px;letter-spacing:.04em;">PLZ ${escapeHtml(plz)}</div>
          </div>
          <button class="close-btn" type="button">✕</button>
        </div>
        <div style="padding:20px 14px;text-align:center;color:#adb5bd;font-size:0.85rem">
          <div style="font-size:2rem;margin-bottom:8px;opacity:.4">📭</div>
          Keine Umsatzdaten für PLZ ${escapeHtml(plz)}
        </div>`;
      popup.classList.remove('hidden'); void popup.offsetWidth; popup.classList.add('show');
      this._on(popup.querySelector('.close-btn'), 'click',
        () => this._onClosePopup(popup, { clearHighlight: false }));
    }

    showOverviewPopup() {
      if (!this._activeFilter) return;
      const popup = this.$('side-popup-overview');
      if (!popup) return;

      for (const id of ['side-popup', 'side-popup-umsatz']) {
        const el = this.$(id);
        if (el) { el.classList.remove('show'); el.classList.add('hidden'); }
      }
      if (this._highlightedPLZ) {
        const l = this._layerByPLZ?.[this._highlightedPLZ];
        if (l) this.applyStyleToLayer(l);
        this._highlightedPLZ = null;
      }
      this._activePopupPLZ = '__overview__'; this._activePopupType = 'overview';

      const { erhID } = this._activeFilter || {};
      const selNLs = this._selectedNLs;
      const allNLs = this.allNLs || [];
      let headerTitle = this._fmtGF(erhID) || 'Übersicht';
      if (selNLs?.size > 0 && selNLs.size < allNLs.length) headerTitle = [...selNLs].join(', ');

      this._syncPanelState();

      const isWerbung = this.umsatzMainMode === 'werbung';
      const useWerbe  = this.useWerbeUmsatz === true;
      const useZusatz = this.useZusatzUmsatz === true;

      const aggKeys = ['umsatz','ra','onlineshop','pluscard',
        'umsatzWerbung','raWerbung','onlineshopWerbung','pluscardWerbung',
        'umsatzZusatz','raZusatz','onlineshopZusatz','pluscardZusatz',
        'umsatzErhebung','haushalte',
        'umsatzProHaushalt','raProHaushalt','onlineshopProHaushalt','pluscardProHaushalt',
        'umsatzWerbungProHaushalt','raWerbungProHaushalt','onlineshopWerbungProHaushalt','pluscardWerbungProHaushalt',
        'umsatzZusatzProHaushalt','raZusatzProHaushalt','onlineshopZusatzProHaushalt','pluscardZusatzProHaushalt'];
      const agg = Object.fromEntries(aggKeys.map(k => [k, 0]));
      let totalUmsatzHR = 0, totalHZKosten = 0, totalHaushalteWK = 0, plzCount = 0;

      const radius = this.plzImRadius;
      const hasRadius = radius && radius.size > 0;
      for (const [plz, v] of Object.entries(this.filteredPLZWerte || {})) {
        if (hasRadius && !radius.has(plz)) continue;
        for (const key of aggKeys) agg[key] += v[key] || 0;
      }
      for (const [plz, k] of Object.entries(this.filteredKennwerte || {})) {
        if (hasRadius && !radius.has(plz)) continue;
        totalUmsatzHR    += k['value_hr_n_umsatz_0']?.raw ?? 0;
        totalHZKosten    += k['value_hz_kosten_0']?.raw   ?? 0;
        totalHaushalteWK += this.filteredPLZWerte?.[plz]?.haushalte ?? 0;
        plzCount++;
      }

      const pick = (base, werb, zusatz, baseHH, werbHH, zusatzHH) => {
        if (!isWerbung) return { abs: base, hh: baseHH };
        let abs = 0, hh = 0;
        if (useWerbe)  { abs += werb;   hh += werbHH;  }
        if (useZusatz) { abs += zusatz; hh += zusatzHH; }
        return { abs, hh };
      };
      const st = pick(agg.umsatz,    agg.umsatzWerbung,    agg.umsatzZusatz,    agg.umsatzProHaushalt,    agg.umsatzWerbungProHaushalt,    agg.umsatzZusatzProHaushalt);
      const pc = pick(agg.pluscard,  agg.pluscardWerbung,  agg.pluscardZusatz,  agg.pluscardProHaushalt,  agg.pluscardWerbungProHaushalt,  agg.pluscardZusatzProHaushalt);
      const ra = pick(agg.ra,        agg.raWerbung,        agg.raZusatz,        agg.raProHaushalt,        agg.raWerbungProHaushalt,        agg.raZusatzProHaushalt);
      const os = pick(agg.onlineshop,agg.onlineshopWerbung,agg.onlineshopZusatz,agg.onlineshopProHaushalt,agg.onlineshopWerbungProHaushalt,agg.onlineshopZusatzProHaushalt);

      const active = {
        stationaer: this.activeCategories.has('stationaer'),
        pluscard:   this.activeCategories.has('pluscard'),
        ra:         this.activeCategories.has('ra'),
        online:     this.activeCategories.has('online'),
      };
      const totalAbs = (active.stationaer?st.abs:0)+(active.pluscard?pc.abs:0)+(active.ra?ra.abs:0)+(active.online?os.abs:0);
      const totalHH  = (active.stationaer?st.hh :0)+(active.pluscard?pc.hh :0)+(active.ra?ra.hh :0)+(active.online?os.hh :0);
      const tN = agg.umsatz + agg.pluscard + agg.ra + agg.onlineshop;
      const tW = agg.umsatzWerbung + agg.pluscardWerbung + agg.raWerbung + agg.onlineshopWerbung;
      const tZ = agg.umsatzZusatz  + agg.pluscardZusatz  + agg.raZusatz  + agg.onlineshopZusatz;
      const antWA = tN > 0 ? ((tW / tN) * 100).toFixed(1) : '–';

      const pct = (x, t) => t > 0 ? (x / t) * 100 : 0;
      const dis = (k) => !active[k] ? 'opacity:0.3;filter:grayscale(1)' : '';
      const hl = !isWerbung ? 'Gesamtumsatz'
               : useWerbe && useZusatz ? 'Werbeumsatz + Mitgekauft'
               : useWerbe ? 'Werbeumsatz' : 'Mitgekauft';

      popup.innerHTML = `
        <div class="popup-header">
          <div style="overflow:hidden;min-width:0">
            <span class="overview-badge">Gesamt</span>
            <div style="font-size:0.97rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:6px" title="${escapeHtml(headerTitle)}">
              ${escapeHtml(headerTitle)}
            </div>
            <div style="font-size:0.68rem;opacity:0.75;font-weight:500;margin-top:2px;">
              Aggregiert über ${plzCount} PLZ${plzCount === 1 ? '' : 's'}
            </div>
          </div>
          <button class="close-btn" type="button">✕</button>
        </div>
        <div style="overflow-y:auto;flex:1;min-height:0;">
          <div class="umsatz-subheader">
            <span class="strong">${escapeHtml(hl)}: ${fmtNum(totalAbs)} €</span><br>
            <span style="font-size:0.78rem;color:var(--gray-500)">${fmtDec(totalHH)} € / HH &nbsp;·&nbsp; Werbeanteil: ${escapeHtml(antWA)} %</span>
          </div>
          <div class="umsatz-bar" style="margin:8px 14px 2px">
            <div style="background:var(--red);width:${pct(tN,tN+tW+tZ)}%"></div>
            <div style="background:#1f78b4;width:${pct(tW,tN+tW+tZ)}%"></div>
            <div style="background:#ffb000;width:${pct(tZ,tN+tW+tZ)}%"></div>
          </div>
          <div class="umsatz-legend" style="padding:2px 14px 8px">
            <span><span style="color:var(--red)">⬤</span> Normal</span>
            <span><span style="color:#1f78b4">⬤</span> Werbung</span>
            <span><span style="color:#ffb000">⬤</span> Mitgekauft</span>
          </div>

          <div class="section-title">WK-Kennwerte</div>
          <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:3px 10px;padding:8px 14px;font-size:0.82rem;">
            <div style="color:var(--gray-600);font-weight:500">Umsatz Brutto (hochgerechnet)</div>
            <div style="text-align:right;font-weight:700;color:var(--gray-800)">${fmtNum(totalUmsatzHR)} €</div>
            <div style="color:var(--gray-600);font-weight:500">HZ-Werbekosten</div>
            <div style="text-align:right;font-weight:700;color:var(--gray-800)">${fmtNum(totalHZKosten)} €</div>
            <div style="color:var(--gray-600);font-weight:500">Haushalte</div>
            <div style="text-align:right;font-weight:700;color:var(--gray-800)">${fmtNum(Math.round(totalHaushalteWK))}</div>
          </div>

          <div class="section-title">Umsatzanteile (Kategorien)</div>
          <div class="umsatz-bar" style="margin:8px 14px 2px">
            <div class="share-stationaer" style="width:${pct(agg.umsatz,tN)}%"></div>
            <div class="share-pluscard"   style="width:${pct(agg.pluscard,tN)}%"></div>
            <div class="share-ra"         style="width:${pct(agg.ra,tN)}%"></div>
            <div class="share-online"     style="width:${pct(agg.onlineshop,tN)}%"></div>
          </div>
          <div class="umsatz-legend" style="padding:2px 14px 8px">
            <span><span style="color:var(--red)">⬤</span> Stationär</span>
            <span><span style="color:#1f78b4">⬤</span> Pluscard</span>
            <span><span style="color:#33a02c">⬤</span> R&amp;A</span>
            <span><span style="color:#ffb000">⬤</span> KUBE OS</span>
          </div>

          <div class="section-title">Nach Kategorien</div>
          <div class="umsatz-grid" style="padding:6px 14px">
            <div class="label" style="font-weight:700;color:var(--gray-800)">Kategorie</div>
            <div class="value" style="font-weight:700;color:var(--gray-800)">Absolut</div>
            <div class="value" style="font-weight:700;color:var(--gray-800)">/ HH</div>
            <div class="label" style="${dis('stationaer')}">🏬 Stationär</div>
            <div class="value" style="${dis('stationaer')}">${fmtNum(st.abs)} €</div>
            <div class="value" style="${dis('stationaer')}">${fmtDec(st.hh)} €</div>
            <div class="label" style="${dis('pluscard')}">💳 Pluscard</div>
            <div class="value" style="${dis('pluscard')}">${fmtNum(pc.abs)} €</div>
            <div class="value" style="${dis('pluscard')}">${fmtDec(pc.hh)} €</div>
            <div class="label" style="${dis('ra')}">📦 R&amp;A</div>
            <div class="value" style="${dis('ra')}">${fmtNum(ra.abs)} €</div>
            <div class="value" style="${dis('ra')}">${fmtDec(ra.hh)} €</div>
            <div class="label" style="${dis('online')}">🛒 KUBE OS</div>
            <div class="value" style="${dis('online')}">${fmtNum(os.abs)} €</div>
            <div class="value" style="${dis('online')}">${fmtDec(os.hh)} €</div>
          </div>
        </div>`;

      popup.classList.remove('hidden'); void popup.offsetWidth; popup.classList.add('show');
      this._on(popup.querySelector('.close-btn'), 'click',
        () => this._onClosePopup(popup, { clearHighlight: false }));
    }

    closeAllPopups() {
      for (const id of ['side-popup', 'side-popup-umsatz', 'side-popup-overview']) {
        const el = this.$(id);
        if (el) { el.classList.remove('show'); el.classList.add('hidden'); }
      }
      if (this._highlightedPLZ) {
        const l = this._layerByPLZ?.[this._highlightedPLZ];
        if (l) this.applyStyleToLayer(l);
        this._highlightedPLZ = null;
      }
      this._activePopupPLZ = null; this._activePopupType = null;
      this._syncPanelState();
    }

    _rerenderActivePopup() {
      if (!this._activePopupPLZ) return;
      if (this._activePopupType === 'overview') { this.showOverviewPopup(); return; }
      const plz = this._activePopupPLZ;
      if (this._activePopupType === 'umsatz' ||
          this.currentMapMode === 'umsatz-multi' || this.currentMapMode === 'werbeanteil') {
        const v = this.filteredPLZWerte?.[plz];
        if (v) this.showUmsatzPopup(plz, v);
        else   this.showEmptyUmsatzPopup(plz);
      } else {
        const layer = this._layerByPLZ?.[plz];
        if (layer) this.showPopup(layer.feature, this.filteredKennwerte?.[plz] || {});
      }
    }

    _syncPanelState() {
      if (this.currentMapMode !== 'umsatz-multi' && this.currentMapMode !== 'werbeanteil') return;
      const panel = this.$('map-control-panel');
      if (!panel) return;
      const hasPopup = this._activePopupPLZ != null;
      if (hasPopup) { panel.classList.remove('panel-auto', 'panel-large'); panel.classList.add('panel-medium'); }
      else          { panel.classList.remove('panel-large', 'panel-medium'); panel.classList.add('panel-auto'); }
    }


    // ── Filter-Dropdowns ───────────────────────────────────────────────
    setupFilterDropdowns() {
      const erhSelect    = this.$('erhebung-select');
      const jahrSelect   = this.$('jahr-select');
      const nummerSelect = this.$('nummer-select');
      if (!erhSelect || !jahrSelect || !nummerSelect) return;

      const mkPlaceholder = (text) => {
        const opt = document.createElement('option');
        opt.value = ''; opt.textContent = text; opt.disabled = true; opt.selected = true;
        return opt;
      };

      // Dropdown-Optionen befüllen.
      // WICHTIG: Wenn der User schon eine Selektion getroffen hat, soll diese
      // erhalten bleiben. Wir vergleichen die aktuell gerenderten Optionen
      // mit den gewünschten und bauen nur neu, wenn sich etwas geändert hat.
      const desiredErhIDs = Object.keys(this._erhData || {}).filter(id => !isNull(id));
      const currentErhIDs = Array.from(erhSelect.options).map(o => o.value).filter(v => v !== '');
      const sameSet = desiredErhIDs.length === currentErhIDs.length &&
                      desiredErhIDs.every(id => currentErhIDs.includes(id));
      if (!sameSet) {
        const previousValue = erhSelect.value;
        erhSelect.innerHTML = '';
        erhSelect.appendChild(mkPlaceholder('– ErhebungsID wählen –'));
        for (const erhID of desiredErhIDs) {
          const opt = document.createElement('option');
          opt.value = erhID; opt.textContent = this._fmtGF(erhID);
          erhSelect.appendChild(opt);
        }
        // Vorherige Auswahl wiederherstellen, falls sie noch existiert
        if (previousValue && desiredErhIDs.includes(previousValue)) {
          erhSelect.value = previousValue;
        }
      }

      if (this._dropdownsInitialized) return;
      this._dropdownsInitialized = true;

      // ── Doppelbestreuungs-Toggle oben einsetzen ──
      const filterContainer = this._shadowRoot.querySelector('.filter-container');
      if (filterContainer && !this.$('doppel-toggle-bar')) {
        const bar = document.createElement('div');
        bar.id = 'doppel-toggle-bar';
        bar.innerHTML = `
          <div id="doppel-toggle-header">
            <span class="doppel-toggle-icon">⚠️</span>
            <div class="doppel-toggle-title-block">
              <span class="doppel-toggle-label">Doppelbestreuung</span>
              <span class="doppel-toggle-subtitle">Erkennung von Überschneidungen</span>
            </div>
          </div>
          <div id="doppel-toggle-options">
            <div class="doppel-option active" id="doppel-opt-aus">
              <div class="doppel-option-radio"></div>
              <div class="doppel-option-text">
                <span class="doppel-option-name">Ohne Doppelbestreuung</span>
                <span class="doppel-option-desc">Nur eigene Erhebung · Schnellste Ladezeit</span>
              </div>
            </div>
            <div class="doppel-option" id="doppel-opt-ein">
              <div class="doppel-option-radio"></div>
              <div class="doppel-option-text">
                <span class="doppel-option-name">Mit Doppelbestreuung</span>
                <span class="doppel-option-desc">Alle Erhebungen des Zeitraums · Längere Ladezeit</span>
              </div>
            </div>
          </div>`;
        const filterBtn = filterContainer.querySelector('#filter-button');
        if (filterBtn) filterContainer.insertBefore(bar, filterBtn);
        else           filterContainer.appendChild(bar);

        const optAus = bar.querySelector('#doppel-opt-aus');
        const optEin = bar.querySelector('#doppel-opt-ein');
        this._doppelbestreuungAktiv = false;

        const refreshBtn = () => {
          const btn = this.$('filter-button');
          if (btn && erhSelect.value && jahrSelect.value && nummerSelect.value) {
            btn.classList.add('ready');
          }
        };
        this._on(optAus, 'click', () => {
          this._doppelbestreuungAktiv = false;
          optAus.classList.add('active'); optEin.classList.remove('active');
          refreshBtn();
        });
        this._on(optEin, 'click', () => {
          this._doppelbestreuungAktiv = true;
          optEin.classList.add('active'); optAus.classList.remove('active');
          refreshBtn();
        });
      }

      jahrSelect.innerHTML = '';   jahrSelect.disabled = true;
      nummerSelect.innerHTML = ''; nummerSelect.disabled = true;
      jahrSelect.appendChild(mkPlaceholder('– Jahr wählen –'));
      nummerSelect.appendChild(mkPlaceholder('– Nummer wählen –'));

      const filterBtn = this.$('filter-button');
      const updateBtnState = () => {
        if (erhSelect.value && jahrSelect.value && nummerSelect.value) filterBtn?.classList.add('ready');
        else filterBtn?.classList.remove('ready');
      };

      // Change-Listener EINMALIG registrieren (nicht pro Render neu anhängen)
      this._on(erhSelect, 'change', () => {
        jahrSelect.innerHTML = ''; nummerSelect.innerHTML = '';
        jahrSelect.disabled = false; nummerSelect.disabled = true;
        jahrSelect.appendChild(mkPlaceholder('– Jahr wählen –'));
        for (const j of Object.keys(this._erhData?.[erhSelect.value] || {})) {
          if (isNull(j)) continue;
          const opt = document.createElement('option');
          opt.value = j; opt.textContent = j;
          jahrSelect.appendChild(opt);
        }
        nummerSelect.appendChild(mkPlaceholder('– Nummer wählen –'));
        updateBtnState();
      });
      this._on(jahrSelect, 'change', () => {
        nummerSelect.innerHTML = ''; nummerSelect.disabled = false;
        nummerSelect.appendChild(mkPlaceholder('– Nummer wählen –'));
        const set = this._erhData?.[erhSelect.value]?.[jahrSelect.value] || [];
        for (const n of Array.from(set)) {
          if (isNull(n)) continue;
          const opt = document.createElement('option');
          opt.value = n; opt.textContent = fmtNummer(n);
          nummerSelect.appendChild(opt);
        }
        updateBtnState();
      });
      this._on(nummerSelect, 'change', updateBtnState);

      if (filterBtn) {
        this._on(filterBtn, 'click', () => {
          if (!filterBtn.classList.contains('ready')) return;
          this.loadErhebung(erhSelect.value, jahrSelect.value, nummerSelect.value);
        });
      }

      // Erhebungsübersicht-Toggle
      if (!this.$('info-toggle-btn')) {
        const infoBtn = document.createElement('button');
        infoBtn.id = 'info-toggle-btn';
        infoBtn.className = 'info-toggle-btn';
        infoBtn.type = 'button';
        infoBtn.innerHTML = '↕ Erhebungsübersicht';
        this._on(infoBtn, 'click', () => {
          const nlBox = this.$('nl-info-container');
          const filter = this._shadowRoot.querySelector('.filter-container');
          if (!nlBox) return;
          if (nlBox.classList.contains('show')) {
            nlBox.classList.remove('show');
            filter.classList.remove('nl-info-active');
          } else {
            this.prepareErhebungsInfo();
            this.renderErhebungsInfoTable();
            nlBox.classList.add('show');
            filter.classList.add('nl-info-active');
          }
        });
        this._shadowRoot.querySelector('.filter-container').appendChild(infoBtn);
      }
    }

    restoreDropdownSelections() {
      const { erhID, jahr, nummer } = this._activeFilter || {};
      const erhSelect    = this.$('erhebung-select');
      const jahrSelect   = this.$('jahr-select');
      const nummerSelect = this.$('nummer-select');
      if (!erhSelect || !jahrSelect || !nummerSelect) return;
      // change-Events sind nötig, damit die Folge-Dropdowns korrekt befüllt werden
      // und der Filter-Button den .ready-Status bekommt.
      if (erhID)  { erhSelect.value  = erhID;  erhSelect.dispatchEvent(new Event('change')); }
      if (jahr)   { jahrSelect.value = jahr;   jahrSelect.dispatchEvent(new Event('change')); }
      if (nummer) { nummerSelect.value = nummer; nummerSelect.dispatchEvent(new Event('change')); }
    }

    // ── Erhebungs-Info (NL-Tabelle) ────────────────────────────────────
    prepareErhebungsInfo() {
      this.erhebungsInfo = {};
      const { erhID, jahr, nummer } = this._activeFilter || {};
      if (!erhID) return;
      const erhData = this._getErhebungRows(erhID, jahr, nummer);
      if (!erhData.length) return;

      const jahresumsatz = {}, erfasst_total = {}, erfasst_valid = {};
      for (const row of erhData) {
        const nl = row['dimension_niederlassung_0']?.id?.trim();
        if (!nl) continue;
        const plz = this._normalizePLZ(row['dimension_plz_0']?.id ?? row['dimension_plz_0']?.raw) || '00000';
        const uJ = row['value_hr_n_umsatz_0']?.raw ?? 0;
        const uE = row['value_ums_erhebung_0']?.raw ?? 0;
        jahresumsatz[nl]  ||= 0;
        erfasst_total[nl] ||= 0;
        erfasst_valid[nl] ||= 0;
        erfasst_total[nl] += uE;
        if (plz !== '00000') { jahresumsatz[nl] += uJ; erfasst_valid[nl] += uE; }
      }
      for (const nl of Object.keys(erfasst_total)) {
        const j = jahresumsatz[nl]  || 0;
        const t = erfasst_total[nl] || 0;
        const v = erfasst_valid[nl] || 0;
        this.erhebungsInfo[nl] = {
          nl, jahresumsatz: j, erfasst_total: t, erfasst_valid: v,
          pct_erfassung:   j > 0 ? t / j : 0,
          pct_valid:       t > 0 ? v / t : 0,
          pct_hochrechnung: j > 0 ? v / j : 0,
        };
      }
    }

    renderErhebungsInfoTable() {
      const container = this.$('nl-info-container');
      if (!container) return;
      container.innerHTML = '';
      const scroll = document.createElement('div'); scroll.classList.add('nl-info-scroll');
      const table  = document.createElement('table'); table.classList.add('nl-info-table');
      const thead  = document.createElement('thead'); const headerRow = document.createElement('tr');
      const headers = [
        { label: 'NL' },
        { label: 'Umsatz\n(Hochrechn.)' },
        { label: 'Erfasst' },
        { label: '%' },
        { label: 'Valide' },
        { label: 'Abdeckung' },
      ];
      for (const h of headers) {
        const th = document.createElement('th');
        th.textContent = h.label;
        headerRow.appendChild(th);
      }
      thead.appendChild(headerRow); table.appendChild(thead);
      const tbody = document.createElement('tbody');

      // Event-Delegation
      this._on(tbody, 'click', (ev) => {
        const tr = ev.target.closest('.nl-info-row');
        if (!tr?.dataset.nl) return;
        this._nlSelectionInitialized = true;
        this.toggleNLSelection(tr.dataset.nl);
      });

      for (const info of Object.values(this.erhebungsInfo)) {
        const tr = document.createElement('tr');
        tr.classList.add('nl-info-row');
        tr.dataset.nl = info.nl;
        const cells = [
          info.nl,
          Math.round(info.jahresumsatz).toLocaleString('de-DE'),
          Math.round(info.erfasst_total).toLocaleString('de-DE'),
          (info.pct_erfassung * 100).toFixed(1) + '%',
          Math.round(info.erfasst_valid).toLocaleString('de-DE'),
          (info.pct_hochrechnung * 100).toFixed(1) + '%',
        ];
        cells.forEach((val, i) => {
          const td = document.createElement('td');
          td.textContent = val;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      }
      table.appendChild(tbody); scroll.appendChild(table); container.appendChild(scroll);
      this.updateNLSelectionUI();
    }

    updateNLSelectionUI() {
      const rows = this._shadowRoot.querySelectorAll('.nl-info-row');
      for (const row of rows) {
        const nl = row.dataset.nl;
        if (!this._nlSelectionInitialized) { row.classList.remove('table-row-selected'); continue; }
        if (this._selectedNLs.has(nl)) row.classList.add('table-row-selected');
        else                           row.classList.remove('table-row-selected');
      }
    }

    closeNLTable() {
      this.$('nl-info-container')?.classList.remove('show');
      this._shadowRoot.querySelector('.filter-container')?.classList.remove('nl-info-active');
    }


    // ── Umsatz-Aggregation ─────────────────────────────────────────────
    prepareUmsatzPLZWerte() {
      const { erhID, jahr, nummer } = this._activeFilter || {};
      if (!erhID || !jahr || !nummer) return;
      const rows = this._getErhebungRows(erhID, jahr, nummer);
      if (!rows.length) return;

      const safe = (x) => {
        if (x == null) return 0;
        if (typeof x === 'string') x = x.replace(/\./g, '').replace(',', '.');
        const n = Number(x);
        return Number.isFinite(n) ? n : 0;
      };
      const parseHH = (x) => {
        if (x == null) return 0;
        if (typeof x === 'number') return Number.isFinite(x) ? x : 0;
        if (typeof x === 'string') {
          const n = Number(x.replace(/[.,\s]/g, ''));
          return Number.isFinite(n) ? n : 0;
        }
        return 0;
      };

      const aggregated = {};
      for (const row of rows) {
        const nl = row['dimension_niederlassung_0']?.id?.trim();
        if (this._selectedNLs?.size > 0 && !this._selectedNLs.has(nl)) continue;
        const plz = this._normalizePLZ(row['dimension_plz_0']?.id ?? row['dimension_plz_0']?.raw);
        if (!plz || plz === '00000') continue;
        if (!aggregated[plz]) {
          aggregated[plz] = {
            _hhValues: [], _kkValues: [],
            umsatz: 0, ra: 0, onlineshop: 0, pluscard: 0,
            umsatzWerbung: 0, raWerbung: 0, onlineshopWerbung: 0, pluscardWerbung: 0,
            umsatzZusatz: 0,  raZusatz: 0,  onlineshopZusatz: 0,  pluscardZusatz: 0,
            umsatzErhebung: 0, kdErhebung: 0, auflage: 0,
            werbeverweigerer: 0, kaufkraftIdx: 0,
          };
        }
        const v = aggregated[plz];
        const hh = parseHH(row['value_haushalte_0']?.raw);
        if (hh > 0) v._hhValues.push(hh);
        v.umsatzErhebung    += safe(row['value_ums_erhebung_0']?.raw);
        v.kdErhebung        += safe(row['value_kd_erhebung_0']?.raw);
        v.auflage           += safe(row['value_auflage_0']?.raw);
        v.werbeverweigerer   = Math.max(v.werbeverweigerer, safe(row['value_werbeverweigerer_0']?.raw));
        const kk = safe(row['value_kaufkraft_0']?.raw);
        if (kk > 0) v._kkValues.push(kk);

        v.umsatz     += safe(row['value_umsatz_stationaer_0']?.raw);
        v.ra         += safe(row['value_umsatz_ra_0']?.raw);
        v.onlineshop += safe(row['value_umsatz_online_0']?.raw);
        v.pluscard   += safe(row['value_umsatz_grosskunden_0']?.raw);

        v.umsatzWerbung     += safe(row['value_umsatz_stationaer_werbung_0']?.raw);
        v.raWerbung         += safe(row['value_umsatz_ra_werbung_0']?.raw);
        v.onlineshopWerbung += safe(row['value_umsatz_online_werbung_0']?.raw);
        v.pluscardWerbung   += safe(row['value_umsatz_grosskunden_werbung_0']?.raw);

        v.umsatzZusatz     += safe(row['value_umsatz_stationaer_zusatz_0']?.raw);
        v.raZusatz         += safe(row['value_umsatz_ra_zusatz_0']?.raw);
        v.onlineshopZusatz += safe(row['value_umsatz_online_zusatz_0']?.raw);
        v.pluscardZusatz   += safe(row['value_umsatz_grosskunden_zusatz_0']?.raw);
      }

      // Durchschnitte berechnen, Per-Household-Werte ableiten
      for (const v of Object.values(aggregated)) {
        v.haushalte      = v._hhValues.length > 0 ? v._hhValues.reduce((a, b) => a + b, 0) / v._hhValues.length : 0;
        v.kaufkraftIndex = v._kkValues.length > 0 ? v._kkValues.reduce((a, b) => a + b, 0) / v._kkValues.length : 0;
        delete v._hhValues; delete v._kkValues;
        const hh = v.haushalte;
        const perHH = (val) => hh > 0 ? val / hh : 0;
        v.umsatzProHaushalt         = perHH(v.umsatz);
        v.raProHaushalt             = perHH(v.ra);
        v.onlineshopProHaushalt     = perHH(v.onlineshop);
        v.pluscardProHaushalt       = perHH(v.pluscard);
        v.umsatzWerbungProHaushalt     = perHH(v.umsatzWerbung);
        v.raWerbungProHaushalt         = perHH(v.raWerbung);
        v.onlineshopWerbungProHaushalt = perHH(v.onlineshopWerbung);
        v.pluscardWerbungProHaushalt   = perHH(v.pluscardWerbung);
        v.umsatzZusatzProHaushalt     = perHH(v.umsatzZusatz);
        v.raZusatzProHaushalt         = perHH(v.raZusatz);
        v.onlineshopZusatzProHaushalt = perHH(v.onlineshopZusatz);
        v.pluscardZusatzProHaushalt   = perHH(v.pluscardZusatz);
        const tN = v.umsatz + v.ra + v.onlineshop + v.pluscard;
        const tW = v.umsatzWerbung + v.raWerbung + v.onlineshopWerbung + v.pluscardWerbung;
        v.werbeAnteil = tN > 0 ? tW / tN : 0;
      }

      // Radius-Filter anwenden (nur Umsatz-Modi)
      const result = {};
      for (const [plz, v] of Object.entries(aggregated)) {
        if ((this.currentMapMode === 'umsatz-multi' || this.currentMapMode === 'werbeanteil') && this.useRadiusFilter) {
          if (this.plzImRadius instanceof Set && !this.plzImRadius.has(plz)) continue;
        }
        result[plz] = {
          ...v,
          umsatzErhebung:   v.umsatzErhebung   ?? 0,
          kdErhebung:       v.kdErhebung       ?? 0,
          auflage:          v.auflage          ?? 0,
          werbeverweigerer: v.werbeverweigerer ?? 0,
        };
      }
      this.filteredPLZWerte = result;
    }

    getUmsatzSumForPLZ(v) {
      const safe = x => Number.isFinite(x) ? x : 0;
      const isW  = this.umsatzMainMode === 'werbung';
      const useHH = this.umsatzDarstellung === 'hh';
      const pick = (b, w, z, bH, wH, zH) => {
        if (!isW) return safe(useHH ? bH : b);
        let s = 0;
        if (this.useWerbeUmsatz)  s += safe(useHH ? wH : w);
        if (this.useZusatzUmsatz) s += safe(useHH ? zH : z);
        return s;
      };
      let s = 0;
      if (this.activeCategories.has('stationaer'))
        s += pick(v.umsatz, v.umsatzWerbung, v.umsatzZusatz, v.umsatzProHaushalt, v.umsatzWerbungProHaushalt, v.umsatzZusatzProHaushalt);
      if (this.activeCategories.has('pluscard'))
        s += pick(v.pluscard, v.pluscardWerbung, v.pluscardZusatz, v.pluscardProHaushalt, v.pluscardWerbungProHaushalt, v.pluscardZusatzProHaushalt);
      if (this.activeCategories.has('ra'))
        s += pick(v.ra, v.raWerbung, v.raZusatz, v.raProHaushalt, v.raWerbungProHaushalt, v.raZusatzProHaushalt);
      if (this.activeCategories.has('online'))
        s += pick(v.onlineshop, v.onlineshopWerbung, v.onlineshopZusatz, v.onlineshopProHaushalt, v.onlineshopWerbungProHaushalt, v.onlineshopZusatzProHaushalt);
      return s;
    }

    // ── WK-Kennwerte (HZ-Kosten pro PLZ etc.) ──────────────────────────
    computeWKKennwerte() {
      if (!this.filteredData) return;
      const aggregated = {}, unfilteredUmsatzByPLZ = {};
      const selNLs = this._selectedNLs;
      const radius = this.plzImRadius;
      const hasNLFilter = selNLs && selNLs.size > 0;
      const hasRadius   = radius instanceof Set && radius.size > 0;
      const data = this.filteredData;

      for (let i = 0, len = data.length; i < len; i++) {
        const row = data[i];
        const plz = this._normalizePLZ(row['dimension_plz_0']?.id ?? row['dimension_plz_0']?.raw) || '00000';
        const umsatz = row['value_hr_n_umsatz_0']?.raw ?? 0;
        unfilteredUmsatzByPLZ[plz] = (unfilteredUmsatzByPLZ[plz] || 0) + umsatz;
        const nl = row['dimension_niederlassung_0']?.id?.trim();
        if (hasNLFilter && !selNLs.has(nl)) continue;
        if (hasRadius && !radius.has(plz)) continue;
        if (!aggregated[plz]) aggregated[plz] = { hzCount: 0, umsatzNetto: 0, hzKosten: 0, potHzSum: 0, potHzCount: 0 };
        const entry = aggregated[plz];
        if (row['dimension_hzflag_0']?.id?.trim() === 'X') entry.hzCount++;
        entry.umsatzNetto += umsatz;
        entry.hzKosten    += row['value_hz_kosten_0']?.raw ?? 0;
        const potHz = row['value_hz_potentiell_0']?.raw;
        if (typeof potHz === 'number') { entry.potHzSum += potHz; entry.potHzCount++; }
      }

      const base = this.filteredKennwerte || {};
      const newFilteredKennwerte = {};
      const newFilteredPLZWerte  = {};

      for (const plz of Object.keys(aggregated)) {
        const entry = aggregated[plz];
        const umsatzNetto = entry.umsatzNetto;
        const hzKosten    = entry.hzKosten;
        const wkPercent   = umsatzNetto > 0 ? Number(((hzKosten / umsatzNetto) * 100).toFixed(1)) : 0;
        const unfU        = unfilteredUmsatzByPLZ[plz] ?? 0;
        const wkNachbarn  = unfU > 0 ? Number(((hzKosten / unfU) * 100).toFixed(1)) : 0;
        const avgPotHz    = entry.potHzCount > 0 ? entry.potHzSum / entry.potHzCount : 0;
        const potHzPct    = umsatzNetto > 0 ? Number(((avgPotHz / umsatzNetto) * 100).toFixed(1)) : 0;
        const isHZ        = entry.hzCount > 0;
        const isCritical  = entry.hzCount > 1;
        const baseEntry   = base[plz] || {};
        const old         = this.filteredPLZWerte?.[plz] || {};

        newFilteredKennwerte[plz] = {
          ...baseEntry,
          isHZ, isCritical,
          value_hr_n_umsatz_0:      { raw: umsatzNetto },
          value_wk_in_percent_0:    { raw: wkPercent },
          value_wk_nachbar_0:       { raw: wkNachbarn },
          value_hz_kosten_0:        { raw: hzKosten },
          value_hz_potentiell_0:    { raw: avgPotHz },
          value_wk_potentiell_0:    { raw: potHzPct },
          value_ums_erhebung_0:     { raw: old.umsatzErhebung ?? 0 },
          value_kd_erhebung_0:      { raw: old.kdErhebung ?? 0 },
          value_auflage_0:          { raw: old.auflage ?? 0 },
          value_kaufkraft_0:        { raw: old.kaufkraftIndex   ?? 0 },
          value_werbeverweigerer_0: { raw: old.werbeverweigerer ?? 0 },
        };
        newFilteredPLZWerte[plz] = {
          wk: wkPercent, wkPot: potHzPct, hz: isHZ,
          umsatz: old.umsatz ?? 0, ra: old.ra ?? 0, onlineshop: old.onlineshop ?? 0, pluscard: old.pluscard ?? 0,
          haushalte: old.haushalte ?? 0,
          kaufkraftIndex: old.kaufkraftIndex ?? 0, werbeverweigerer: old.werbeverweigerer ?? 0,
          umsatzProHaushalt: old.umsatzProHaushalt ?? 0,
          raProHaushalt: old.raProHaushalt ?? 0,
          onlineshopProHaushalt: old.onlineshopProHaushalt ?? 0,
          pluscardProHaushalt: old.pluscardProHaushalt ?? 0,
          umsatzWerbung: old.umsatzWerbung ?? 0,
          raWerbung: old.raWerbung ?? 0,
          onlineshopWerbung: old.onlineshopWerbung ?? 0,
          pluscardWerbung: old.pluscardWerbung ?? 0,
          umsatzZusatz: old.umsatzZusatz ?? 0,
          raZusatz: old.raZusatz ?? 0,
          onlineshopZusatz: old.onlineshopZusatz ?? 0,
          pluscardZusatz: old.pluscardZusatz ?? 0,
          umsatzWerbungProHaushalt: old.umsatzWerbungProHaushalt ?? 0,
          raWerbungProHaushalt: old.raWerbungProHaushalt ?? 0,
          onlineshopWerbungProHaushalt: old.onlineshopWerbungProHaushalt ?? 0,
          pluscardWerbungProHaushalt: old.pluscardWerbungProHaushalt ?? 0,
          umsatzZusatzProHaushalt: old.umsatzZusatzProHaushalt ?? 0,
          raZusatzProHaushalt: old.raZusatzProHaushalt ?? 0,
          onlineshopZusatzProHaushalt: old.onlineshopZusatzProHaushalt ?? 0,
          pluscardZusatzProHaushalt: old.pluscardZusatzProHaushalt ?? 0,
          werbeAnteil: old.werbeAnteil ?? 0,
        };
      }

      this.filteredKennwerte = newFilteredKennwerte;
      this.filteredPLZWerte  = newFilteredPLZWerte;
    }

    // ── Cross-Erhebungs-Doppelbestreuung ───────────────────────────────
    _computeCrossErhebungDoppel() {
      this._crossErhebungPLZ = {};
      if (!this._activeFilter || !this._myDataSource?.data) return;
      const { erhID: aktErhID, jahr, nummer } = this._activeFilter;

      const aktHZPLZs = new Set();
      for (const [plz, k] of Object.entries(this.filteredKennwerte || {})) {
        if (k.isHZ) aktHZPLZs.add(plz);
      }
      if (aktHZPLZs.size === 0) return;

      // Alle Fremd-Erhebungen mit gleichem Jahr+Nummer durchgehen (nur HZ=X Rows)
      const fremdRows = [];
      for (const key of Object.keys(this._erhebungIndex || {})) {
        const [rErh, rJahr, rNr] = key.split('|');
        if (rErh === aktErhID || rJahr !== jahr || rNr !== nummer) continue;
        const rows = this._erhebungIndex[key];
        for (const r of rows) {
          if (r['dimension_hzflag_0']?.id?.trim() === 'X') fremdRows.push(r);
        }
      }
      for (const row of fremdRows) {
        const plz = this._normalizePLZ(row['dimension_plz_0']?.id ?? row['dimension_plz_0']?.raw);
        if (!plz || !aktHZPLZs.has(plz)) continue;
        const rErh = row['dimension_erhebung_0']?.id?.trim();
        const rNL  = row['dimension_niederlassung_0']?.id?.trim();
        if (!this._crossErhebungPLZ[plz]) this._crossErhebungPLZ[plz] = {};
        if (!this._crossErhebungPLZ[plz][rErh]) this._crossErhebungPLZ[plz][rErh] = new Set();
        if (rNL) this._crossErhebungPLZ[plz][rErh].add(rNL);
      }

      // Eigene NL-Kontribution zu ohnehin-internen Critical-PLZs hinzufügen
      if (this.filteredData) {
        for (const row of this.filteredData) {
          const plz = this._normalizePLZ(row['dimension_plz_0']?.id ?? row['dimension_plz_0']?.raw);
          if (!plz) continue;
          if (row['dimension_hzflag_0']?.id?.trim() !== 'X') continue;
          const nl = row['dimension_niederlassung_0']?.id?.trim();
          const isInternalCritical = this.filteredKennwerte?.[plz]?.isCritical;
          const hasCrossEntry = !!this._crossErhebungPLZ[plz];
          if (!isInternalCritical && !hasCrossEntry) continue;
          if (!this._crossErhebungPLZ[plz]) this._crossErhebungPLZ[plz] = {};
          if (!this._crossErhebungPLZ[plz][aktErhID]) this._crossErhebungPLZ[plz][aktErhID] = new Set();
          if (nl) this._crossErhebungPLZ[plz][aktErhID].add(nl);
        }
      }
    }

    _refreshAll() {
      this.prepareUmsatzPLZWerte();
      this.computeWKKennwerte();
      this.computeStreuverlust();
      this.updateGeoLayer();
      this.updateHeatmapLegend();
      this.renderDataTable(this.filteredKennwerte);
      if (this._activeFilter) this.showOverviewPopup();
    }

    prepareMapData(filteredData) {
      this.Niederlassung = {}; this.nlKoordinaten = {}; this.hzFlags = {}; this.extraNLs = [];
      const NL  = this.Niederlassung;
      const nlK = this.nlKoordinaten;
      const hzF = this.hzFlags;
      for (let i = 0, len = filteredData.length; i < len; i++) {
        const row = filteredData[i];
        const plz = this._normalizePLZ(row['dimension_plz_0']?.id);
        const nlKey = row['dimension_niederlassung_0']?.id?.trim();
        const hz = row['dimension_hzflag_0']?.id?.trim() === 'X';
        if (nlKey) {
          NL[nlKey] = nlKey;
          if (!nlK[nlKey]) {
            const lat = parseFloat(row['dimension_Lat_0']?.label);
            const lon = parseFloat(row['dimension_lon_0']?.label);
            if (!isNaN(lat) && !isNaN(lon)) nlK[nlKey] = { lat, lon };
          }
        }
        if (plz) hzF[plz] = hz;
      }
    }


    // ── Heatmap-Legende ────────────────────────────────────────────────
    updateHeatmapLegend() {
      const legend = this.$('heatmap-legend');
      if (!legend) return;
      if (!this._activeFilter || !this.filteredPLZWerte ||
          Object.keys(this.filteredPLZWerte).length === 0 ||
          !this.currentMapMode) {
        legend.classList.add('hidden');
        return;
      }
      const row = (bg, label) =>
        `<div class="heatmap-legend-row"><div class="heatmap-legend-color" style="background:${bg}"></div><span>${label}</span></div>`;

      if (this.currentMapMode === 'wk') {
        legend.innerHTML = `<strong>Werbekosten</strong>
          <div style="font-size:0.7rem;color:#adb5bd;font-weight:600;margin:6px 0 3px;text-transform:uppercase;letter-spacing:.04em">Bestreut (% WK)</div>
          ${row('#e31a1c','&gt; 25 %')}${row('#fd8d3c','15 – 25 %')}${row('#ffffb2','10 – 15 %')}${row('#78c679','5 – 10 %')}${row('#41ab5d','2 – 5 %')}${row('#006837','0 – 2 %')}
          <div style="font-size:0.7rem;color:#adb5bd;font-weight:600;margin:8px 0 3px;text-transform:uppercase;letter-spacing:.04em">Nicht bestreut (% pot. WK)</div>
          ${row('#cfd4da','&gt; 50 %')}${row('#bdbdbd','25 – 50 %')}${row('#969696','15 – 25 %')}${row('#6baed6','10 – 15 %')}${row('#2171b5','5 – 10 %')}${row('#08306b','&lt; 5 %')}`;
        legend.classList.remove('hidden'); return;
      }
      if (this.currentMapMode === 'umsatz-multi') {
        // Math.max(...values) würde bei sehr großen PLZ-Arrays (>~10k) den Stack
        // sprengen. reduce ist sicher und gleich schnell.
        let max = 0;
        for (const v of Object.values(this.filteredPLZWerte)) {
          const sum = this.getUmsatzSumForPLZ(v);
          if (sum > max) max = sum;
        }
        if (max === 0) { legend.classList.add('hidden'); return; }
        const fmt = (x) => x.toLocaleString('de-DE', { maximumFractionDigits: 0 });
        const steps = [
          { v: max,       label: `&gt; ${fmt(max*0.95)} €` },
          { v: max*.85,   label: `${fmt(max*0.75)} – ${fmt(max*0.85)} €` },
          { v: max*.65,   label: `${fmt(max*0.55)} – ${fmt(max*0.65)} €` },
          { v: max*.45,   label: `${fmt(max*0.35)} – ${fmt(max*0.45)} €` },
          { v: max*.20,   label: `${fmt(max*0.10)} – ${fmt(max*0.20)} €` },
          { v: 0,         label: `&lt; ${fmt(max*0.10)} €` },
        ];
        legend.innerHTML = `<strong>Umsatz</strong>` +
          steps.map(s => row(this.getDynamicHeatColor(s.v, max), s.label)).join('');
        legend.classList.remove('hidden'); return;
      }
      if (this.currentMapMode === 'werbeanteil') {
        legend.innerHTML = `<strong>Werbeanteil</strong>` +
          [['#7a0f17','&gt; 80 %'],['#b41821','60 – 80 %'],['#e96a3a','40 – 60 %'],
           ['#f6b65b','20 – 40 %'],['#f7d77a','10 – 20 %'],['#fce9b2','&lt; 10 %']]
           .map(([bg, l]) => row(bg, l)).join('');
        legend.classList.remove('hidden'); return;
      }
      legend.classList.add('hidden');
    }

    // ── Doppelbestreuung-Tooltip ───────────────────────────────────────
    _showDoppelTooltip(plz, event, container) {
      this._hideDoppelTooltip();
      const crossInfo = this._crossErhebungPLZ?.[plz] || {};
      const { erhID: aktErhID } = this._activeFilter || {};

      if (Object.keys(crossInfo).length === 0 && aktErhID && this.filteredData) {
        crossInfo[aktErhID] = new Set();
        for (const row of this.filteredData) {
          const p = this._normalizePLZ(row['dimension_plz_0']?.id ?? row['dimension_plz_0']?.raw);
          if (p !== plz) continue;
          if (row['dimension_hzflag_0']?.id?.trim() !== 'X') continue;
          const nl = row['dimension_niederlassung_0']?.id?.trim();
          if (nl) crossInfo[aktErhID].add(nl);
        }
      }

      const allNLs = [...new Set(Object.values(crossInfo).flatMap(s => [...s]))].join(', ') || '—';
      const el = document.createElement('div');
      el.className = 'doppel-tooltip';
      el.innerHTML = `
        <div class="doppel-tooltip-title">⚠️ Doppelbestreuung · PLZ ${escapeHtml(plz)}</div>
        <div class="doppel-tooltip-row">
          <div style="color:var(--gray-500);font-size:0.76rem">
            Durch NLs: <strong style="color:var(--gray-800)">${escapeHtml(allNLs)}</strong>
          </div>
        </div>`;
      el.style.position = 'absolute';
      el.style.pointerEvents = 'none';
      container?.appendChild(el);
      this._doppelTooltipEl = el;
      this._moveDoppelTooltip(event, container);
    }

    _moveDoppelTooltip(event, container) {
      if (!this._doppelTooltipEl || !container) return;
      const rect = container.getBoundingClientRect();
      let x = event.clientX - rect.left + 14;
      let y = event.clientY - rect.top - 10;
      const tw = this._doppelTooltipEl.offsetWidth  || 200;
      const th = this._doppelTooltipEl.offsetHeight || 80;
      if (x + tw > rect.width  - 10) x = event.clientX - rect.left - tw - 14;
      if (y + th > rect.height - 10) y = event.clientY - rect.top  - th - 10;
      this._doppelTooltipEl.style.left = x + 'px';
      this._doppelTooltipEl.style.top  = y + 'px';
    }

    _hideDoppelTooltip() {
      if (this._doppelTooltipEl) { this._doppelTooltipEl.remove(); this._doppelTooltipEl = null; }
    }

    _clearDoppelMarkers() {
      if (this.criticalMarkers) {
        for (const plz of Object.keys(this.criticalMarkers)) this._removeCriticalMarker(plz);
        this.criticalMarkers = {};
      }
      this._hideDoppelTooltip();
    }

    // ── Cinematic Loader ───────────────────────────────────────────────
    _showCinematicLoader() {
      this._hideCinematicLoader(true);
      const overlay = document.createElement('div');
      overlay.id = 'cinematic-loader';
      overlay.innerHTML = `
        <div class="loader-logo"><div class="loader-core"></div></div>
        <div class="loader-phase" id="loader-phase-text">Wird geladen…</div>
        <div class="loader-bar-track"><div class="loader-bar-fill" id="loader-bar"></div></div>
        <div class="loader-dots">
          <div class="loader-dot" data-phase="1"><div class="dot-circle"></div><div class="dot-label">Daten</div></div>
          <div class="loader-dot" data-phase="2"><div class="dot-circle"></div><div class="dot-label">Karte</div></div>
          <div class="loader-dot" data-phase="3"><div class="dot-circle"></div><div class="dot-label">Standorte</div></div>
          <div class="loader-dot" data-phase="4"><div class="dot-circle"></div><div class="dot-label">Kennzahlen</div></div>
        </div>
        <div class="loader-data-progress" id="loader-data-progress">
          <div class="loader-data-bar-track"><div class="loader-data-bar-fill" id="loader-data-bar"></div></div>
          <div class="loader-data-label" id="loader-data-label"></div>
        </div>`;
      const mc = this._shadowRoot.querySelector('.map-container');
      if (mc) mc.appendChild(overlay); else this._shadowRoot.appendChild(overlay);
    }

    _updateLoaderPhase(phase, text) {
      const loader = this.$('cinematic-loader');
      if (!loader) return;
      const phaseText = loader.querySelector('#loader-phase-text');
      if (phaseText) {
        phaseText.style.opacity = '0';
        this._setTimeout(() => { phaseText.textContent = text; phaseText.style.opacity = '1'; }, 140);
      }
      const bar = loader.querySelector('#loader-bar');
      const pm = { 1: 15, 2: 40, 3: 65, 4: 85, 5: 100 };
      if (bar) bar.style.width = (pm[phase] || 0) + '%';
      loader.querySelectorAll('.loader-dot').forEach(dot => {
        const p = Number(dot.dataset.phase);
        dot.classList.remove('active', 'done');
        if (p === phase) dot.classList.add('active');
        else if (p < phase) dot.classList.add('done');
      });
    }

    _updateDataLoadProgress(current, total, pct) {
      const loader = this.$('cinematic-loader');
      if (!loader) return;
      const box   = loader.querySelector('#loader-data-progress');
      const bar   = loader.querySelector('#loader-data-bar');
      const label = loader.querySelector('#loader-data-label');
      if (!box) return;
      box.style.display = 'flex';
      const percent = (pct !== undefined)
        ? Math.min(100, Math.round(pct))
        : (total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0);
      if (bar) { bar.style.animation = 'none'; bar.style.width = percent + '%'; }
      if (label) {
        if (total > 0 && current !== undefined) {
          label.textContent = current.toLocaleString('de-DE') + ' von ' + total.toLocaleString('de-DE') + ' (' + percent + ' %)';
        } else {
          label.textContent = percent + ' %';
        }
      }
    }

    _hideDataLoadProgress() {
      const box = this.$('cinematic-loader')?.querySelector('#loader-data-progress');
      if (box) box.style.display = 'none';
    }

    _hideCinematicLoader(immediate = false) {
      const loader = this.$('cinematic-loader');
      if (!loader) return;
      if (immediate) { loader.remove(); return; }
      loader.classList.add('fade-out');
      this._setTimeout(() => loader.remove(), 380);
    }

    showLoadingOverlay() {
      const o = this.$('loading-spinner');
      if (!o) return;
      o.classList.remove('hidden'); o.style.opacity = '1'; o.style.pointerEvents = 'auto';
    }
    hideLoadingOverlay() {
      const o = this.$('loading-spinner');
      if (!o) return;
      o.style.transition = 'opacity 0.25s ease'; o.style.opacity = '0'; o.style.pointerEvents = 'none';
      this._setTimeout(() => o.classList.add('hidden'), 250);
    }
    showSpinner() { this.$('loading-spinner')?.classList.remove('hidden'); }
    hideSpinner() { this.$('loading-spinner')?.classList.add('hidden'); }


    // ── Preview-Animation (Hauptmenü: Cycles durch alle Erhebungen) ────
    _startPreviewAnimation() {
      if (this._activeFilter) return;
      if (!this._erhData || Object.keys(this._erhData).length === 0) return;
      if (!this.map) return;

      const allErhIDs = Object.keys(this._erhData);
      if (allErhIDs.length === 0) return;

      if (!this._previewGroup) this._previewGroup = L.layerGroup().addTo(this.map);

      // NL-Koordinaten aus Index ableiten
      const nlByErh = {};
      if (this._erhebungIndex) {
        for (const key of Object.keys(this._erhebungIndex)) {
          const rows = this._erhebungIndex[key];
          const erhID = rows[0]?.['dimension_erhebung_0']?.id?.trim();
          if (!erhID) continue;
          for (const row of rows) {
            const nl  = row['dimension_niederlassung_0']?.id?.trim();
            const lat = parseFloat(row['dimension_Lat_0']?.label);
            const lon = parseFloat(row['dimension_lon_0']?.label);
            if (!nl || isNaN(lat) || isNaN(lon)) continue;
            (nlByErh[erhID] ||= {});
            if (!nlByErh[erhID][nl]) nlByErh[erhID][nl] = { lat, lon };
          }
        }
      }

      const getOrCreateLabel = () => {
        let lbl = this.$('preview-erh-label');
        if (!lbl) {
          lbl = document.createElement('div');
          lbl.id = 'preview-erh-label';
          this._shadowRoot.querySelector('.map-container')?.appendChild(lbl);
        }
        return lbl;
      };

      let currentIdx = 0;
      const showErhebung = (erhID) => {
        this._previewGroup.clearLayers();
        const lbl = getOrCreateLabel();
        lbl.style.opacity = '0';
        this._setTimeout(() => {
          lbl.textContent = `Vorschau · ${this._fmtGF(erhID)}`;
          lbl.style.opacity = '1';
        }, 150);

        const nls = nlByErh[erhID] || {};
        const nlList = Object.entries(nls);
        if (nlList.length === 0) return;

        nlList.forEach(([nl, { lat, lon }], i) => {
          this._setTimeout(() => {
            if (this._activeFilter) return;
            const pingIcon = L.divIcon({
              html: `<div style="width:44px;height:44px;border-radius:50%;border:2px solid rgba(180,24,33,0.55);animation:previewPing 1s ease-out forwards;pointer-events:none;"></div>`,
              className: '', iconSize: [44, 44], iconAnchor: [22, 22]
            });
            const pingMarker = L.marker([lat, lon], { icon: pingIcon, interactive: false, zIndexOffset: 500 });
            this._previewGroup.addLayer(pingMarker);
            this._setTimeout(() => {
              try { this._previewGroup.removeLayer(pingMarker); } catch (e) {}
            }, 1050);

            const pinIcon = L.divIcon({
              html: `<div style="width:30px;height:30px;background:#b41821;border-radius:50% 50% 50% 0;box-shadow:-1px 2px 8px rgba(180,24,33,0.5);transform:translate(-50%,-80%) rotate(-45deg) scale(0);animation:previewFadeIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards;display:flex;align-items:center;justify-content:center;pointer-events:none;"><div style="transform:rotate(45deg);font-size:9px;font-weight:700;color:white;font-family:system-ui;max-width:24px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(nl)}</div></div>`,
              className: '', iconSize: [30, 30], iconAnchor: [15, 30]
            });
            const pinMarker = L.marker([lat, lon], { icon: pinIcon, interactive: false, zIndexOffset: 1000 });
            this._previewGroup.addLayer(pinMarker);
          }, i * 300);
        });
      };

      const runCycle = () => {
        if (this._activeFilter) { this._stopPreview(); return; }
        const erhID = allErhIDs[currentIdx % allErhIDs.length];
        showErhebung(erhID);
        currentIdx++;
      };

      runCycle();
      this._previewInterval = this._setInterval(() => {
        if (this._activeFilter) { this._stopPreview(); return; }
        runCycle();
      }, 5500);
    }

    _stopPreview() {
      if (this._previewInterval) {
        this._clearInterval(this._previewInterval);
        this._previewInterval = null;
      }
      this._previewGroup?.clearLayers();
      this.$('preview-erh-label')?.remove();
    }

    // ── onCustomWidgetEvent (SAC-Hook) ─────────────────────────────────
    onCustomWidgetEvent(event) {
      if (event?.name === 'toggleTiles') this.toggleMapTiles();
    }

    // ── queryErhebungFromBW (Fallback-Path) ────────────────────────────
    async queryErhebungFromBW(erhID, jahr, nummer) {
      return this._getErhebungRows(erhID, jahr, nummer);
    }

    // ── loadErhebung ───────────────────────────────────────────────────
    async loadErhebung(erhID, jahr, nummer) {
      this.$('heatmap-legend')?.classList.add('hidden');
      this.closeNLTable();
      this._stopPreview();
      const overlay = this.$('map-preview-overlay');
      if (overlay) overlay.innerHTML = '';
      this._rawPLZCache = {};
      this._crossErhebungPLZ = {};

      // Panel-Footer-Buttons aktivieren
      this.$('panel-home-btn')?.removeAttribute('disabled');
      this.$('panel-overview-btn')?.removeAttribute('disabled');

      this._showCinematicLoader();
      this._updateLoaderPhase(1, 'Erhebungsdaten werden geladen…');

      this._activeFilter = { erhID, jahr, nummer };
      this._fullDataLoaded = true;

      const loadStart = Date.now();
      if (this._loadSecTimer) this._clearInterval(this._loadSecTimer);
      this._loadSecTimer = this._setInterval(() => {
        if (!this._fullDataLoaded) {
          this._clearInterval(this._loadSecTimer);
          this._loadSecTimer = null;
          return;
        }
        const secs = Math.floor((Date.now() - loadStart) / 1000);
        this._updateLoaderPhase(1, `Erhebungsdaten werden geladen… (${secs}s)`);
      }, 1000);

      // Index invalidieren, damit render() frisch aufbaut
      this._erhebungIndex = null;
      const switched = this._switchToErhebungFilter(erhID, jahr, nummer);

      if (switched) {
        if (!this._renderInProgress && this._fullDataLoaded) {
          this._scheduleDataPoll();
        }
      } else {
        // Fallback: DataSource-API nicht verfügbar → Index-Lookup direkt
        console.info('[PLZ-Widget] Fallback: nutze vorhandenen Index');
        this._fullDataLoaded = false;

        const doRender = async () => {
          try {
            this._updateLoaderPhase(1, 'Erhebungsdaten werden geladen…');
            const [rawData] = await Promise.all([
              this.queryErhebungFromBW(erhID, jahr, nummer),
              this.loadGeoJson(),
            ]);
            this.filteredData = rawData;

            this._updateLoaderPhase(2, 'Karte wird vorbereitet…');
            this.prepareMapData(rawData);

            this._updateLoaderPhase(3, 'Niederlassungen werden gesetzt…');
            this.allNLs = [...Object.keys(this.Niederlassung), ...(this.extraNLs?.map(e => e.nl) ?? [])];
            this._selectedNLs = new Set(this.allNLs);
            this._nlSelectionInitialized = false;
            this.activeCategories = new Set(CATEGORIES);
            this._shadowRoot.querySelectorAll('.category-toggle').forEach(t => t.classList.add('active'));
            this.createAllMarkers();

            this._updateLoaderPhase(4, 'Kennwerte werden berechnet…');
            const radius = Number(this.$('radius-slider')?.value ?? 40);
            this._buildDistanceCache();
            this.applyRadiusFilter(radius);
            this.prepareUmsatzPLZWerte();
            this.computeWKKennwerte();
            this.computeStreuverlust();

            this.updateGeoLayer();
            this.renderDataTable(this.filteredKennwerte);
            this.zoomToFilteredPLZ();

            requestAnimationFrame(() => {
              this.prepareErhebungsInfo();
              this.$('map-interaction-block')?.classList.add('hidden');
              this.showOverviewPopup();
              // Nach neuem Filter Labels aktualisieren (Daten-Priorität neu)
              this._scheduleLabelUpdate();
            });
          } finally {
            this._hideCinematicLoader();
          }
        };

        if (this._fullIndexReady) {
          doRender();
        } else {
          const waitStart = Date.now();
          const waitId = this._setInterval(() => {
            if (this._fullIndexReady || Date.now() - waitStart > 3000) {
              this._clearInterval(waitId);
              doRender();
            }
          }, 50);
        }
      }
    }

    // ── Hauptrender-Pipeline (Phase 2, nach Filter-Wechsel) ────────────
    async render() {
      if (!this.map) return;
      if (!this._myDataSource || this._myDataSource.state !== 'success') {
        if (!this._dataPollTimer) {
          this._updateLoaderPhase(1, 'Warte auf Daten…');
          this._scheduleDataPoll();
        }
        return;
      }
      if (!this._activeFilter) {
        console.warn('[PLZ-Widget] render() ohne _activeFilter – Bootstrap-Fallback');
        this._bootstrapFromPLZ00000(this._myDataSource.data);
        return;
      }

      const { erhID, jahr, nummer } = this._activeFilter;
      const rawData = this._myDataSource.data;
      // Token-Snapshot: wenn _resetToHome während render() klickt wird, erhöht es
      // _renderToken. Wir prüfen nach jedem yieldFrame, ob unser Snapshot noch gültig ist.
      const myToken = this._renderToken || 0;
      const isStale = () => (this._renderToken || 0) !== myToken || !this._activeFilter;
      const yieldFrame = () => new Promise(r => requestAnimationFrame(r));
      const totalRows = rawData.length;
      const progress = (phase, pct, label, rows) => {
        this._updateLoaderPhase(phase, label);
        this._updateDataLoadProgress(rows ?? totalRows, totalRows, pct);
      };

      console.group(`[PLZ-Widget] render() – ${erhID}|${jahr}|${nummer}`);
      console.info(`Rows vom BW: ${rawData.length.toLocaleString('de-DE')}`);

      // Sekundenanzeiger stoppen
      if (this._loadSecTimer) { this._clearInterval(this._loadSecTimer); this._loadSecTimer = null; }

      try {
        progress(1, 5, 'Index wird aufgebaut…', 0);
        await yieldFrame();
        if (isStale()) { console.info('[PLZ-Widget] render() abgebrochen (stale)'); console.groupEnd(); return; }

        this._buildErhebungIndex(erhID);
        this._erhData = this._cachedBootstrapStruktur ?? this.buildErhebungsStruktur(rawData);
        this.setupFilterDropdowns();
        this.restoreDropdownSelections();

        const filteredData = this._getErhebungRows(erhID, jahr, nummer);
        this.filteredData = filteredData;
        console.info(`Index: ${filteredData.length} Rows für aktive Erhebung`);

        progress(2, 25, 'Karte wird vorbereitet…', filteredData.length);
        await yieldFrame();
        if (isStale()) { console.info('[PLZ-Widget] render() abgebrochen (stale)'); console.groupEnd(); return; }
        await this.loadGeoJson();
        this.prepareMapData(filteredData);

        progress(3, 50, 'Standorte werden gesetzt…', filteredData.length);
        await yieldFrame();
        if (isStale()) { console.info('[PLZ-Widget] render() abgebrochen (stale)'); console.groupEnd(); return; }
        this.allNLs = [...Object.keys(this.Niederlassung), ...(this.extraNLs?.map(e => e.nl) ?? [])];
        this._selectedNLs = new Set(this.allNLs);
        this._nlSelectionInitialized = false;
        this.activeCategories = new Set(CATEGORIES);
        this._shadowRoot.querySelectorAll('.category-toggle').forEach(t => t.classList.add('active'));
        this.createAllMarkers();

        progress(4, 70, 'Kennwerte werden berechnet…', filteredData.length);
        await yieldFrame();
        if (isStale()) { console.info('[PLZ-Widget] render() abgebrochen (stale)'); console.groupEnd(); return; }
        const radius = Number(this.$('radius-slider')?.value ?? 40);
        this._buildDistanceCache();
        this.applyRadiusFilter(radius);
        this.prepareUmsatzPLZWerte();
        this.computeWKKennwerte();
        this.computeStreuverlust();

        progress(4, 88, 'Karte wird gerendert…', filteredData.length);
        await yieldFrame();
        if (isStale()) { console.info('[PLZ-Widget] render() abgebrochen (stale)'); console.groupEnd(); return; }
        this.updateGeoLayer();
        this.renderDataTable(this.filteredKennwerte);
        this.zoomToFilteredPLZ();

        progress(4, 100, 'Fertig!', filteredData.length);
        const e2e = this._filterSwitchTime
          ? ((Date.now() - this._filterSwitchTime) / 1000).toFixed(1)
          : '–';
        console.info(`E2E ab Filter-Switch: ${e2e}s | ${filteredData.length.toLocaleString('de-DE')} Rows`);
        console.groupEnd();

        requestAnimationFrame(() => {
          if (isStale()) return;   // Home wurde inzwischen geklickt
          this.prepareErhebungsInfo();
          this.$('map-interaction-block')?.classList.add('hidden');
          this.showOverviewPopup();
          // Label-Update: jetzt haben wir Daten für Priorisierung
          this._scheduleLabelUpdate();
        });
      } finally {
        this._hideCinematicLoader();
        this.hideSpinner();
      }
    }

    // ── Home-Reset ─────────────────────────────────────────────────────
    _resetToHome() {
      // Token erhöhen, damit eine eventuell laufende render()-Pipeline merkt,
      // dass sie abgebrochen wurde und keine späten DOM-Updates mehr macht.
      this._renderToken = (this._renderToken || 0) + 1;

      this._activeFilter       = null;
      this.filteredData        = null;
      this.filteredKennwerte   = {};
      this.filteredPLZWerte    = {};
      this._rawPLZCache        = {};
      this._crossErhebungPLZ   = {};
      this.streuverlust        = null;
      this.plzImRadius         = new Set();
      this._activePopupPLZ     = null;
      this._activePopupType    = null;
      this._highlightedPLZ     = null;
      this._nlSelectionInitialized = false;

      this.closeAllPopups();
      this.closeNLTable();
      this.$('heatmap-legend')?.classList.add('hidden');
      this.$('map-control-panel')?.classList.remove('panel-large', 'panel-medium');
      this.filteredGroup?.clearLayers();
      this.neighbourGroup?.clearLayers();
      this.radiusGroup?.clearLayers();
      this.bestreuungGroup?.clearLayers();
      this.competitorGroup?.clearLayers();
      this._clearDoppelMarkers();

      if (this._geoLayer) {
        this._geoLayer.eachLayer(layer => {
          layer.setStyle({ fillColor: '#e9ecef', fillOpacity: 0.3, color: '#ffffff', weight: 0.8 });
        });
      }
      // Click-Handler bleiben gebunden – _handlePolygonClick prüft _activeFilter

      this.activeCategories = new Set(CATEGORIES);
      this._shadowRoot.querySelectorAll('.category-toggle').forEach(t => t.classList.add('active'));
      this.currentMapMode = 'wk'; 
      this.umsatzMainMode = 'gesamt'; this.umsatzDarstellung = 'abs';
      this.$('btn-wk')?.classList.add('active');
      this.$('btn-umsatz')?.classList.remove('active');
      this.$('umsatz-panel')?.classList.add('hidden');
      const wkExtra = this.$('wk-extra');
      if (wkExtra?.style) wkExtra.style.display = '';
      this._startPreviewAnimation();
      this.renderDataTableFromEntries([]);
      const box = this.$('streuverlust-box');
      if (box) box.innerHTML = '';
      this.map?.setView([51.2, 12.5], 6);
      this.$('map-interaction-block')?.classList.remove('hidden');

      // Filter zurücksetzen
      this._fullDataLoaded  = false;
      this._bootstrapDone   = false;
      this._fullIndexReady  = false;
      if (this._loadSecTimer) { this._clearInterval(this._loadSecTimer); this._loadSecTimer = null; }

      // Dropdowns zurücksetzen
      for (const id of ['erhebung-select', 'jahr-select', 'nummer-select']) {
        const sel = this.$(id);
        if (!sel) continue;
        sel.innerHTML = '';
        const ph = document.createElement('option');
        ph.textContent = id === 'erhebung-select' ? '– ErhebungsID wählen –'
                       : id === 'jahr-select'     ? '– Jahr wählen –'
                       : '– Nummer wählen –';
        ph.disabled = true; ph.selected = true;
        sel.appendChild(ph);
        if (id !== 'erhebung-select') sel.disabled = true;
      }
      this.$('filter-button')?.classList.remove('ready');

      const ds = this._getDataSource();
      if (ds) {
        try {
          this._removeAllErhebungFilters(ds);
          const knownKey = this._plzFilterKey ? [this._plzFilterKey] : [];
          const keysToTry = [...knownKey, ...PLZ_FILTER_KEYS.filter(k => k !== this._plzFilterKey)];
          for (const key of keysToTry) {
            try { ds.setDimensionFilter(key, ['00000']); this._plzFilterKey = key; break; } catch (e) {}
          }
          console.info('[PLZ-Widget] Home: Filter zurückgesetzt → PLZ=00000');
          this.$('panel-home-btn')?.setAttribute('disabled', '');
          this.$('panel-overview-btn')?.setAttribute('disabled', '');
        } catch (e) {
          console.warn('[PLZ-Widget] Home: Filter-Reset fehlgeschlagen:', e);
        }
      }

      // Bootstrap aus Cache wieder hochfahren
      if (this._cachedBootstrapRows?.length > 0) {
        console.info(`[PLZ-Widget] Home: Bootstrap aus Cache (${this._cachedBootstrapRows.length} Rows)`);
        this._setTimeout(() => {
          this._bootstrapDone = false;
          this._bootstrapFromPLZ00000(this._cachedBootstrapRows);
          this._scheduleLabelUpdate();
        }, 50);
      } else {
        this._homeResetPending = true;
        if (!this._dataPollTimer) this._scheduleDataPoll();
      }
    }


    // ── SAC DataSource-Setter (Phase 1: Bootstrap, Phase 2: Render) ────
    set myDataSource(dataBinding) {
      this._myDataSource = dataBinding;
      // Caches invalidieren – neue Daten könnten anderes PLZ-Format haben
      this._erhebungIndex = null;
      this._plzNormCache  = null;

      // Allerersten Setter-Aufruf nutzen, um PLZ=00000-Filter zu setzen.
      // Sonst bekommt der Bootstrap die vollen 27k Erhebungs-Rows statt 161 Stammdaten.
      if (!this._plzFilterInitialized) {
        this._plzFilterInitialized = true;
        this._applyPLZ00000Filter();
        if (!this.map) { this._pendingRender = true; return; }
        return; // SAC triggert mit neuem Filter ohnehin neuen Setter-Aufruf
      }

      if (!this.map) { this._pendingRender = true; return; }

      if (!this._myDataSource || this._myDataSource.state !== 'success') {
        this._scheduleDataPoll();
        return;
      }

      // ── Phase 1: Bootstrap (PLZ=00000-Daten) ──
      if (!this._fullDataLoaded) {
        if (!this._bootstrapDone) this._bootstrapFromPLZ00000(this._myDataSource.data);
        return;
      }

      // ── Phase 2: Echte Erhebungsdaten ──
      const rowCount = this._myDataSource?.data?.length ?? 0;
      const e2e = this._filterSwitchTime
        ? ((Date.now() - this._filterSwitchTime) / 1000).toFixed(1) + 's'
        : '–';

      // Cache-Detection: SAC schickt nach Filter-Änderung manchmal noch alte Rows
      if (rowCount === (this._totalRowCount ?? -1) && rowCount > 0) {
        console.info(`[PLZ-Widget] SAC-Cache (${rowCount} Rows / E2E ${e2e}) – warte auf BW`);
        if (!this._dataPollTimer) this._scheduleDataPoll();
        return;
      }
      if (this._renderInProgress) {
        console.info(`[PLZ-Widget] render läuft – ignoriere SAC-Refresh (${rowCount} Rows)`);
        return;
      }

      console.info(`[PLZ-Widget] Phase 2: ${rowCount} Rows | E2E ${e2e} | ${this._doppelbestreuungAktiv ? 'mit' : 'ohne'} Doppelbestreuung`);
      this._totalRowCount   = rowCount;
      this._fullDataLoaded  = false;
      this._renderInProgress = true;
      this.render().finally(() => { this._renderInProgress = false; });
    }

    // ── Daten-Poll (Fallback, wenn DataSource noch nicht bereit) ───────
    _scheduleDataPoll() {
      if (this._dataPollTimer) return;
      this._updateLoaderPhase(1, 'Warte auf Daten…');
      const start = Date.now();
      const mode = this._fullDataLoaded
        ? (this._doppelbestreuungAktiv ? 'Phase 2 – mit Doppelbestreuung' : 'Phase 2 – ohne Doppelbestreuung')
        : 'Phase 1 – Bootstrap';
      console.info(`[PLZ-Widget] ⏳ Poll gestartet [${mode}]`);

      const tick = () => {
        if (this._myDataSource?.state === 'success') {
          const rowCount = this._myDataSource?.data?.length ?? 0;

          // Cache-Detection Phase 2: alte Rows zurückgegeben?
          if (this._fullDataLoaded && rowCount === (this._totalRowCount ?? -1) && rowCount > 0) return;

          // Cache-Detection Home-Reset: noch alte Erhebungs-Rows da?
          if (this._homeResetPending && !this._fullDataLoaded) {
            const expected = 200; // PLZ=00000 liefert ~164 Rows
            if (rowCount > expected) return;
            this._homeResetPending = false;
          }

          this._clearInterval(this._dataPollTimer);
          this._dataPollTimer = null;

          const waited = ((Date.now() - start) / 1000).toFixed(1);
          console.info(`[PLZ-Widget] ✅ BW-Daten empfangen [${mode}] – ${rowCount} Rows in ${waited}s`);

          if (!this._fullDataLoaded) {
            if (!this._bootstrapDone) this._bootstrapFromPLZ00000(this._myDataSource.data);
          } else {
            if (!this._renderInProgress) {
              this._hideDataLoadProgress();
              this._totalRowCount   = rowCount;
              this._fullDataLoaded  = false;
              this._renderInProgress = true;
              this.render().finally(() => { this._renderInProgress = false; });
            }
          }
        } else {
          const secs = Math.floor((Date.now() - start) / 1000);
          if (secs !== this._lastPollSecs) {
            this._lastPollSecs = secs;
            if (!this._fullDataLoaded) {
              this._updateLoaderPhase(1, `Warte auf Daten… (${secs}s)`);
            } else {
              const currentRows = this._myDataSource?.data?.length ?? 0;
              const totalRows   = this._totalRowCount ?? 0;
              this._updateLoaderPhase(1, 'Erhebungsdaten werden geladen…');
              this._updateDataLoadProgress(currentRows, totalRows);
            }
          }
        }
      };

      this._dataPollTimer = this._setInterval(tick, 300);
    }

    // ── Distanz-Helfer (für externe Aufrufer) ──────────────────────────
    getDistanceKm(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    getPolygonCenter(layer) { return layer.getBounds().getCenter(); }
  }

  // Custom-Element registrieren (idempotent gegenüber HMR)
  if (!customElements.get('geo-map-widget')) {
    customElements.define('geo-map-widget', GeoMapWidget);
  }
})();
