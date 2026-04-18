 let neighbours = true;
  let hasTriggeredClick = false;
  (function () {
    const template = document.createElement('template');
    template.innerHTML = `
    <style>
      /* ═══════════════════════════════════════════════════
         DESIGN TOKENS
      ═══════════════════════════════════════════════════ */
      :host {
        --red:          #b41821;
        --red-dark:     #8e1219;
        --red-light:    #d42030;
        --red-bg:       #fdf2f2;
        --red-bg-hover: #fce8e8;
        --red-border:   rgba(180,24,33,0.2);
        --red-shadow:   rgba(180,24,33,0.15);

        --white:        #ffffff;
        --gray-50:      #f8f9fa;
        --gray-100:     #f1f3f5;
        --gray-200:     #e9ecef;
        --gray-300:     #dee2e6;
        --gray-400:     #ced4da;
        --gray-500:     #adb5bd;
        --gray-600:     #6c757d;
        --gray-700:     #495057;
        --gray-800:     #343a40;
        --gray-900:     #212529;

        --shadow-xs:  0 1px 3px rgba(0,0,0,0.06);
        --shadow-sm:  0 2px 8px rgba(0,0,0,0.08);
        --shadow-md:  0 4px 16px rgba(0,0,0,0.10);
        --shadow-lg:  0 8px 32px rgba(0,0,0,0.12);
        --shadow-red: 0 4px 16px rgba(180,24,33,0.25);

        --radius-sm:  5px;
        --radius-md:  8px;
        --radius-lg:  12px;
        --radius-xl:  16px;

        --font:       'Segoe UI', system-ui, -apple-system, sans-serif;

        --ease-out:   cubic-bezier(0.16, 1, 0.3, 1);
        --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

        display: block;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        font-family: var(--font);
      }

      *, *::before, *::after { box-sizing: border-box; }

      /* ═══════════════════════════════════════════════════
         LAYOUT
      ═══════════════════════════════════════════════════ */
      .layout {
        display: flex;
        height: 100%;
        width: 100%;
        background: var(--gray-50);
      }

      /* ═══════════════════════════════════════════════════
         FILTER SIDEBAR
      ═══════════════════════════════════════════════════ */
      .filter-container {
        width: 30%;
        padding: 14px 12px;
        box-sizing: border-box;
        font-family: var(--font);
        background: var(--white);
        border-right: 1px solid var(--gray-200);
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
        z-index: 2;
        box-shadow: 2px 0 12px rgba(0,0,0,0.04);
      }

      /* Sidebar heading strip */
      .filter-container::before {
        content: '';
        display: block;
        height: 3px;
        background: linear-gradient(90deg, var(--red), var(--red-light));
        margin: -14px -12px 12px;
        border-radius: 0;
      }

      .filter-container label {
        display: block;
        margin-top: 8px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--gray-500);
      }

      .filter-container select {
        width: 100%;
        margin-top: 4px;
        padding: 7px 10px;
        font-size: 0.85rem;
        font-family: var(--font);
        border: 1.5px solid var(--gray-200);
        border-radius: var(--radius-md);
        background: var(--gray-50);
        color: var(--gray-800);
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236c757d' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;
        cursor: pointer;
        transition: border-color 0.18s var(--ease-in-out),
                    box-shadow 0.18s var(--ease-in-out),
                    background 0.18s var(--ease-in-out);
        outline: none;
      }

      .filter-container select:hover:not(:disabled) {
        border-color: var(--red-border);
        background-color: var(--white);
      }

      .filter-container select:focus {
        border-color: var(--red);
        box-shadow: 0 0 0 3px var(--red-shadow);
        background-color: var(--white);
      }

      .filter-container select:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      /* ─── Anzeigen Button ─── */
      #filter-button {
        width: 100%;
        margin-top: 10px;
        padding: 9px 16px;
        font-size: 0.87rem;
        font-family: var(--font);
        font-weight: 600;
        color: var(--white);
        background: var(--red);
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: background 0.18s var(--ease-in-out),
                    transform 0.12s var(--ease-in-out),
                    box-shadow 0.18s var(--ease-in-out);
      }

      #filter-button::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%);
        pointer-events: none;
      }

      #filter-button:hover {
        background: var(--red-light);
        box-shadow: var(--shadow-red);
        transform: translateY(-1px);
      }

      #filter-button:active {
        transform: translateY(0);
        box-shadow: none;
      }

      /* ─── Erhebungsübersicht Button ─── */
      .info-toggle-btn {
        width: 100%;
        margin-top: 8px;
        padding: 7px 12px;
        font-size: 0.8rem;
        font-family: var(--font);
        font-weight: 600;
        color: var(--red);
        background: transparent;
        border: 1.5px solid var(--red-border);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: background 0.18s, border-color 0.18s, color 0.18s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .info-toggle-btn:hover {
        background: var(--red-bg);
        border-color: var(--red);
      }

      /* ═══════════════════════════════════════════════════
         PLZ TABLE
      ═══════════════════════════════════════════════════ */
      .table-container {
        margin-top: 10px;
        background: var(--white);
        border-radius: var(--radius-lg);
        border: 1px solid var(--gray-200);
        box-shadow: var(--shadow-xs);
        font-family: var(--font);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        padding: 0;
        transition: box-shadow 0.2s;
      }

      .table-container:hover {
        box-shadow: var(--shadow-sm);
      }

      .table-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        transition: transform 0.32s var(--ease-out);
        overflow: hidden;
      }

      .table-scroll {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        scrollbar-width: thin;
        scrollbar-color: var(--red) var(--gray-100);
      }

      .table-scroll::-webkit-scrollbar { width: 5px; }
      .table-scroll::-webkit-scrollbar-track { background: var(--gray-100); }
      .table-scroll::-webkit-scrollbar-thumb {
        background: var(--red);
        border-radius: 10px;
      }

      .table-container table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }

      .table-container thead {
        position: sticky;
        top: 0;
        z-index: 2;
      }

      .table-container th {
        background: var(--red);
        color: var(--white);
        padding: 8px 10px;
        text-align: left;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        white-space: pre-line;
        border-bottom: none;
        cursor: pointer;
        user-select: none;
        transition: background 0.15s;
      }

      .table-container th:hover { background: var(--red-dark); }

      .table-container td {
        padding: 7px 10px;
        border-bottom: 1px solid var(--gray-100);
        text-align: left;
        font-size: 0.8rem;
        color: var(--gray-700);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: background 0.12s;
      }

      .table-container tbody tr {
        transition: background 0.12s;
        cursor: pointer;
      }

      .table-container tbody tr:hover td {
        background: var(--red-bg);
        color: var(--gray-900);
      }

      .table-row-selected td {
        background: #fff3f3 !important;
        border-left: 3px solid var(--red);
      }

      /* ─── Streuverlust Footer ─── */
      #streuverlust-box {
        flex-shrink: 0;
        background: var(--red-bg);
        border-top: 2px solid var(--red);
        padding: 8px 12px;
        font-size: 0.8rem;
        color: var(--gray-700);
      }

      #streuverlust-box strong { color: var(--red); }

      /* ═══════════════════════════════════════════════════
         NL INFO TABLE (fährt von unten hoch)
      ═══════════════════════════════════════════════════ */
      #nl-info-container {
        position: absolute;
        left: 0; right: 0; bottom: 0;
        height: 62%;
        max-height: 72%;
        background: var(--white);
        border-top: 2px solid var(--red);
        box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
        transform: translateY(102%);
        opacity: 0;
        transition: transform 0.36s var(--ease-out), opacity 0.28s ease;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 10;
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      }

      #nl-info-container.show {
        transform: translateY(0);
        opacity: 1;
      }

      .nl-info-scroll {
        flex: 1; min-height: 0; overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--red) var(--gray-100);
      }

      .nl-info-scroll::-webkit-scrollbar { width: 5px; }
      .nl-info-scroll::-webkit-scrollbar-thumb { background: var(--red); border-radius: 10px; }

      .nl-info-table {
        width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 0.78rem;
      }

      .nl-info-table th {
        background: var(--red);
        color: white; padding: 8px 8px;
        position: sticky; top: 0; z-index: 2;
        white-space: pre-line;
        border-right: 1px solid rgba(255,255,255,0.2);
        font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
      }

      .nl-info-table td {
        padding: 6px 8px;
        border-bottom: 1px solid var(--gray-100);
        border-right: 1px solid var(--gray-100);
        font-size: 0.78rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        color: var(--gray-700);
        transition: background 0.12s;
      }

      .nl-info-row { cursor: pointer; transition: background 0.12s; }
      .nl-info-row:hover td { background: var(--red-bg); }
      .nl-info-row.table-row-selected td {
        background: #fff3f3;
        border-left: 3px solid var(--red);
      }

      .nl-col-nl   { width: 30px; }
      .nl-col-jahr { width: 70px; }
      .nl-col-erf  { width: 58px; }
      .nl-col-pct1 { width: 30px; }
      .nl-col-val  { width: 55px; }
      .nl-col-pct2 { width: 30px; }
      .nl-col-abd  { width: 55px; }

      .filter-container.nl-info-active .table-wrapper {
        transform: translateY(-102%);
        transition: transform 0.36s var(--ease-out);
      }

      /* ═══════════════════════════════════════════════════
         MAP CONTAINER
      ═══════════════════════════════════════════════════ */
      .map-container {
        width: 70%;
        height: 100%;
        position: relative;
        z-index: 10;
      }

      #map {
        height: 100%;
        width: 100%;
        background: #e8ecf0;
      }

      /* ─── Loading Spinner ─── */
      .spinner {
        width: 42px; height: 42px;
        border: 3px solid rgba(180,24,33,0.15);
        border-top: 3px solid var(--red);
        border-radius: 50%;
        animation: spin 0.9s linear infinite;
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2000;
      }

      @keyframes spin {
        0%   { transform: translate(-50%,-50%) rotate(0deg); }
        100% { transform: translate(-50%,-50%) rotate(360deg); }
      }

      #loading-spinner.hidden { display: none; }

      /* ─── Note Labels ─── */
      .note-label {
        background: rgba(255,255,255,0.92);
        border: 1px solid var(--gray-300);
        padding: 2px 7px;
        font-size: 10px;
        color: var(--gray-700);
        border-radius: 4px;
        font-family: var(--font);
        box-shadow: var(--shadow-xs);
        backdrop-filter: blur(4px);
      }

      /* ═══════════════════════════════════════════════════
         RADIUS SLIDER
      ═══════════════════════════════════════════════════ */
      #radius-slider-container {
        position: absolute;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--white);
        padding: 7px 14px;
        border-radius: 100px;
        box-shadow: var(--shadow-md);
        font-size: 13px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        border: 1px solid var(--gray-200);
        animation: slideDown 0.4s var(--ease-out);
      }

      @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-12px); opacity: 0; }
        to   { transform: translateX(-50%) translateY(0); opacity: 1; }
      }

      #radius-slider-container label {
        color: var(--gray-600);
        font-size: 0.8rem;
        font-weight: 500;
        white-space: nowrap;
      }

      #radius-value {
        color: var(--red);
        font-weight: 700;
        min-width: 24px;
        display: inline-block;
        text-align: right;
      }

      #radius-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 110px;
        height: 4px;
        border-radius: 2px;
        background: linear-gradient(90deg, var(--red) 0%, var(--gray-200) 0%);
        cursor: pointer;
        outline: none;
        transition: background 0.1s;
      }

      #radius-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px; height: 16px;
        border-radius: 50%;
        background: var(--white);
        border: 2.5px solid var(--red);
        box-shadow: 0 1px 4px rgba(0,0,0,0.18);
        cursor: pointer;
        transition: transform 0.15s var(--ease-out), box-shadow 0.15s;
      }

      #radius-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px var(--red-shadow);
      }

      #radius-slider::-moz-range-thumb {
        width: 16px; height: 16px;
        border-radius: 50%;
        background: var(--white);
        border: 2.5px solid var(--red);
        cursor: pointer;
      }

      /* ═══════════════════════════════════════════════════
         MAP BUTTONS (Tiles + Legend)
      ═══════════════════════════════════════════════════ */
      #map-tile-toggle-btn,
      #legend-toggle-btn {
        position: absolute;
        width: 40px; height: 40px;
        background: var(--white);
        border-radius: 50%;
        box-shadow: var(--shadow-md);
        cursor: pointer;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1.5px solid var(--gray-200);
        transition: transform 0.18s var(--ease-out),
                    box-shadow 0.18s,
                    border-color 0.18s;
      }

      #map-tile-toggle-btn:hover,
      #legend-toggle-btn:hover {
        transform: scale(1.1);
        box-shadow: var(--shadow-lg);
        border-color: var(--red);
      }

      #map-tile-toggle-btn:active,
      #legend-toggle-btn:active {
        transform: scale(0.96);
      }

      #map-tile-toggle-btn {
        bottom: 24px; right: 14px;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23b41821" viewBox="0 0 24 24"><path d="M3 6.5l6-2 6 2 6-2v13l-6 2-6-2-6 2v-13zm6 0v11l4 1.3v-11l-4-1.3zm10 0l-4 1.3v11l4-1.3v-11zm-14 0v11l4-1.3v-11l-4 1.3z"/></svg>');
        background-size: 55%;
        background-repeat: no-repeat;
        background-position: center;
      }

      #legend-toggle-btn {
        bottom: 70px; right: 14px;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23b41821" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="2" rx="1"/><rect x="4" y="11" width="12" height="2" rx="1"/><rect x="4" y="17" width="8" height="2" rx="1"/></svg>');
        background-size: 55%;
        background-repeat: no-repeat;
        background-position: center;
      }

      /* ═══════════════════════════════════════════════════
         HEATMAP LEGEND
      ═══════════════════════════════════════════════════ */
      #heatmap-legend {
        position: absolute;
        bottom: 118px; right: 12px;
        background: rgba(255,255,255,0.97);
        border: 1.5px solid var(--gray-200);
        border-radius: var(--radius-lg);
        padding: 12px 14px;
        width: 200px;
        max-height: 290px;
        overflow-y: auto;
        font-size: 11.5px;
        font-family: var(--font);
        z-index: 9998;
        box-shadow: var(--shadow-lg);
        pointer-events: none;
        opacity: 1;
        transform-origin: bottom right;
        transition: opacity 0.22s ease, transform 0.22s var(--ease-out), visibility 0.22s;
      }

      #heatmap-legend.hidden {
        opacity: 0;
        transform: scale(0.94);
        visibility: hidden;
      }

      #heatmap-legend strong {
        font-size: 0.72rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--gray-500);
        font-weight: 700;
        display: block;
        margin-bottom: 8px;
      }

      .heatmap-legend-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
        color: var(--gray-700);
      }

      .heatmap-legend-color {
        width: 18px; height: 11px;
        border-radius: 3px;
        border: 1px solid rgba(0,0,0,0.08);
        flex-shrink: 0;
      }

      /* ═══════════════════════════════════════════════════
         POPUPS (WK + Umsatz)
      ═══════════════════════════════════════════════════ */
      .side-popup {
        position: absolute;
        right: 0; top: 0;
        width: 26%;
        height: 72%;
        background: var(--white);
        border-left: 3px solid var(--red);
        border-top-left-radius: var(--radius-xl);
        border-bottom-left-radius: var(--radius-xl);
        padding: 0;
        font-family: var(--font);
        box-sizing: border-box;
        overflow-y: auto;
        z-index: 99999;
        box-shadow: -4px 0 24px rgba(0,0,0,0.12);
        scrollbar-width: thin;
        scrollbar-color: var(--red) var(--gray-100);

        opacity: 0;
        transform: translateX(16px);
        transition: opacity 0.28s ease,
                    transform 0.28s var(--ease-out);
      }

      .side-popup::-webkit-scrollbar { width: 5px; }
      .side-popup::-webkit-scrollbar-thumb { background: var(--red); border-radius: 10px; }

      .side-popup.show {
        opacity: 1;
        transform: translateX(0);
      }

      .side-popup.hidden {
        opacity: 0;
        transform: translateX(16px);
        pointer-events: none;
      }

      /* Popup Header */
      .popup-header-strip {
        background: linear-gradient(135deg, var(--red) 0%, var(--red-light) 100%);
        color: white;
        padding: 12px 14px 10px;
        border-radius: var(--radius-xl) 0 0 0;
        position: relative;
      }

      .popup-header-strip .popup-location {
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        opacity: 0.8;
        margin-bottom: 2px;
      }

      .popup-header-strip .popup-title {
        font-size: 1rem;
        font-weight: 700;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding-right: 32px;
      }

      /* Close btn */
      .side-popup .close-btn {
        position: absolute;
        top: 10px; right: 10px;
        width: 26px; height: 26px;
        background: rgba(255,255,255,0.2);
        color: white;
        border: 1.5px solid rgba(255,255,255,0.35);
        border-radius: 50%;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, transform 0.15s;
        line-height: 1;
      }

      .side-popup .close-btn:hover {
        background: rgba(255,255,255,0.35);
        transform: scale(1.1);
      }

      /* Popup table */
      .side-popup table {
        width: 100%;
        table-layout: fixed;
        border-collapse: collapse;
        margin: 0;
      }

      .side-popup th {
        background: var(--red);
        color: white;
        font-weight: 600;
        padding: 7px 12px;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        border: none;
        font-size: 0.8rem;
      }

      .side-popup th.subtitle-cell {
        background: var(--gray-50);
        color: var(--gray-600);
        font-weight: 600;
        font-size: 0.72rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        border-bottom: 1px solid var(--gray-200);
      }

      .side-popup td {
        font-size: 0.82rem;
        padding: 6px 12px;
        color: var(--gray-700);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        border: none;
        border-bottom: 1px solid var(--gray-100);
        transition: background 0.1s;
      }

      .side-popup tbody tr:hover td { background: var(--red-bg); }

      .side-popup td.label-cell { width: 62%; text-align: left; color: var(--gray-600); font-weight: 500; }
      .side-popup td.value-cell { width: 38%; text-align: right; font-weight: 700; color: var(--gray-800); font-variant-numeric: tabular-nums; }

      .side-popup .section-title {
        background: var(--gray-50);
        color: var(--gray-500);
        font-weight: 700;
        font-size: 0.68rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 6px 12px;
        border-top: 1px solid var(--gray-200);
        border-bottom: 1px solid var(--gray-200);
      }

      /* ═══════════════════════════════════════════════════
         UMSATZ POPUP
      ═══════════════════════════════════════════════════ */
      #side-popup-umsatz {
        position: absolute;
        right: 0; top: 0;
        width: 26%;
        height: 72%;
        background: var(--white);
        border-left: 3px solid var(--red);
        border-top-left-radius: var(--radius-xl);
        border-bottom-left-radius: var(--radius-xl);
        box-sizing: border-box;
        overflow-y: auto;
        z-index: 99999;
        box-shadow: -4px 0 24px rgba(0,0,0,0.12);
        scrollbar-width: thin;
        scrollbar-color: var(--red) var(--gray-100);
        opacity: 0;
        transform: translateX(16px);
        transition: opacity 0.28s ease, transform 0.28s var(--ease-out);
      }

      #side-popup-umsatz::-webkit-scrollbar { width: 5px; }
      #side-popup-umsatz::-webkit-scrollbar-thumb { background: var(--red); border-radius: 10px; }

      #side-popup-umsatz.show {
        opacity: 1;
        transform: translateX(0);
      }

      #side-popup-umsatz .popup-header {
        background: linear-gradient(135deg, var(--red) 0%, var(--red-light) 100%);
        color: white;
        padding: 12px 14px 10px;
        font-size: 0.97rem;
        font-weight: 700;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-radius: var(--radius-xl) 0 0 0;
        line-height: 1.3;
      }

      #side-popup-umsatz .popup-header .close-btn {
        position: static;
        flex-shrink: 0;
        width: 26px; height: 26px;
        background: rgba(255,255,255,0.2);
        color: white;
        border: 1.5px solid rgba(255,255,255,0.35);
        border-radius: 50%;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, transform 0.15s;
        margin-left: 8px;
        margin-top: 2px;
      }

      #side-popup-umsatz .popup-header .close-btn:hover {
        background: rgba(255,255,255,0.35);
        transform: scale(1.1);
      }

      .umsatz-subheader {
        padding: 12px 14px 6px;
        font-size: 0.87rem;
        line-height: 1.55;
        background: var(--red-bg);
        border-bottom: 1px solid var(--red-border);
      }

      .umsatz-subheader .strong { font-weight: 700; color: var(--gray-900); }

      .section-title {
        margin: 0;
        padding: 6px 14px;
        background: var(--gray-50);
        border-top: 1px solid var(--gray-200);
        border-bottom: 1px solid var(--gray-200);
        font-weight: 700;
        font-size: 0.68rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--gray-500);
      }

      .umsatz-grid {
        display: grid;
        grid-template-columns: 1.3fr 0.9fr 0.9fr;
        gap: 5px 10px;
        padding: 8px 14px;
        align-items: center;
      }

      .umsatz-grid .label {
        font-weight: 500;
        color: var(--gray-600);
        font-size: 0.82rem;
      }

      .umsatz-grid .value {
        text-align: right;
        font-weight: 700;
        color: var(--gray-800);
        font-size: 0.82rem;
        font-variant-numeric: tabular-nums;
      }

      /* Umsatz bar */
      .umsatz-bar {
        height: 10px;
        border-radius: 5px;
        overflow: hidden;
        display: flex;
        margin: 6px 14px;
        background: var(--gray-100);
      }

      .umsatz-bar > div { transition: width 0.5s var(--ease-out); }

      .share-stationaer { background: var(--red); }
      .share-pluscard   { background: #1f78b4; }
      .share-ra         { background: #33a02c; }
      .share-online     { background: #ffb000; }

      .umsatz-legend {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        padding: 4px 14px 10px;
        font-size: 0.78rem;
        color: var(--gray-600);
      }

      .umsatz-legend > span { display: flex; align-items: center; gap: 4px; }

      .disabled-cell { opacity: 0.3; filter: grayscale(1); }

      /* ═══════════════════════════════════════════════════
         MAP CONTROL PANEL
      ═══════════════════════════════════════════════════ */
      #map-control-panel {
        position: absolute;
        right: 0; bottom: 0;
        width: 26%;
        height: 25%;
        max-height: 58%;
        overflow-y: auto;
        background: rgba(255,255,255,0.97);
        backdrop-filter: blur(8px);
        border-left: 1px solid var(--gray-200);
        border-top: 1px solid var(--gray-200);
        border-top-left-radius: var(--radius-xl);
        padding: 14px;
        box-sizing: border-box;
        font-family: var(--font);
        z-index: 20;
        display: flex;
        flex-direction: column;
        gap: 12px;
        transition: height 0.32s var(--ease-out);
        box-shadow: -2px -2px 16px rgba(0,0,0,0.08);
        scrollbar-width: thin;
        scrollbar-color: var(--red) var(--gray-100);
      }

      #map-control-panel.panel-large  { height: 58%; }
      #map-control-panel.panel-medium { height: 30%; }

      /* Panel top accent line */
      #map-control-panel::before {
        content: '';
        display: block;
        position: absolute;
        top: 0; left: 24px; right: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--red), transparent);
        border-radius: 0 0 2px 2px;
        pointer-events: none;
      }

      .panel-card {
        background: var(--white);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-lg);
        padding: 12px;
        box-shadow: var(--shadow-xs);
        display: flex;
        flex-direction: column;
        gap: 10px;
        animation: panelCardIn 0.3s var(--ease-out) both;
      }

      @keyframes panelCardIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .panel-title {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--gray-400);
        margin-bottom: 2px;
      }

      /* Switch Buttons */
      .switch-row { display: flex; gap: 6px; }

      .switch-btn {
        flex: 1;
        padding: 8px 10px;
        border-radius: var(--radius-md);
        border: 1.5px solid var(--gray-200);
        background: var(--white);
        color: var(--gray-600);
        font-weight: 600;
        font-size: 0.83rem;
        font-family: var(--font);
        cursor: pointer;
        transition: all 0.18s var(--ease-in-out);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
      }

      .switch-btn:hover:not(.active) {
        border-color: var(--red-border);
        background: var(--red-bg);
        color: var(--red);
      }

      .switch-btn.active {
        background: var(--red);
        border-color: var(--red);
        color: var(--white);
        box-shadow: 0 2px 8px var(--red-shadow);
      }

      .option-row {
        display: flex;
        gap: 10px;
        font-size: 0.82rem;
        color: var(--gray-600);
        align-items: center;
      }

      .option-row label {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }

      .option-row input[type=checkbox] {
        accent-color: var(--red);
        cursor: pointer;
        width: 14px; height: 14px;
      }

      /* Compact Switch (Segmented) */
      .compact-switch {
        display: flex;
        background: var(--gray-100);
        border-radius: var(--radius-md);
        padding: 3px;
        gap: 2px;
        cursor: pointer;
        user-select: none;
        border: 1px solid var(--gray-200);
      }

      .compact-switch span {
        flex: 1;
        text-align: center;
        padding: 5px 4px;
        font-size: 0.76rem;
        font-weight: 600;
        border-radius: 5px;
        transition: all 0.18s var(--ease-in-out);
        color: var(--gray-500);
      }

      .compact-switch span:hover { color: var(--red); }

      .compact-switch.active-left .mode-left {
        background: var(--white);
        color: var(--red);
        box-shadow: var(--shadow-xs);
      }

      .compact-switch.active-right .mode-right {
        background: var(--white);
        color: var(--red);
        box-shadow: var(--shadow-xs);
      }

      .switch-label {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--gray-400);
        margin-bottom: 1px;
      }

      /* Big Checkbox */
      .big-check {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 6px 10px;
        border: 1.5px solid var(--gray-200);
        border-radius: var(--radius-md);
        background: var(--white);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: border-color 0.18s, background 0.18s;
        color: var(--gray-700);
      }

      .big-check:hover {
        border-color: var(--red-border);
        background: var(--red-bg);
      }

      .big-check input {
        transform: scale(1.2);
        accent-color: var(--red);
      }

      /* Triple Switch */
      .triple-switch {
        display: flex;
        background: var(--gray-100);
        border-radius: var(--radius-md);
        padding: 3px;
        gap: 2px;
        user-select: none;
        border: 1px solid var(--gray-200);
      }

      .triple-switch span {
        flex: 1;
        text-align: center;
        padding: 5px 2px;
        font-size: 0.74rem;
        font-weight: 600;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.18s var(--ease-in-out);
        color: var(--gray-500);
      }

      .triple-switch span.active {
        background: var(--white);
        color: var(--red);
        box-shadow: var(--shadow-xs);
      }

      .triple-switch span.disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }

      /* Category Grid */
      .category-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5px;
      }

      .category-toggle {
        padding: 7px 8px;
        border-radius: var(--radius-md);
        border: 1.5px solid var(--gray-200);
        background: var(--white);
        color: var(--gray-600);
        font-size: 0.78rem;
        font-weight: 600;
        font-family: var(--font);
        text-align: center;
        cursor: pointer;
        transition: all 0.18s var(--ease-in-out);
      }

      .category-toggle:hover:not(.active) {
        border-color: var(--red-border);
        background: var(--red-bg);
        color: var(--red);
      }

      .category-toggle.active {
        background: var(--red-bg);
        border-color: var(--red);
        color: var(--red);
        font-weight: 700;
        box-shadow: 0 0 0 3px var(--red-shadow);
      }

      /* ═══════════════════════════════════════════════════
         CINEMATIC LOADER (light version)
      ═══════════════════════════════════════════════════ */
      #cinematic-loader {
        position: absolute;
        inset: 0;
        z-index: 99999;
        background: rgba(255,255,255,0.96);
        backdrop-filter: blur(6px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: var(--font);
        animation: loaderFadeIn 0.25s ease;
      }

      @keyframes loaderFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      #cinematic-loader .loader-logo {
        width: 64px; height: 64px;
        margin-bottom: 28px;
        position: relative;
      }

      #cinematic-loader .loader-logo::before {
        content: '';
        position: absolute; inset: 0;
        border-radius: 50%;
        border: 3px solid rgba(180,24,33,0.12);
        border-top-color: var(--red);
        border-right-color: var(--red);
        animation: spinSlow 1.6s linear infinite;
      }

      #cinematic-loader .loader-logo::after {
        content: '';
        position: absolute; inset: 10px;
        border-radius: 50%;
        border: 2px solid rgba(180,24,33,0.08);
        border-bottom-color: rgba(180,24,33,0.4);
        animation: spinFast 0.85s linear infinite reverse;
      }

      #cinematic-loader .loader-core {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 12px; height: 12px;
        border-radius: 50%;
        background: var(--red);
        box-shadow: 0 0 16px rgba(180,24,33,0.35);
        animation: corePulse 1.6s ease-in-out infinite;
      }

      @keyframes spinSlow  { to { transform: rotate(360deg); } }
      @keyframes spinFast  { to { transform: rotate(360deg); } }
      @keyframes corePulse {
        0%,100% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
        50%      { transform: translate(-50%,-50%) scale(1.35); opacity: 0.7; }
      }

      #cinematic-loader .loader-phase {
        color: var(--gray-700);
        font-size: 0.95rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        margin-bottom: 4px;
        min-height: 1.4em;
        text-align: center;
        transition: opacity 0.22s ease;
      }

      #cinematic-loader .loader-bar-track {
        width: 240px; height: 3px;
        background: var(--gray-200);
        border-radius: 2px;
        margin-top: 18px;
        overflow: hidden;
      }

      #cinematic-loader .loader-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--red), #e96a3a);
        border-radius: 2px;
        width: 0%;
        transition: width 0.48s var(--ease-in-out);
        box-shadow: 0 0 6px var(--red-shadow);
      }

      #cinematic-loader .loader-dots {
        display: flex;
        gap: 20px;
        margin-top: 22px;
      }

      #cinematic-loader .loader-dot {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        opacity: 0.25;
        transition: opacity 0.35s ease;
      }

      #cinematic-loader .loader-dot.active { opacity: 1; }
      #cinematic-loader .loader-dot.done   { opacity: 0.5; }

      #cinematic-loader .dot-circle {
        width: 8px; height: 8px;
        border-radius: 50%;
        background: var(--red);
        transition: transform 0.28s var(--ease-out), box-shadow 0.28s;
      }

      #cinematic-loader .loader-dot.active .dot-circle {
        transform: scale(1.5);
        box-shadow: 0 0 8px var(--red-shadow);
      }

      #cinematic-loader .dot-label {
        font-size: 0.62rem;
        color: var(--gray-400);
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        white-space: nowrap;
      }

      #cinematic-loader.fade-out {
        animation: loaderFadeOut 0.35s ease forwards;
      }

      @keyframes loaderFadeOut {
        to { opacity: 0; pointer-events: none; }
      }

      /* ═══════════════════════════════════════════════════
         UTILITY
      ═══════════════════════════════════════════════════ */
      .hidden { display: none; }

      /* Row entry animation for table */
      @keyframes rowFadeIn {
        from { opacity: 0; transform: translateX(-6px); }
        to   { opacity: 1; transform: translateX(0); }
      }

      .table-row-animated {
        animation: rowFadeIn 0.2s var(--ease-out) both;
      }
    </style>

    <div class="layout">

      <!-- ─── FILTER SIDEBAR ─── -->
      <div class="filter-container">

        <label for="erhebung-select">ErhebungsID</label>
        <select id="erhebung-select"></select>

        <label for="jahr-select">Jahr</label>
        <select id="jahr-select" disabled></select>

        <label for="nummer-select">Erhebungsnummer</label>
        <select id="nummer-select" disabled></select>

        <button id="filter-button">Anzeigen</button>

        <!-- PLZ Table -->
        <div class="table-container">
          <div class="table-wrapper" id="table-container">
            <div id="streuverlust-box"></div>
          </div>
          <div id="nl-info-container"></div>
        </div>

      </div>

      <!-- ─── MAP AREA ─── -->
      <div class="map-container">

        <div id="loading-spinner" class="spinner hidden"></div>

        <div id="radius-slider-container">
          <label>Radius: <span id="radius-value">40</span> km</label>
          <input type="range" id="radius-slider" min="10" max="100" value="40" step="5">
        </div>

        <div id="map-tile-toggle-btn" title="Kartenstil wechseln"></div>
        <div id="map"></div>
        <div id="legend-toggle-btn" title="Legende"></div>
        <div id="heatmap-legend" class="heatmap-legend hidden"></div>
        <div id="umsatz-overview" class="hidden"></div>

      </div>

      <!-- ─── POPUPS ─── -->
      <div id="side-popup" class="side-popup hidden"></div>
      <div id="side-popup-umsatz" class="side-popup hidden"></div>

    </div>

    <!-- ─── MAP CONTROL PANEL ─── -->
    <div id="map-control-panel">

      <div class="panel-card">
        <div class="panel-title">Analyse-Modus</div>

        <div class="switch-row">
          <button id="btn-wk" class="switch-btn active">📊 WK</button>
          <button id="btn-umsatz" class="switch-btn">💶 Umsatz</button>
        </div>

        <div id="wk-extra" class="option-row">
          <label><input type="checkbox" id="chk-doppelbestreuung" checked> Doppelbestreuung</label>
        </div>

        <div id="umsatz-options-row" class="option-row hidden">
          <label><input type="checkbox" id="chk-bestreuung"> 📍 Bestreuung</label>
        </div>
      </div>

      <div id="umsatz-panel" class="panel-card hidden">
        <div class="panel-title">Umsatz-Einstellungen</div>

        <div class="switch-label">Umsatztyp</div>
        <div id="umsatz-type-switch" class="compact-switch">
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
          <span class="mode-werbeanteil">Werbeanteil</span>
        </div>

        <div class="category-grid">
          <div class="category-toggle active" data-cat="stationaer">🏬 Stationär</div>
          <div class="category-toggle"        data-cat="pluscard">💳 Pluscard</div>
          <div class="category-toggle"        data-cat="ra">📦 R&amp;A</div>
          <div class="category-toggle"        data-cat="online">🛒 KUBE OS</div>
        </div>
      </div>

    </div>
    `;

class GeoMapWidget extends HTMLElement {
  constructor() {
    super();
    this.neighbours = true;
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this.map = null;
    this._tileLayer = null;
    this._geoLayer = null;
    this._geoData = null;
    this._myDataSource = null;
    this._resizeObserver = null;
    this._geoLayerVisible = false;
    this._tilesVisible = false;
    this._sortState = { column: null, direction: "asc" };

    this.currentMapMode = "wk";
    this.activeCategories = new Set(["stationaer"]);
    this.umsatzMainMode = "gesamt";
    this.useWerbeUmsatz = true;
    this.useZusatzUmsatz = false;
    this.useRadiusFilter = true;
    this._selectedNLs = new Set();
  }

      connectedCallback() {
        this.showSpinner();

        if (!window.L) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => this.initializeMapBase();
          this._shadowRoot.appendChild(link);
          this._shadowRoot.appendChild(script);
        } else {
          this.initializeMapBase();
        }
      }

  showSpinner() {
    const spinner = this._shadowRoot.getElementById('loading-spinner');
    if (spinner) spinner.classList.remove('hidden');
  }

  hideSpinner() {
    const spinner = this._shadowRoot.getElementById('loading-spinner');
    if (spinner) spinner.classList.add('hidden');
  }

  buildErhebungsStruktur(data) {
    const struktur = {};
    data.forEach(row => {
      const erhID = row["dimension_erhebung_0"]?.id?.trim();
      const jahr = row["dimension_jahr_0"]?.id?.trim();
      const nummer = row["dimension_erhebungsnummer_0"]?.id?.trim();
      if (!erhID || erhID === "@NullMember" || !jahr || jahr === "@NullMember" || !nummer || nummer === "@NullMember") return;
      struktur[erhID] = struktur[erhID] || {};
      struktur[erhID][jahr] = struktur[erhID][jahr] || new Set();
      struktur[erhID][jahr].add(nummer);
    });
    return struktur;
  }

async loadGeoJson() {
  if (this._geoLayer) return;
  try {
    const response = await fetch("https://raw.githubusercontent.com/Benne2000/PLZAnalyse/main/PLZ.geojson");
    this._geoData = await response.json();
    this.geoNotes = {};
    (this._geoData.features || []).forEach(feature => {
      const plz = feature.properties?.plz?.trim();
      const note = feature.properties?.note?.trim();
      if (plz && note) this.geoNotes[plz] = note;
    });
    const filteredData = this.getFilteredData();
    const plzWerte = this.extractPLZWerte(filteredData);
    this._geoLayer = L.geoJSON(this._geoData, {
      style: feature => {
        const plz = feature.properties?.plz?.trim();
        const values = plzWerte[plz] || { wk: 0, wkPot: 0 };
        const isHZ = this.hzFlags?.[plz] ?? false;
        const value = isHZ ? values.wk : values.wkPot;
        return { fillColor: this.getColor(value, isHZ), weight: 1, opacity: 1, color: "white", fillOpacity: 0.5 };
      },
    }).addTo(this.map);
    this._layerByPLZ = {};
    this._geoLayer.eachLayer(layer => {
      const plz = String(layer.feature?.properties?.plz ?? "").padStart(5, "0");
      this._layerByPLZ[plz] = layer;
    });
  } catch (err) {
    console.error("Fehler beim Laden des GeoJSON:", err);
  }
}

applyMapMode(mode) {
  this.currentMapMode = mode;
  this.updateGeoLayer();
}

renderDataTable(data) {
  let entries = Object.entries(data || {});
  entries = entries.filter(([plz]) => plz !== "00000");
  if (this.plzImRadius && this.plzImRadius.size > 0) {
    entries = entries.filter(([plz]) => {
      const norm = String(plz).padStart(5, "0");
      return this.plzImRadius.has(norm);
    });
  }
  if (!this._sortState || this._sortState.column == null) {
    entries = entries.sort(([plzA], [plzB]) => plzA.localeCompare(plzB));
  }
  this.renderDataTableFromEntries(entries);
  this.updateStreuverlustFooter();
}

updateStreuverlustFooter() {
  const box = this._shadowRoot.getElementById("streuverlust-box");
  if (!box) return;
  if (!this.streuverlust) { box.innerHTML = ""; return; }
  box.innerHTML = `
    <span><strong>Streuverlust:</strong>
    ${this.streuverlust.umsatz.toLocaleString("de-DE")} €
    &nbsp;·&nbsp;
    ${(this.streuverlust.anteil * 100).toFixed(1)} %</span>
  `;
}

computeStreuverlust() {
  if (!this.filteredData) return;
  const result = { umsatz: 0, hzKosten: 0, umsatzErhebung: 0, kdErhebung: 0, auflage: 0, potHzAbs: 0, avg: { werbeverweigerer: 0, haushalte: 0, kaufkraft: 0 } };
  const avgArrays = { werbeverweigerer: [], haushalte: [], kaufkraft: [] };
  let totalErhebungUmsatz = 0;
  this.filteredData.forEach(row => {
    const nl = row["dimension_niederlassung_0"]?.id?.trim();
    const rawPLZ = row["dimension_plz_0"]?.id ?? row["dimension_plz_0"]?.raw;
    const plz = String(rawPLZ || "").padStart(5, "0");
    if (this._selectedNLs.size > 0 && !this._selectedNLs.has(nl)) return;
    totalErhebungUmsatz += row["value_hr_n_umsatz_0"]?.raw ?? 0;
    if (this.plzImRadius instanceof Set && this.plzImRadius.has(plz)) return;
    result.umsatz += row["value_hr_n_umsatz_0"]?.raw ?? 0;
    result.hzKosten += row["value_hz_kosten_0"]?.raw ?? 0;
    result.umsatzErhebung += row["value_ums_erhebung_0"]?.raw ?? 0;
    result.kdErhebung += row["value_kd_erhebung_0"]?.raw ?? 0;
    result.auflage += row["value_auflage_0"]?.raw ?? 0;
    result.potHzAbs += row["value_hz_potentiell_0"]?.raw ?? 0;
    const wv = row["value_werbeverweigerer_0"]?.raw;
    if (typeof wv === "number") avgArrays.werbeverweigerer.push(wv);
    const hh = row["value_haushalte_0"]?.raw;
    if (typeof hh === "number") avgArrays.haushalte.push(hh);
    const kk = row["value_kaufkraft_0"]?.raw;
    if (typeof kk === "number") avgArrays.kaufkraft.push(kk);
  });
  const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  result.avg.werbeverweigerer = avg(avgArrays.werbeverweigerer);
  result.avg.haushalte = avg(avgArrays.haushalte);
  result.avg.kaufkraft = avg(avgArrays.kaufkraft);
  result.anteil = totalErhebungUmsatz > 0 ? result.umsatz / totalErhebungUmsatz : 0;
  this.streuverlust = result;
}

sortTableByColumn(columnIndex) {
  if (this._sortState.column === columnIndex) {
    this._sortState.direction = this._sortState.direction === "asc" ? "desc" : "asc";
  } else {
    this._sortState.column = columnIndex;
    this._sortState.direction = "desc";
  }
  const dir = this._sortState.direction === "asc" ? 1 : -1;
  const entries = Object.entries(this.filteredKennwerte);
  const sorted = entries.sort(([plzA, a], [plzB, b]) => {
    let valA, valB;
    switch (columnIndex) {
      case 0: valA = plzA; valB = plzB; break;
      case 1: valA = this.geoNotes?.[plzA] || ""; valB = this.geoNotes?.[plzB] || ""; break;
      case 2: valA = this.hzFlags[plzA] ? 1 : 0; valB = this.hzFlags[plzB] ? 1 : 0; break;
      case 3: valA = a["value_hr_n_umsatz_0"]?.raw ?? -999999; valB = b["value_hr_n_umsatz_0"]?.raw ?? -999999; break;
      case 4: valA = a["value_wk_nachbar_0"]?.raw ?? -999999; valB = b["value_wk_nachbar_0"]?.raw ?? -999999; break;
    }
    if (typeof valA === "string") return valA.localeCompare(valB) * dir;
    return (valA - valB) * dir;
  });
  this.renderDataTableFromEntries(sorted);
}

renderDataTableFromEntries(entries) {
  const container = this._shadowRoot.getElementById('table-container');
  container.innerHTML = '';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.height = '100%';
  container.style.minHeight = '0';

  entries = entries.filter(([plz]) => plz !== "00000");
  if (this.plzImRadius && this.plzImRadius.size > 0) {
    entries = entries.filter(([plz]) => this.plzImRadius.has(plz));
  }

  if (!entries.length) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:24px;text-align:center;color:#adb5bd;font-size:0.85rem;';
    empty.textContent = 'Keine Daten vorhanden';
    container.appendChild(empty);
    const footer = document.createElement("div");
    footer.id = "streuverlust-box";
    container.appendChild(footer);
    return;
  }

  const scrollWrapper = document.createElement("div");
  scrollWrapper.classList.add("table-scroll");

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.tableLayout = 'fixed';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const headers = [
    { label: 'PLZ', width: '44px' },
    { label: 'Gemeinde', width: '88px' },
    { label: 'HZ', width: '22px' },
    { label: 'Netto-Umsatz\n(Jahr)', width: '58px' },
    { label: 'WK (%)', width: '46px' }
  ];

  headers.forEach(({ label, width }, i) => {
    const th = document.createElement('th');
    th.innerHTML = `${label} <span class="sort-icon" style="font-size:9px;opacity:0.7"></span>`;
    th.style.width = width;
    th.style.whiteSpace = 'pre-line';
    th.addEventListener('click', () => this.sortTableByColumn(i));
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  entries.forEach(([plz, kennwerte], idx) => {
    const tr = document.createElement('tr');
    tr.classList.add('table-row-animated');
    tr.style.animationDelay = `${Math.min(idx * 18, 200)}ms`;
    tr.style.cursor = "pointer";

    tr.addEventListener("click", () => {
      this.highlightMapArea(plz);
      this.openPopupFromTable(plz);
      this.highlightTableRow(tr);
    });

    let note = this.geoNotes?.[plz] || "";
    note = note.replace(/^\d{4,5}\s*[-–]?\s*/, "").trim() || "—";

    let symbol = "●";
    let symbolColor = "#adb5bd";
    if (this.filteredKennwerte[plz]?.isCritical) { symbol = "⚠"; symbolColor = "#f0a500"; }
    else if (this.filteredKennwerte[plz]?.isHZ)  { symbol = "●"; symbolColor = "#33a02c"; }
    else { symbol = "●"; symbolColor = "#dee2e6"; }

    const umsatz = kennwerte["value_hr_n_umsatz_0"]?.raw?.toLocaleString('de-DE') ?? '–';
    const wk = kennwerte["value_wk_in_percent_0"]?.raw?.toFixed(1) ?? '–';

    const rowValues = [
      { text: plz, style: 'font-variant-numeric:tabular-nums;font-size:0.78rem;color:#495057;' },
      { text: note, style: 'color:#6c757d;' },
      { html: `<span style="color:${symbolColor};font-size:10px" title="${this.filteredKennwerte[plz]?.isHZ ? 'Bestreut' : 'Nicht bestreut'}">${symbol}</span>`, style: 'text-align:center;' },
      { text: umsatz, style: 'text-align:right;font-variant-numeric:tabular-nums;' },
      { text: wk + ' %', style: 'text-align:right;font-variant-numeric:tabular-nums;' }
    ];

    rowValues.forEach(({ text, html, style }, i) => {
      const td = document.createElement('td');
      if (html) td.innerHTML = html;
      else td.textContent = text;
      if (style) td.style.cssText += style;
      td.style.width = headers[i].width;
      td.style.padding = '6px 8px';
      td.style.borderBottom = '1px solid #f1f3f5';
      td.style.fontSize = '0.8rem';
      td.style.whiteSpace = 'nowrap';
      td.style.overflow = 'hidden';
      td.style.textOverflow = 'ellipsis';
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  scrollWrapper.appendChild(table);
  container.appendChild(scrollWrapper);

  const footer = document.createElement("div");
  footer.id = "streuverlust-box";
  container.appendChild(footer);

  if (this._sortState?.column != null) this.updateSortIcons(this._sortState.column);
  this.updateStreuverlustFooter();
}

highlightTableRow(rowElement) {
  if (this._lastHighlightedRow) this._lastHighlightedRow.classList.remove("table-row-selected");
  rowElement.classList.add("table-row-selected");
  this._lastHighlightedRow = rowElement;
}

highlightTableRowByPLZ(plz) {
  const container = this._shadowRoot.getElementById("table-container");
  const rows = container.querySelectorAll("tbody tr");
  rows.forEach(row => {
    if (row.children[0]?.textContent?.trim() === plz) this.highlightTableRow(row);
  });
}

openPopupFromTable(plz) {
  if (!this._layerByPLZ) return;
  const targetLayer = this._layerByPLZ[plz];
  if (!targetLayer) return;
  const popupWK = this._shadowRoot.getElementById("side-popup");
  const popupUmsatz = this._shadowRoot.getElementById("side-popup-umsatz");
  popupWK?.classList.remove("show"); popupWK?.classList.add("hidden");
  popupUmsatz?.classList.remove("show"); popupUmsatz?.classList.add("hidden");
  if (this.currentMapMode === "umsatz-multi") {
    const values = this.filteredPLZWerte?.[plz];
    values ? this.showUmsatzPopup(plz, values) : this.showEmptyUmsatzPopup(plz);
    return;
  }
  const kennwerte = this.filteredKennwerte?.[plz] || {};
  this.showPopup(targetLayer.feature, kennwerte);
}

_buildDistanceCache() {
  if (!this._layerByPLZ || !this.nlMarkers || this.nlMarkers.length === 0) return;
  this._plzCenterCache = {};
  this._distanceCache = {};
  const plzList = Object.keys(this._layerByPLZ);
  for (let i = 0; i < plzList.length; i++) {
    const plz = plzList[i];
    const layer = this._layerByPLZ[plz];
    const center = layer.getBounds().getCenter();
    this._plzCenterCache[plz] = center;
    let minDist = Infinity;
    for (let j = 0; j < this.nlMarkers.length; j++) {
      const nl = this.nlMarkers[j];
      const d = this.getDistanceKm(center.lat, center.lng, nl.lat, nl.lng);
      if (d < minDist) minDist = d;
    }
    this._distanceCache[plz] = minDist;
  }
}

highlightMapArea(plz) {
  if (!this._layerByPLZ) return;
  const targetLayer = this._layerByPLZ[plz];
  if (!targetLayer) return;
  if (this._lastHighlightedLayer) this._lastHighlightedLayer.setStyle(this._lastHighlightedStyle);
  this._lastHighlightedStyle = { weight: targetLayer.options.weight, color: targetLayer.options.color, fillOpacity: targetLayer.options.fillOpacity };
  targetLayer.setStyle({ weight: 3, color: "#f0a500", fillOpacity: targetLayer.options.fillOpacity });
  this._lastHighlightedLayer = targetLayer;
}

updateSortIcons(activeIndex) {
  const headerCells = this._shadowRoot.querySelectorAll("th .sort-icon");
  headerCells.forEach((icon, i) => {
    icon.textContent = i === activeIndex ? (this._sortState.direction === "asc" ? "▲" : "▼") : "";
  });
}

zoomToFilteredPLZ() {
  if (!this._geoLayer || !this.plzImRadius || this.plzImRadius.size === 0) return;
  const bounds = L.latLngBounds([]);
  this._geoLayer.eachLayer(layer => {
    const plz = String(layer.feature?.properties?.plz ?? "").padStart(5, "0");
    if (this.plzImRadius.has(plz)) {
      const lb = layer.getBounds?.();
      if (lb) bounds.extend(lb);
    }
  });
  if (bounds.isValid()) this.map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
}

initializeMapBase() {
  const $ = id => this._shadowRoot.getElementById(id);
  const mapContainer = $("map");
  if (!mapContainer) return;

  this.map = L.map(mapContainer).setView([49.4, 8.7], 7);
  this.currentMapMode = "wk";
  this.activePopupType = "wk";
  this.umsatzDarstellung = "abs";
  this.umsatzMainMode = "gesamt";
  this.useWerbeUmsatz = true;
  this.useZusatzUmsatz = false;
  this.activeCategories = new Set(["stationaer"]);
  this.showBestreuung = false;
  this.useRadiusFilter = true;

  this.filteredGroup   = L.layerGroup().addTo(this.map);
  this.neighbourGroup  = L.layerGroup().addTo(this.map);
  this.radiusGroup     = L.layerGroup().addTo(this.map);
  this.bestreuungGroup = L.layerGroup().addTo(this.map);

  this.render();
  this.initRadiusSlider();

  const panel = $("map-control-panel");
  const btnWK = $("btn-wk");
  const btnUmsatz = $("btn-umsatz");
  const umsatzPanel = $("umsatz-panel");
  const wkExtra = $("wk-extra");
  const umsatzOptionsRow = $("umsatz-options-row");
  const typeSwitch = $("umsatz-type-switch");
  const darstellungSwitch = $("umsatz-analysis-switch");
  const btnAbs = darstellungSwitch?.querySelector(".mode-abs");
  const btnHH  = darstellungSwitch?.querySelector(".mode-hh");
  const btnWA  = darstellungSwitch?.querySelector(".mode-werbeanteil");
  const werbeRow = $("werbe-options-row");
  const chkWerbe = $("chk-werbeumsatz");
  const chkMit   = $("chk-mitgekauft");
  const chkBestreuung = $("chk-bestreuung");
  const chkDoppel = $("chk-doppelbestreuung");
  this.showCritical = chkDoppel.checked;

  $("map-tile-toggle-btn")?.addEventListener("click", () => this.toggleMapTiles());
  $("legend-toggle-btn")?.addEventListener("click", () => $("heatmap-legend").classList.toggle("hidden"));

  btnWA?.classList.add("disabled");

  // Update radius slider track fill
  const updateSliderFill = (slider) => {
    if (!slider) return;
    const min = +slider.min, max = +slider.max, val = +slider.value;
    const pct = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(90deg, var(--red) ${pct}%, var(--gray-200) ${pct}%)`;
  };
  const radiusSlider = $("radius-slider");
  updateSliderFill(radiusSlider);

  btnWK?.addEventListener("click", () => {
    this.closeAllPopups();
    btnWK.classList.add("active"); btnUmsatz.classList.remove("active");
    this.currentMapMode = "wk"; this.activePopupType = "wk";
    wkExtra.style.display = ""; umsatzOptionsRow.classList.add("hidden");
    umsatzPanel.classList.add("hidden");
    panel.classList.remove("panel-large", "panel-medium");
    this.showCritical = chkDoppel.checked;
    this.umsatzDarstellung = "abs";
    darstellungSwitch.querySelectorAll("span").forEach(s => s.classList.remove("active"));
    btnAbs.classList.add("active");
    btnWA.classList.add("disabled");
    if (this._activeFilter) { this.prepareUmsatzPLZWerte(); this.computeWKKennwerte(); }
    this.updateGeoLayer(); this.updateHeatmapLegend();
  });

  btnUmsatz?.addEventListener("click", () => {
    typeSwitch.classList.add("active-left");
    btnUmsatz.classList.add("active"); btnWK.classList.remove("active");
    this.closeAllPopups();
    this.currentMapMode = "umsatz-multi"; this.activePopupType = "umsatz";
    if (this._activeFilter) { this.prepareUmsatzPLZWerte(); this.computeWKKennwerte(); }
    wkExtra.style.display = "none"; umsatzOptionsRow.classList.remove("hidden");
    umsatzPanel.classList.remove("hidden");
    panel.classList.remove("panel-medium"); panel.classList.add("panel-large");
    this.umsatzDarstellung = "abs";
    darstellungSwitch.querySelectorAll("span").forEach(s => s.classList.remove("active"));
    btnAbs.classList.add("active"); btnWA.classList.add("disabled");
    this.updateGeoLayer(); this.updateHeatmapLegend();
  });

  typeSwitch?.addEventListener("click", () => {
    const isWerbung = this.umsatzMainMode === "gesamt";
    this.umsatzMainMode = isWerbung ? "werbung" : "gesamt";
    typeSwitch.classList.toggle("active-right", isWerbung);
    typeSwitch.classList.toggle("active-left", !isWerbung);
    werbeRow.style.display = isWerbung ? "flex" : "none";
    if (isWerbung) {
      btnWA.classList.remove("disabled");
      this.useWerbeUmsatz = true; this.useZusatzUmsatz = false;
      chkWerbe.checked = true; chkMit.checked = false; chkMit.disabled = false;
    } else {
      btnWA.classList.add("disabled");
      this.umsatzDarstellung = "abs";
      darstellungSwitch.querySelectorAll("span").forEach(s => s.classList.remove("active"));
      btnAbs.classList.add("active");
    }
    this._refreshAll();
  });

  chkWerbe?.addEventListener("change", () => {
    this.useWerbeUmsatz = chkWerbe.checked;
    if (!this.useWerbeUmsatz && !this.useZusatzUmsatz) { this.useWerbeUmsatz = true; chkWerbe.checked = true; }
    this._refreshAll();
  });

  chkMit?.addEventListener("change", () => {
    this.useZusatzUmsatz = chkMit.checked;
    if (!this.useWerbeUmsatz && !this.useZusatzUmsatz) { this.useWerbeUmsatz = true; chkWerbe.checked = true; }
    this._refreshAll();
  });

  btnAbs?.addEventListener("click", () => {
    this.umsatzDarstellung = "abs"; this.currentMapMode = "umsatz-multi"; this.activePopupType = "umsatz";
    darstellungSwitch.querySelectorAll("span").forEach(s => s.classList.remove("active"));
    btnAbs.classList.add("active"); this._refreshAll();
  });

  btnHH?.addEventListener("click", () => {
    this.umsatzDarstellung = "hh"; this.currentMapMode = "umsatz-multi"; this.activePopupType = "umsatz";
    darstellungSwitch.querySelectorAll("span").forEach(s => s.classList.remove("active"));
    btnHH.classList.add("active"); this._refreshAll();
  });

  btnWA?.addEventListener("click", () => {
    if (this.umsatzMainMode !== "werbung") return;
    this.umsatzDarstellung = "werbeanteil"; this.currentMapMode = "werbeanteil"; this.activePopupType = "umsatz";
    darstellungSwitch.querySelectorAll("span").forEach(s => s.classList.remove("active"));
    btnWA.classList.add("active");
    chkWerbe.checked = true; this.useWerbeUmsatz = true;
    chkMit.checked = false; chkMit.disabled = true; this.useZusatzUmsatz = false;
    this._refreshAll();
  });

  this._shadowRoot.querySelectorAll(".category-toggle").forEach(toggle => {
    toggle.addEventListener("click", () => {
      const cat = toggle.dataset.cat;
      if (!cat) return;
      if (this.activeCategories.has(cat)) { this.activeCategories.delete(cat); toggle.classList.remove("active"); }
      else { this.activeCategories.add(cat); toggle.classList.add("active"); }
      this.currentMapMode = "umsatz-multi"; this.activePopupType = "umsatz";
      this._refreshAll();
    });
  });

  chkDoppel?.addEventListener("change", () => {
    this.showCritical = chkDoppel.checked;
    this.updateGeoLayer(); this.updateHeatmapLegend();
  });

  chkBestreuung?.addEventListener("change", () => {
    this.showBestreuung = chkBestreuung.checked;
    this.updateBestreuungMarkers(); this.updateHeatmapLegend();
  });
}

updateBestreuungMarkers() {
  this.bestreuungGroup.clearLayers();
  if (!this.showBestreuung || !this._layerByPLZ) return;
  const plzList = Object.keys(this._layerByPLZ);
  for (let i = 0; i < plzList.length; i++) {
    const plz = plzList[i];
    const daten = this.filteredKennwerte?.[plz];
    if (!daten?.isHZ) continue;
    const layer = this._layerByPLZ[plz];
    const center = this._plzCenterCache?.[plz] ?? layer.getBounds().getCenter();
    const icon = L.divIcon({
      html: `<div style="background:#fff;border:2px solid #1565c0;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;color:#1565c0;box-shadow:0 2px 6px rgba(0,0,0,0.15)">H</div>`,
      className: "", iconSize: [22, 22], iconAnchor: [11, 11]
    });
    L.marker(center, { icon, interactive: false }).addTo(this.bestreuungGroup);
  }
}

initializeMapTiles() {
  if (!this.map) return;
  this._tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 19
  }).addTo(this.map);
}

removeMapTiles() {
  if (this.map && this._tileLayer) { this.map.removeLayer(this._tileLayer); this._tileLayer = null; }
}

toggleMapTiles() {
  if (this._tilesVisible) { this.removeMapTiles(); this._tilesVisible = false; }
  else { this.initializeMapTiles(); this._tilesVisible = true; }
}

toggleNeighbours() {
  if (this.map.hasLayer(this.neighbourGroup)) this.map.removeLayer(this.neighbourGroup);
  else this.map.addLayer(this.neighbourGroup);
}

createAllMarkers() {
  if (!this.filteredGroup) return;
  this.filteredGroup.clearLayers();
  this.neighbourGroup?.clearLayers();
  this.radiusGroup?.clearLayers();
  this.allMarkers = []; this.nlMarkers = [];
  if (!this.Niederlassung || !this.nlKoordinaten) return;
  const seen = new Set();
  Object.entries(this.Niederlassung).forEach(([nlKey, nlName]) => {
    const coords = this.nlKoordinaten[nlKey];
    if (!coords || seen.has(nlKey)) return;
    const marker = L.marker([coords.lat, coords.lon], { icon: this.createMarkerIcon(nlName), title: nlName, plzs: [nlKey] });
    marker.setZIndexOffset(1000);
    marker.on("click", () => this.toggleNLSelection(nlKey));
    this.allMarkers.push(marker);
    this.filteredGroup.addLayer(marker);
    this.nlMarkers.push({ lat: coords.lat, lng: coords.lon, marker });
    seen.add(nlKey);
  });
  if (Array.isArray(this.extraNLs)) {
    this.extraNLs.forEach(({ nl, lat, lon }) => {
      const marker = L.marker([lat, lon], { icon: this.createMarkerIcon(nl), title: nl, plzs: [nl] });
      marker.setZIndexOffset(1000);
      marker.on("click", () => this.toggleNLSelection(nl));
      this.allMarkers.push(marker);
      this.filteredGroup.addLayer(marker);
      this.nlMarkers.push({ lat, lng: lon, marker });
    });
  }
  this.allNLs = [...Object.keys(this.Niederlassung), ...(this.extraNLs?.map(e => e.nl) ?? [])];
  this._selectedNLs = new Set(this.allNLs);
  this.applyNLFilter([...this._selectedNLs]);
  const radius = Number(this._shadowRoot.getElementById("radius-slider")?.value ?? 0);
  this.applyRadiusFilter(radius);
  this.updateGeoLayer();
  this.updateNLSelectionUI?.();
  this._buildDistanceCache();
}

applyNLFilter(selectedNLs) {
  if (!this._selectedNLs) this._selectedNLs = new Set();
  this._selectedNLs = new Set(selectedNLs);
  if (!this.filteredData || this.filteredData.length === 0) return;
  this.filteredPLZs = this.filteredData
    .filter(row => {
      const nl = row["dimension_niederlassung_0"]?.id?.trim();
      return this._selectedNLs.size === 0 || this._selectedNLs.has(nl);
    })
    .map(row => row["dimension_plz_0"]?.id?.trim())
    .filter(plz => plz && plz !== "@NullMember");
  this.updateMarkers();
  this.computeWKKennwerte();
  const radius = Number(this._shadowRoot.getElementById("radius-slider").value);
  this.currentRadius = radius;
  this.applyRadiusFilter(radius);
  this.prepareUmsatzPLZWerte();
  this.computeStreuverlust();
}

createMarkerIcon(nl, isPhantom = false) {
  if (!this.iconCache) this.iconCache = {};
  const key = nl + (isPhantom ? "_phantom" : "_active");
  if (!this.iconCache[key]) {
    const color = isPhantom ? "#adb5bd" : "#b41821";
    const opacity = isPhantom ? 0.6 : 1;
    const shadow = isPhantom ? "none" : "-1px 2px 6px rgba(180,24,33,0.4)";
    const markerHtml = `
      <div style="
        width:30px;height:30px;
        background-color:${color};
        opacity:${opacity};
        border-radius:50% 50% 50% 0;
        box-shadow:${shadow};
        transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
        font-size:10px;font-weight:700;color:white;font-family:system-ui;">
        <div style="transform:rotate(45deg)">${nl}</div>
      </div>`;
    this.iconCache[key] = L.divIcon({ html: markerHtml, className: "", iconSize: [30, 30], iconAnchor: [15, 30] });
  }
  return this.iconCache[key];
}

showPopup(feature, daten) {
  const plz = String(feature.properties?.plz ?? "").padStart(5, "0").trim();
  const note = feature.properties?.note || "Keine Notiz";
  const popupUmsatz = this._shadowRoot.getElementById("side-popup-umsatz");
  if (popupUmsatz) { popupUmsatz.classList.remove("show"); popupUmsatz.classList.add("hidden"); }
  const panel = this._shadowRoot.getElementById("map-control-panel");
  panel.classList.remove("panel-large"); panel.classList.add("panel-medium");

  const umsatz = this.filteredPLZWerte?.[plz] || {};
  let symbol = "📍";
  if (daten?.isCritical) symbol = "⚠️";
  else if (daten?.isHZ) symbol = "✅";

  const beschreibungen = {
    value_hr_n_umsatz_0:    "Netto-Umsatz (Jahr)",
    value_umsatz_p_hh_0:    "Umsatz p. HH",
    value_wk_in_percent_0:  "Werbekosten (%)",
    value_wk_nachbar_0:     "WK (%) inkl. Nachb.",
    value_hz_kosten_0:      "HZ-Werbekosten",
    value_werbeverweigerer_0: "Werbeverweigerer (%)",
    value_haushalte_0:      "Haushalte",
    value_kaufkraft_0:      "BM-Kaufkraft-Idx",
    value_ums_erhebung_0:   "Umsatz",
    value_kd_erhebung_0:    "Anzahl Kunden",
    value_bon_erhebung_0:   "Ø-Bon",
    value_auflage_0:        "Auflage"
  };

  daten.value_umsatz_p_hh_0 = { raw: umsatz.umsatzProHaushalt ?? 0 };
  daten.value_haushalte_0   = { raw: umsatz.haushalte ?? 0 };
  const kd = daten.value_kd_erhebung_0?.raw ?? 0;
  const umsatzErhebung = daten.value_ums_erhebung_0?.raw ?? 0;
  daten.value_bon_erhebung_0 = { raw: kd > 0 ? Number((umsatzErhebung / kd).toFixed(2)) : 0 };

  let rows = "";
  Object.entries(beschreibungen).forEach(([id, label], index) => {
    const rawValue = daten?.[id]?.raw;
    const wert = typeof rawValue === "number" ? rawValue.toLocaleString("de-DE") : "–";
    if (index === 8) rows += `<tr><td colspan="2" class="section-title">Erhebungsdaten</td></tr>`;
    rows += `<tr><td class="label-cell">${label}</td><td class="value-cell">${wert}</td></tr>`;
  });

  const sidePopup = this._shadowRoot.getElementById("side-popup");
  sidePopup.innerHTML = `
    <div class="popup-header-strip">
      <div class="popup-location">PLZ ${plz}</div>
      <div class="popup-title" title="${note}">${symbol} ${note}</div>
      <button class="close-btn">✕</button>
    </div>
    <table>
      <thead>
        <tr><th colspan="2" class="subtitle-cell">Hochrechnung Jahr</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  // Bug fix: isHZ check was inverted in original
  const isNotHZ = daten?.isHZ === false;
  const umsatzJahr = daten?.value_hr_n_umsatz_0?.raw;
  if (isNotHZ && typeof umsatzJahr === "number" && umsatzJahr > 0) {
    const wkPotRaw = daten.value_wk_potentiell_0?.raw;
    const hzPotRaw = daten.value_hz_potentiell_0?.raw;
    const wkPot = typeof wkPotRaw === "number" ? wkPotRaw.toLocaleString("de-DE") : "–";
    const hzPot = typeof hzPotRaw === "number" ? hzPotRaw.toLocaleString("de-DE") : "–";
    sidePopup.insertAdjacentHTML("beforeend", `
      <table style="margin-top:0">
        <thead><tr><th colspan="2">Potentielle Bestreuung (100% HH)</th></tr></thead>
        <tbody>
          <tr><td class="label-cell">WK in %</td><td class="value-cell">${wkPot}</td></tr>
          <tr><td class="label-cell">HZ-Werbekosten</td><td class="value-cell">${hzPot}</td></tr>
        </tbody>
      </table>`);
  }

  sidePopup.classList.remove("hidden");
  void sidePopup.offsetWidth;
  sidePopup.classList.add("show");
  sidePopup.querySelector(".close-btn").onclick = () => {
    sidePopup.classList.remove("show");
    sidePopup.classList.add("hidden");
  };
}

showUmsatzPopup(plz, values) {
  const popup = this._shadowRoot.getElementById("side-popup-umsatz");
  const popupWK = this._shadowRoot.getElementById("side-popup");
  if (popupWK) { popupWK.classList.remove("show"); popupWK.classList.add("hidden"); }
  const panel = this._shadowRoot.getElementById("map-control-panel");
  panel.classList.remove("panel-large"); panel.classList.add("panel-medium");

  const isWerbungMode = this.umsatzMainMode === "werbung";
  const useWerbe = this.useWerbeUmsatz === true;
  const useZusatz = this.useZusatzUmsatz === true;
  const note = this.geoNotes?.[plz] || "Keine Notiz";

  const pickPair = (base, werb, zusatz, baseHH, werbHH, zusatzHH) => {
    if (!isWerbungMode) return { abs: base, hh: baseHH };
    let abs = 0, hh = 0;
    if (useWerbe)  { abs += werb;   hh += werbHH;  }
    if (useZusatz) { abs += zusatz; hh += zusatzHH; }
    return { abs, hh };
  };

  const st = pickPair(values.umsatz, values.umsatzWerbung, values.umsatzZusatz, values.umsatzProHaushalt, values.umsatzWerbungProHaushalt, values.umsatzZusatzProHaushalt);
  const pc = pickPair(values.pluscard, values.pluscardWerbung, values.pluscardZusatz, values.pluscardProHaushalt, values.pluscardWerbungProHaushalt, values.pluscardZusatzProHaushalt);
  const ra = pickPair(values.ra, values.raWerbung, values.raZusatz, values.raProHaushalt, values.raWerbungProHaushalt, values.raZusatzProHaushalt);
  const os = pickPair(values.onlineshop, values.onlineshopWerbung, values.onlineshopZusatz, values.onlineshopProHaushalt, values.onlineshopWerbungProHaushalt, values.onlineshopZusatzProHaushalt);

  const active = {
    stationaer: this.activeCategories.has("stationaer"),
    pluscard:   this.activeCategories.has("pluscard"),
    ra:         this.activeCategories.has("ra"),
    online:     this.activeCategories.has("online")
  };

  const totalAbs = (active.stationaer ? st.abs : 0) + (active.pluscard ? pc.abs : 0) + (active.ra ? ra.abs : 0) + (active.online ? os.abs : 0);
  const totalHH  = (active.stationaer ? st.hh  : 0) + (active.pluscard ? pc.hh  : 0) + (active.ra ? ra.hh  : 0) + (active.online ? os.hh  : 0);
  const hh = values.haushalte || 0;
  const totalNormalAbs = values.umsatz + values.pluscard + values.ra + values.onlineshop;
  const totalWerbeAbs  = values.umsatzWerbung + values.pluscardWerbung + values.raWerbung + values.onlineshopWerbung;
  const totalZusatzAbs = values.umsatzZusatz + values.pluscardZusatz + values.raZusatz + values.onlineshopZusatz;
  const anteilWerbeUmsatz = totalNormalAbs > 0 ? ((totalWerbeAbs / totalNormalAbs) * 100).toFixed(1) : "–";
  const fmtAbs = x => Number(x || 0).toLocaleString("de-DE");
  const fmtHH  = x => Number(x || 0).toFixed(2);
  const pct = (x, total) => total > 0 ? (x / total) * 100 : 0;

  const headerLabel = (() => {
    if (!isWerbungMode) return "Gesamtumsatz";
    if (useWerbe && useZusatz) return "Werbeumsatz + Mitgekauft";
    if (useWerbe) return "Werbeumsatz";
    return "Mitgekauft";
  })();

  popup.innerHTML = `
    <div class="popup-header">
      <span title="${note}" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${note}</span>
      <button class="close-btn" style="flex-shrink:0">✕</button>
    </div>

    <div class="umsatz-subheader">
      <span class="strong">${headerLabel}: ${fmtAbs(totalAbs)} €</span><br>
      <span style="font-size:0.8rem;color:#6c757d">
        ${fmtHH(totalHH)} € pro HH &nbsp;·&nbsp; Werbeanteil: ${anteilWerbeUmsatz}%
      </span>
    </div>

    <div class="umsatz-bar" style="margin:6px 14px">
      <div style="background:#b41821;width:${pct(totalNormalAbs,totalNormalAbs+totalWerbeAbs+totalZusatzAbs)}%;transition:width .5s ease"></div>
      <div style="background:#1f78b4;width:${pct(totalWerbeAbs,totalNormalAbs+totalWerbeAbs+totalZusatzAbs)}%;transition:width .5s ease"></div>
      <div style="background:#ffb000;width:${pct(totalZusatzAbs,totalNormalAbs+totalWerbeAbs+totalZusatzAbs)}%;transition:width .5s ease"></div>
    </div>
    <div class="umsatz-legend" style="padding:0 14px 8px">
      <span><span style="color:#b41821">⬤</span> Normal</span>
      <span><span style="color:#1f78b4">⬤</span> Werbung</span>
      <span><span style="color:#ffb000">⬤</span> Mitgekauft</span>
    </div>

    <div class="section-title">Haushalte</div>
    <div class="umsatz-grid" style="padding:8px 14px">
      <div class="label">Haushalte</div>
      <div class="value">${hh.toLocaleString("de-DE")}</div>
      <div class="value"></div>
    </div>

    <div class="section-title">Umsatz nach Kategorien</div>
    <div class="umsatz-grid" style="padding:6px 14px">
      <div class="label" style="font-weight:700;color:#343a40">Kategorie</div>
      <div class="value" style="font-weight:700;color:#343a40">Absolut</div>
      <div class="value" style="font-weight:700;color:#343a40">pro HH</div>

      <div class="label ${!active.stationaer ? "disabled-cell" : ""}">🏬 Stationär</div>
      <div class="value ${!active.stationaer ? "disabled-cell" : ""}">${fmtAbs(st.abs)} €</div>
      <div class="value ${!active.stationaer ? "disabled-cell" : ""}">${fmtHH(st.hh)} €</div>

      <div class="label ${!active.pluscard ? "disabled-cell" : ""}">💳 Pluscard</div>
      <div class="value ${!active.pluscard ? "disabled-cell" : ""}">${fmtAbs(pc.abs)} €</div>
      <div class="value ${!active.pluscard ? "disabled-cell" : ""}">${fmtHH(pc.hh)} €</div>

      <div class="label ${!active.ra ? "disabled-cell" : ""}">📦 R&amp;A</div>
      <div class="value ${!active.ra ? "disabled-cell" : ""}">${fmtAbs(ra.abs)} €</div>
      <div class="value ${!active.ra ? "disabled-cell" : ""}">${fmtHH(ra.hh)} €</div>

      <div class="label ${!active.online ? "disabled-cell" : ""}">🛒 KUBE OS</div>
      <div class="value ${!active.online ? "disabled-cell" : ""}">${fmtAbs(os.abs)} €</div>
      <div class="value ${!active.online ? "disabled-cell" : ""}">${fmtHH(os.hh)} €</div>
    </div>

    <div class="section-title">Umsatzanteile</div>
    <div class="umsatz-bar" style="margin:6px 14px">
      <div class="share-stationaer" style="width:${pct(values.umsatz,   totalNormalAbs)}%;transition:width .5s ease"></div>
      <div class="share-pluscard"   style="width:${pct(values.pluscard,  totalNormalAbs)}%;transition:width .5s ease"></div>
      <div class="share-ra"         style="width:${pct(values.ra,        totalNormalAbs)}%;transition:width .5s ease"></div>
      <div class="share-online"     style="width:${pct(values.onlineshop,totalNormalAbs)}%;transition:width .5s ease"></div>
    </div>
    <div class="umsatz-legend" style="padding:0 14px 12px">
      <span><span style="color:#b41821">⬤</span> Stationär</span>
      <span><span style="color:#1f78b4">⬤</span> Pluscard</span>
      <span><span style="color:#33a02c">⬤</span> R&amp;A</span>
      <span><span style="color:#ffb000">⬤</span> KUBE OS</span>
    </div>
  `;

  popup.classList.remove("hidden");
  void popup.offsetWidth;
  popup.classList.add("show");
  popup.querySelector(".close-btn").onclick = () => {
    popup.classList.remove("show");
    popup.classList.add("hidden");
  };
}

getUmsatzSumForPLZ(v) {
  const safe = x => Number.isFinite(x) ? x : 0;
  const isWerbungMode = this.umsatzMainMode === "werbung";
  const useWerbe = this.useWerbeUmsatz === true;
  const useZusatz = this.useZusatzUmsatz === true;
  const useHH = this.umsatzDarstellung === "hh";
  const pick = (base, werb, zusatz, baseHH, werbHH, zusatzHH) => {
    if (!isWerbungMode) return safe(useHH ? baseHH : base);
    let sum = 0;
    if (useWerbe)  sum += safe(useHH ? werbHH  : werb);
    if (useZusatz) sum += safe(useHH ? zusatzHH : zusatz);
    return sum;
  };
  let sum = 0;
  if (this.activeCategories.has("stationaer")) sum += pick(v.umsatz, v.umsatzWerbung, v.umsatzZusatz, v.umsatzProHaushalt, v.umsatzWerbungProHaushalt, v.umsatzZusatzProHaushalt);
  if (this.activeCategories.has("pluscard"))   sum += pick(v.pluscard, v.pluscardWerbung, v.pluscardZusatz, v.pluscardProHaushalt, v.pluscardWerbungProHaushalt, v.pluscardZusatzProHaushalt);
  if (this.activeCategories.has("ra"))         sum += pick(v.ra, v.raWerbung, v.raZusatz, v.raProHaushalt, v.raWerbungProHaushalt, v.raZusatzProHaushalt);
  if (this.activeCategories.has("online"))     sum += pick(v.onlineshop, v.onlineshopWerbung, v.onlineshopZusatz, v.onlineshopProHaushalt, v.onlineshopWerbungProHaushalt, v.onlineshopZusatzProHaushalt);
  return sum;
}

updateNeighbours(filteredData) {
  const filteredMarkers = filteredData.map(entry => createMarker(entry));
  this.neighbours = computeNeighbours(filteredMarkers);
}

extractPLZWerte(data) {
  const plzWerte = {};
  data.forEach(row => {
    const plz = row["dimension_plz_0"]?.id?.trim();
    if (!plz || plz === "@NullMember") return;
    const wk    = row["value_wk_in_percent_0"]?.raw;
    const wkPot = row["value_wk_potentiell_0"]?.raw;
    const hz    = row["dimension_hzflag_0"]?.id?.trim() === "X";
    plzWerte[plz] = {
      wk:    typeof wk    === "number" ? wk    : 0,
      wkPot: typeof wkPot === "number" ? wkPot : 0,
      hz
    };
  });
  return plzWerte;
}

getFilteredData() {
  if (!this._myDataSource || this._myDataSource.state !== "success") return [];
  const data = this._myDataSource.data;
  const { erhID, jahr, nummer } = this._activeFilter || {};
  const filteredKennwerte = {};
  const filtered = data.filter(row => {
    const id  = row["dimension_erhebung_0"]?.id?.trim();
    const y   = row["dimension_jahr_0"]?.id?.trim();
    const num = row["dimension_erhebungsnummer_0"]?.id?.trim();
    const rawPLZ = row["dimension_plz_0"]?.id ?? row["dimension_plz_0"]?.raw;
    const plz = String(rawPLZ).padStart(5, "0");
    const match = id === erhID && y === jahr && num === nummer;
    if (match && plz && plz !== "@NullMember") filteredKennwerte[plz] = row;
    return match;
  });
  this.filteredKennwerte = filteredKennwerte;
  return filtered;
}

getColor(value, isHZ) {
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;
  if (isHZ) {
    return safeValue > 25 ? "#e31a1c" : safeValue > 15 ? "#fd8d3c" : safeValue > 10 ? "#ffffb2" :
           safeValue > 5  ? "#78c679" : safeValue > 2  ? "#41ab5d" : safeValue > 0  ? "#006837" : "#cfd4da";
  }
  return safeValue > 50 ? "#cfd4da" : safeValue > 25 ? "#bdbdbd" : safeValue > 15 ? "#969696" :
         safeValue > 10 ? "#6baed6" : safeValue > 5  ? "#2171b5" : safeValue > 0  ? "#08306b" : "#cfd4da";
}

updateGeoLayer() {
  if (!this._geoLayer) return;
  this.computeMaxValue();
  const index = this._layerByPLZ;
  if (index) {
    const plzList = Object.keys(index);
    for (let i = 0; i < plzList.length; i++) this.applyStyleToLayer(index[plzList[i]]);
  } else {
    this._geoLayer.eachLayer(layer => this.applyStyleToLayer(layer));
  }
  this.updateBestreuungMarkers();
  this.updateHeatmapLegend();
}

computeFillColor(plz) {
  const v = this.filteredPLZWerte?.[plz];
  if (!v) return "#cfd4da";
  if (this.currentMapMode === "wk") {
    const value = v.hz ? v.wk : v.wkPot;
    return this.getColor(value, v.hz);
  }
  if (this.currentMapMode === "umsatz-multi") {
    const sum = this.getUmsatzSumForPLZ(v);
    return this.getDynamicHeatColor(sum, this._maxValueCache || 1);
  }
  if (this.currentMapMode === "werbeanteil") return this.getWerbeAnteilColor(v.werbeAnteil ?? 0);
  return "#cfd4da";
}

computeMaxValue() {
  const plzWerte = this.filteredPLZWerte || {};
  let maxValue = 0;
  if (this.currentMapMode === "wk") {
    Object.values(plzWerte).forEach(v => { const val = v.hz ? v.wk : v.wkPot; if (Number.isFinite(val) && val > maxValue) maxValue = val; });
  }
  if (this.currentMapMode === "umsatz-multi") {
    Object.values(plzWerte).forEach(v => { const sum = this.getUmsatzSumForPLZ(v); if (sum > maxValue) maxValue = sum; });
  }
  if (this.currentMapMode === "werbeanteil") { this._maxValueCache = 1; return 1; }
  this._maxValueCache = maxValue || 1;
  return this._maxValueCache;
}

applyStyleToLayer(layer) {
  const plz = String(layer.feature?.properties?.plz ?? "").padStart(5, "0");
  const v = this.filteredPLZWerte?.[plz];

  layer.options.interactive = true;
  if (layer._path) layer._path.setAttribute("pointer-events", "auto");

  const hasRadius = this.plzImRadius instanceof Set && this.plzImRadius.size > 0;
  let inRadius = true;
  if (this.currentMapMode === "umsatz-multi" || this.currentMapMode === "werbeanteil") {
    inRadius = !this.useRadiusFilter || !hasRadius || this.plzImRadius.has(plz);
  } else {
    inRadius = !hasRadius || this.plzImRadius.has(plz);
  }

  if (!v || !inRadius) {
    layer.setStyle({ fillColor: "#e9ecef", fillOpacity: 0.35, color: "#ffffff", weight: 0.8 });
    layer.options.interactive = true;
    if (layer._path) layer._path.setAttribute("pointer-events", "auto");
    layer.off("click");
    layer.on("click", () => {
      const popupWK = this._shadowRoot.getElementById("side-popup");
      const popupU  = this._shadowRoot.getElementById("side-popup-umsatz");
      popupWK?.classList.remove("show"); popupWK?.classList.add("hidden");
      popupU?.classList.remove("show");  popupU?.classList.add("hidden");
      if (this.currentMapMode === "umsatz-multi" || this.currentMapMode === "werbeanteil") {
        this.activePopupType = "umsatz"; this.showEmptyUmsatzPopup(plz); return;
      }
      this.activePopupType = "wk"; this.showPopup(layer.feature, {});
    });
    if (this.criticalMarkers?.[plz]) { this.map.removeLayer(this.criticalMarkers[plz]); delete this.criticalMarkers[plz]; }
    return;
  }

  const fillColor = this.computeFillColor(plz);
  layer.setStyle({ fillColor, fillOpacity: 0.72, color: "#ffffff", weight: 0.8 });
  layer.options.interactive = true;
  if (layer._path) layer._path.setAttribute("pointer-events", "auto");

  layer.off("click");
  layer.on("click", () => {
    const values = this.filteredPLZWerte?.[plz];
    const popupWK = this._shadowRoot.getElementById("side-popup");
    const popupU  = this._shadowRoot.getElementById("side-popup-umsatz");
    popupWK?.classList.remove("show"); popupWK?.classList.add("hidden");
    popupU?.classList.remove("show");  popupU?.classList.add("hidden");
    if (this.currentMapMode === "umsatz-multi" || this.currentMapMode === "werbeanteil") {
      this.activePopupType = "umsatz";
      values ? this.showUmsatzPopup(plz, values) : this.showEmptyUmsatzPopup(plz);
      return;
    }
    this.activePopupType = "wk";
    const kennwerte = this.filteredKennwerte?.[plz] || {};
    this.showPopup(layer.feature, kennwerte);
  });

  // Critical Marker
  const showCritical = this.currentMapMode === "wk" && this.showCritical;
  const isCritical = this.filteredKennwerte?.[plz]?.isCritical;
  if (!showCritical || !isCritical) {
    if (this.criticalMarkers?.[plz]) { this.map.removeLayer(this.criticalMarkers[plz]); delete this.criticalMarkers[plz]; }
    return;
  }
  if (!this.criticalMarkers) this.criticalMarkers = {};
  if (!this.criticalMarkers[plz]) {
    const center = layer.getBounds().getCenter();
    const icon = L.divIcon({
      html: `<div style="background:#fff;border:2px solid #f0a500;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,0.15)">⚠</div>`,
      className: "", iconSize: [22, 22], iconAnchor: [11, 11]
    });
    this.criticalMarkers[plz] = L.marker(center, { icon, interactive: false }).addTo(this.map);
  }
}

getDynamicHeatColor(value, max) {
  value = Number(value); max = Number(max);
  if (!Number.isFinite(value) || value <= 0 || !Number.isFinite(max) || max <= 0) return "#cfd4da";
  const ratio = value / max;
  if (ratio > 0.95) return "#7a0f17";
  if (ratio > 0.85) return "#9d131b";
  if (ratio > 0.75) return "#b41821";
  if (ratio > 0.65) return "#d9483b";
  if (ratio > 0.55) return "#e96a3a";
  if (ratio > 0.45) return "#f08a3c";
  if (ratio > 0.35) return "#f6b65b";
  if (ratio > 0.20) return "#f7d77a";
  return "#fce9b2";
}

getWerbeAnteilColor(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) return "#cfd4da";
  if (ratio > 0.80) return "#7a0f17";
  if (ratio > 0.60) return "#b41821";
  if (ratio > 0.40) return "#e96a3a";
  if (ratio > 0.20) return "#f6b65b";
  if (ratio > 0.10) return "#f7d77a";
  return "#fce9b2";
}

updateMarkers() {
  if (!this.filteredGroup || !this.allMarkers) return;
  this.filteredGroup.clearLayers();
  const filteredData = this.filteredData || [];
  if (!filteredData.length) return;
  const erhNLs = new Set(filteredData.map(row => row["dimension_niederlassung_0"]?.id?.trim()).filter(Boolean));
  const hasNLFilter = this._selectedNLs?.size > 0;
  const activeMarkers = [];
  this.allMarkers.forEach(marker => {
    const nl = marker.options.plzs?.[0];
    if (!nl || !erhNLs.has(nl)) return;
    this.filteredGroup.addLayer(marker);
    const isSelected = !hasNLFilter || this._selectedNLs.has(nl);
    marker.setIcon(this.createMarkerIcon(nl, !isSelected));
    marker.off("mouseover"); marker.off("mouseout");
    marker.on("mouseover", () => {
      const el = marker.getElement();
      if (el) { el.style.filter = "brightness(1.3)"; el.style.transform = "scale(1.12)"; el.style.transition = "transform .15s ease"; }
    });
    marker.on("mouseout", () => {
      const el = marker.getElement();
      if (el) { el.style.filter = ""; el.style.transform = ""; }
    });
    if (isSelected) { marker.setZIndexOffset(1000); activeMarkers.push(marker); }
    else marker.setZIndexOffset(100);
  });
  this.nlMarkers = activeMarkers.map(marker => ({ lat: marker.getLatLng().lat, lng: marker.getLatLng().lng, marker }));
}

onMarkerClick(nl) {
  if (this._selectedNLs.has(nl)) this._selectedNLs.delete(nl);
  else this._selectedNLs.add(nl);
  this.updateNLSelectionUI();
  this.applyNLFilter([...this._selectedNLs]);
  const radius = Number(this._shadowRoot.getElementById("radius-slider").value);
  this.applyRadiusFilter(radius);
  this.updateGeoLayer();
  this.renderDataTable(this.filteredKennwerte);
}

setupFilterDropdowns() {
  const erhSelect    = this._shadowRoot.getElementById("erhebung-select");
  const jahrSelect   = this._shadowRoot.getElementById("jahr-select");
  const nummerSelect = this._shadowRoot.getElementById("nummer-select");
  if (!erhSelect || !jahrSelect || !nummerSelect) return;

  erhSelect.innerHTML = ""; jahrSelect.innerHTML = ""; nummerSelect.innerHTML = "";
  jahrSelect.disabled = true; nummerSelect.disabled = true;

  const createPlaceholder = (text) => {
    const opt = document.createElement("option");
    opt.value = ""; opt.textContent = text; opt.disabled = true; opt.selected = true;
    return opt;
  };

  erhSelect.appendChild(createPlaceholder("Bitte auswählen"));
  Object.keys(this._erhData).forEach(erhID => {
    if (erhID !== "@NullMember") {
      const opt = document.createElement("option"); opt.value = erhID; opt.textContent = erhID;
      erhSelect.appendChild(opt);
    }
  });

  erhSelect.addEventListener("change", () => {
    jahrSelect.innerHTML = ""; nummerSelect.innerHTML = "";
    jahrSelect.disabled = false; nummerSelect.disabled = true;
    jahrSelect.appendChild(createPlaceholder("Bitte auswählen"));
    const jahre = Object.keys(this._erhData[erhSelect.value] || {}).filter(j => j !== "@NullMember");
    jahre.forEach(j => { const opt = document.createElement("option"); opt.value = j; opt.textContent = j; jahrSelect.appendChild(opt); });
  });

  jahrSelect.addEventListener("change", () => {
    nummerSelect.innerHTML = ""; nummerSelect.disabled = false;
    nummerSelect.appendChild(createPlaceholder("Bitte auswählen"));
    const nummern = Array.from(this._erhData[erhSelect.value]?.[jahrSelect.value] || []).filter(n => n !== "@NullMember");
    nummern.forEach(n => { const opt = document.createElement("option"); opt.value = n; opt.textContent = n; nummerSelect.appendChild(opt); });
  });

  const filterButton = this._shadowRoot.getElementById("filter-button");
  if (filterButton) {
    filterButton.addEventListener("click", () => {
      const selectedID = erhSelect.value, selectedJahr = jahrSelect.value, selectedNummer = nummerSelect.value;
      if (selectedID && selectedJahr && selectedNummer) this.loadErhebung(selectedID, selectedJahr, selectedNummer);
    });
  }

  // NL Info Container sicherstellen
  let nlInfo = this._shadowRoot.getElementById("nl-info-container");
  if (!nlInfo) {
    nlInfo = document.createElement("div");
    nlInfo.classList.add("nl-info-container");
    nlInfo.id = "nl-info-container";
    this._shadowRoot.querySelector(".filter-container").appendChild(nlInfo);
  }

  // ── Bug fix: verhindert doppelte Buttons beim Re-Render ──
  let existingBtn = this._shadowRoot.getElementById("info-toggle-btn");
  if (!existingBtn) {
    const infoBtn = document.createElement("button");
    infoBtn.id = "info-toggle-btn";
    infoBtn.className = "info-toggle-btn";
    infoBtn.innerHTML = `<span>↕</span> Erhebungsübersicht`;
    infoBtn.addEventListener("click", () => {
      const nlBox  = this._shadowRoot.getElementById("nl-info-container");
      const filter = this._shadowRoot.querySelector(".filter-container");
      if (!nlBox) return;
      if (nlBox.classList.contains("show")) {
        nlBox.classList.remove("show"); filter.classList.remove("nl-info-active");
      } else {
        this.prepareErhebungsInfo(); this.renderErhebungsInfoTable();
        nlBox.classList.add("show"); filter.classList.add("nl-info-active");
      }
    });
    this._shadowRoot.querySelector(".filter-container").appendChild(infoBtn);
  }
}

restoreFilterUI() {
  const container = this._shadowRoot.querySelector(".filter-container");
  if (!container) return;
  container.innerHTML = `
    <label for="erhebung-select">ErhebungsID</label>
    <select id="erhebung-select"></select>
    <label for="jahr-select">Jahr</label>
    <select id="jahr-select" disabled></select>
    <label for="nummer-select">Erhebungsnummer</label>
    <select id="nummer-select" disabled></select>
    <button id="filter-button">Anzeigen</button>
    <div class="table-container">
      <div class="table-wrapper" id="table-container"></div>
      <div id="streuverlust-box"></div>
    </div>
  `;
}

renderErhebungsInfoTable() {
  const container = this._shadowRoot.getElementById("nl-info-container");
  container.innerHTML = "";
  const scroll = document.createElement("div"); scroll.classList.add("nl-info-scroll");
  const table = document.createElement("table"); table.classList.add("nl-info-table");
  const thead = document.createElement("thead"); const headerRow = document.createElement("tr");
  const headers = [
    { label: 'NL', class: 'nl-col-nl' },
    { label: 'Umsatz\n(Hochrechi.)', class: 'nl-col-jahr' },
    { label: 'Erfasst', class: 'nl-col-erf' },
    { label: '%', class: 'nl-col-pct1' },
    { label: 'Valide', class: 'nl-col-val' },
    { label: 'Abdeckung', class: 'nl-col-abd' }
  ];
  headers.forEach(h => {
    const th = document.createElement("th"); th.textContent = h.label; th.classList.add(h.class);
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow); table.appendChild(thead);
  const tbody = document.createElement("tbody");
  Object.values(this.erhebungsInfo).forEach(info => {
    const tr = document.createElement("tr"); tr.classList.add("nl-info-row"); tr.dataset.nl = info.nl;
    const values = [
      info.nl,
      Math.round(info.jahresumsatz).toLocaleString("de-DE"),
      Math.round(info.erfasst_total).toLocaleString("de-DE"),
      (info.pct_erfassung * 100).toFixed(1) + "%",
      Math.round(info.erfasst_valid).toLocaleString("de-DE"),
      (info.pct_hochrechnung * 100).toFixed(1) + "%"
    ];
    values.forEach((val, i) => {
      const td = document.createElement("td"); td.textContent = val; td.classList.add(headers[i].class);
      tr.appendChild(td);
    });
    tr.addEventListener("click", () => this.toggleNLSelection(info.nl));
    tbody.appendChild(tr);
  });
  table.appendChild(tbody); scroll.appendChild(table); container.appendChild(scroll);
  this.updateNLSelectionUI();
}

updateNLSelectionUI() {
  const rows = this._shadowRoot.querySelectorAll(".nl-info-row");
  rows.forEach(row => {
    const nl = row.dataset.nl;
    if (this._selectedNLs.has(nl)) row.classList.add("table-row-selected");
    else row.classList.remove("table-row-selected");
  });
}

restoreDropdownSelections() {
  const { erhID, jahr, nummer } = this._activeFilter || {};
  const erhSelect    = this._shadowRoot.getElementById("erhebung-select");
  const jahrSelect   = this._shadowRoot.getElementById("jahr-select");
  const nummerSelect = this._shadowRoot.getElementById("nummer-select");
  if (!erhSelect || !jahrSelect || !nummerSelect) return;
  if (erhID) erhSelect.value = erhID;
  erhSelect.dispatchEvent(new Event("change"));
  if (jahr) jahrSelect.value = jahr;
  jahrSelect.dispatchEvent(new Event("change"));
  if (nummer) nummerSelect.value = nummer;
}

prepareErhebungsInfo() {
  this.erhebungsInfo = {};
  const rawData = this._myDataSource?.data || [];
  if (!Array.isArray(rawData) || rawData.length === 0) return;
  const { erhID, jahr, nummer } = this._activeFilter || {};
  const erhData = rawData.filter(row =>
    row["dimension_erhebung_0"]?.id == erhID &&
    row["dimension_jahr_0"]?.id == jahr &&
    row["dimension_erhebungsnummer_0"]?.id == nummer
  );
  const jahresumsatz = {}, erfasst_total = {}, erfasst_valid = {};
  erhData.forEach(row => {
    const nl = row["dimension_niederlassung_0"]?.id?.trim();
    if (!nl) return;
    const rawPLZ = row["dimension_plz_0"]?.id ?? row["dimension_plz_0"]?.raw;
    const plz = String(rawPLZ).padStart(5, "0");
    const umsatzJahr = row["value_hr_n_umsatz_0"]?.raw ?? 0;
    const umsatzErhebung = row["value_ums_erhebung_0"]?.raw ?? 0;
    if (!jahresumsatz[nl]) jahresumsatz[nl] = 0;
    if (!erfasst_total[nl]) erfasst_total[nl] = 0;
    if (!erfasst_valid[nl]) erfasst_valid[nl] = 0;
    erfasst_total[nl] += umsatzErhebung;
    if (plz !== "00000") { jahresumsatz[nl] += umsatzJahr; erfasst_valid[nl] += umsatzErhebung; }
  });
  Object.keys(erfasst_total).forEach(nl => {
    const jahrU = jahresumsatz[nl] || 0, total = erfasst_total[nl] || 0, valid = erfasst_valid[nl] || 0;
    this.erhebungsInfo[nl] = {
      nl, jahresumsatz: jahrU, erfasst_total: total, erfasst_valid: valid,
      pct_erfassung: jahrU > 0 ? total / jahrU : 0,
      pct_valid: total > 0 ? valid / total : 0,
      pct_hochrechnung: jahrU > 0 ? valid / jahrU : 0
    };
  });
}

prepareUmsatzPLZWerte() {
  const raw = this._myDataSource?.data || [];
  if (!Array.isArray(raw) || raw.length === 0) return;
  const { erhID, jahr, nummer } = this._activeFilter || {};
  if (!erhID || !jahr || !nummer) return;

  const safe = x => {
    if (x == null) return 0;
    if (typeof x === "string") x = x.replace(/\./g, "").replace(",", ".");
    const n = Number(x);
    return Number.isFinite(n) ? n : 0;
  };

  const parseHH = x => {
    if (x == null) return 0;
    if (typeof x === "number") return Number.isFinite(x) ? x : 0;
    if (typeof x === "string") { const n = Number(x.replace(/[.,\s]/g, "")); return Number.isFinite(n) ? n : 0; }
    return 0;
  };

  const rows = raw.filter(row =>
    row["dimension_erhebung_0"]?.id == erhID &&
    row["dimension_jahr_0"]?.id == jahr &&
    row["dimension_erhebungsnummer_0"]?.id == nummer
  );

  const aggregated = {};
  rows.forEach(row => {
    const nl = row["dimension_niederlassung_0"]?.id?.trim();
    if (this._selectedNLs?.size > 0 && !this._selectedNLs.has(nl)) return;
    const rawPLZ = row["dimension_plz_0"]?.id ?? row["dimension_plz_0"]?.raw;
    if (!rawPLZ || rawPLZ === "@NullMember") return;
    const plz = String(rawPLZ).padStart(5, "0");
    if (plz === "00000") return;
    if (!aggregated[plz]) {
      aggregated[plz] = {
        _hhValues: [],
        umsatz: 0, ra: 0, onlineshop: 0, pluscard: 0,
        umsatzWerbung: 0, raWerbung: 0, onlineshopWerbung: 0, pluscardWerbung: 0,
        umsatzZusatz: 0, raZusatz: 0, onlineshopZusatz: 0, pluscardZusatz: 0,
        umsatzErhebung: 0, kdErhebung: 0, auflage: 0, werbeverweigerer: 0
      };
    }
    const v = aggregated[plz];
    const hh = parseHH(row["value_haushalte_0"]?.raw);
    if (hh > 0) v._hhValues.push(hh);
    v.umsatzErhebung   += safe(row["value_ums_erhebung_0"]?.raw);
    v.kdErhebung       += safe(row["value_kd_erhebung_0"]?.raw);
    v.auflage          += safe(row["value_auflage_0"]?.raw);
    v.werbeverweigerer += safe(row["value_werbeverweigerer_0"]?.raw);
    v.umsatz     += safe(row["value_umsatz_stationaer_0"]?.raw);
    v.ra         += safe(row["value_umsatz_ra_0"]?.raw);
    v.onlineshop += safe(row["value_umsatz_online_0"]?.raw);
    v.pluscard   += safe(row["value_umsatz_grosskunden_0"]?.raw);
    v.umsatzWerbung     += safe(row["value_umsatz_stationaer_werbung_0"]?.raw);
    v.raWerbung         += safe(row["value_umsatz_ra_werbung_0"]?.raw);
    v.onlineshopWerbung += safe(row["value_umsatz_online_werbung_0"]?.raw);
    v.pluscardWerbung   += safe(row["value_umsatz_grosskunden_werbung_0"]?.raw);
    v.umsatzZusatz     += safe(row["value_umsatz_stationaer_zusatz_0"]?.raw);
    v.raZusatz         += safe(row["value_umsatz_ra_zusatz_0"]?.raw);
    v.onlineshopZusatz += safe(row["value_umsatz_online_zusatz_0"]?.raw);
    v.pluscardZusatz   += safe(row["value_umsatz_grosskunden_zusatz_0"]?.raw);
  });

  Object.entries(aggregated).forEach(([plz, v]) => {
    if (v._hhValues.length > 0) v.haushalte = v._hhValues.reduce((a, b) => a + b, 0) / v._hhValues.length;
    else v.haushalte = 0;
    delete v._hhValues;
    const hh = v.haushalte;
    const perHH = val => hh > 0 ? val / hh : 0;
    v.umsatzProHaushalt     = perHH(v.umsatz);
    v.raProHaushalt         = perHH(v.ra);
    v.onlineshopProHaushalt = perHH(v.onlineshop);
    v.pluscardProHaushalt   = perHH(v.pluscard);
    v.umsatzWerbungProHaushalt     = perHH(v.umsatzWerbung);
    v.raWerbungProHaushalt         = perHH(v.raWerbung);
    v.onlineshopWerbungProHaushalt = perHH(v.onlineshopWerbung);
    v.pluscardWerbungProHaushalt   = perHH(v.pluscardWerbung);
    v.umsatzZusatzProHaushalt     = perHH(v.umsatzZusatz);
    v.raZusatzProHaushalt         = perHH(v.raZusatz);
    v.onlineshopZusatzProHaushalt = perHH(v.onlineshopZusatz);
    v.pluscardZusatzProHaushalt   = perHH(v.pluscardZusatz);
    const catMapNormal  = { stationaer: v.umsatz, ra: v.ra, onlineshop: v.onlineshop, pluscard: v.pluscard };
    const catMapWerbung = { stationaer: v.umsatzWerbung, ra: v.raWerbung, onlineshop: v.onlineshopWerbung, pluscard: v.pluscardWerbung };
    let totalNormal = 0, totalWerbe = 0;
    for (const cat of this.activeCategories) { totalNormal += catMapNormal[cat] ?? 0; totalWerbe += catMapWerbung[cat] ?? 0; }
    v.werbeAnteil = totalNormal > 0 ? totalWerbe / totalNormal : 0;
  });

  const full = aggregated;
  const result = {};
  Object.entries(full).forEach(([plz, v]) => {
    if ((this.currentMapMode === "umsatz-multi" || this.currentMapMode === "werbeanteil") && this.useRadiusFilter) {
      if (this.plzImRadius instanceof Set && !this.plzImRadius.has(plz)) return;
    }
    result[plz] = { ...v, umsatzErhebung: v.umsatzErhebung ?? 0, kdErhebung: v.kdErhebung ?? 0, auflage: v.auflage ?? 0, werbeverweigerer: v.werbeverweigerer ?? 0 };
  });

  this.filteredPLZWerte = result;
}

_refreshAll() {
  this.prepareUmsatzPLZWerte();
  this.computeWKKennwerte();
  this.computeStreuverlust();
  this.updateGeoLayer();
  this.updateHeatmapLegend();
}

getColorForPLZ(plz) {
  const data = this.filteredPLZWerte?.[plz];
  if (!data) return "#cfd4da";
  return this.getColor(data.hz === true ? data.wk ?? 0 : data.wkPot ?? 0, data.hz === true);
}

getFilteredDataWithRadius() {
  if (!this.filteredData) return [];
  const result = [], aggregated = {};
  const unfilteredUmsatzByPLZ = {};
  this.filteredData.forEach(row => {
    const rawPLZ = row["dimension_plz_0"]?.id ?? row["dimension_plz_0"]?.raw;
    const plz = rawPLZ == null ? "" : String(rawPLZ).padStart(5, "0");
    const umsatz = row["value_hr_n_umsatz_0"]?.raw ?? 0;
    unfilteredUmsatzByPLZ[plz] = (unfilteredUmsatzByPLZ[plz] || 0) + umsatz;
  });
  let totalErhebungUmsatz = 0;
  const streuverlust = { sum: { umsatzNetto: 0, hzKosten: 0, umsatzErhebung: 0, kdErhebung: 0, auflage: 0, potHzAbs: 0 }, avgArrays: { werbeverweigerer: [], haushalte: [], kaufkraft: [] } };
  this.filteredData.forEach(row => {
    const nl = row["dimension_niederlassung_0"]?.id?.trim();
    const rawPLZ = row["dimension_plz_0"]?.id ?? row["dimension_plz_0"]?.raw;
    const plz = rawPLZ == null ? "" : String(rawPLZ).padStart(5, "0");
    if (this._selectedNLs.size > 0 && !this._selectedNLs.has(nl)) return;
    totalErhebungUmsatz += row["value_hr_n_umsatz_0"]?.raw ?? 0;
    const isInRadius = this.plzImRadius instanceof Set ? this.plzImRadius.has(plz) : true;
    if (!isInRadius) {
      streuverlust.sum.umsatzNetto += row["value_hr_n_umsatz_0"]?.raw ?? 0;
      streuverlust.sum.hzKosten    += row["value_hz_kosten_0"]?.raw ?? 0;
      const wv = row["value_werbeverweigerer_0"]?.raw;
      if (typeof wv === "number") streuverlust.avgArrays.werbeverweigerer.push(wv);
      const hh = row["value_haushalte_0"]?.raw;
      if (typeof hh === "number") streuverlust.avgArrays.haushalte.push(hh);
      return;
    }
    result.push(row);
    if (!aggregated[plz]) aggregated[plz] = { hzCount: 0, sum: { umsatzNetto: 0, hzKosten: 0, umsatzErhebung: 0, kdErhebung: 0, auflage: 0, potHzAbs: 0 }, avgArrays: { werbeverweigerer: [], haushalte: [], kaufkraft: [], potHzKosten: [] } };
    const entry = aggregated[plz];
    const hz = row["dimension_hzflag_0"]?.id?.trim() === "X";
    if (hz) entry.hzCount++;
    entry.sum.umsatzNetto    += row["value_hr_n_umsatz_0"]?.raw ?? 0;
    entry.sum.hzKosten       += row["value_hz_kosten_0"]?.raw ?? 0;
    entry.sum.umsatzErhebung += row["value_ums_erhebung_0"]?.raw ?? 0;
    entry.sum.kdErhebung     += row["value_kd_erhebung_0"]?.raw ?? 0;
    entry.sum.auflage        += row["value_auflage_0"]?.raw ?? 0;
    const potHz = row["value_hz_potentiell_0"]?.raw;
    if (typeof potHz === "number") entry.avgArrays.potHzKosten.push(potHz);
    const wv2 = row["value_werbeverweigerer_0"]?.raw;
    if (typeof wv2 === "number") entry.avgArrays.werbeverweigerer.push(wv2);
    const hh2 = row["value_haushalte_0"]?.raw;
    if (typeof hh2 === "number") entry.avgArrays.haushalte.push(hh2);
    const kk2 = row["value_kaufkraft_0"]?.raw;
    if (typeof kk2 === "number") entry.avgArrays.kaufkraft.push(kk2);
  });
  const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const mergedPLZWerte = {};
  Object.entries(aggregated).forEach(([plz, entry]) => {
    const sum = entry.sum, avgArr = entry.avgArrays;
    const avgPotHzKosten = avg(avgArr.potHzKosten);
    const umsatzNetto = sum.umsatzNetto, hzKosten = sum.hzKosten;
    const wkPercent = umsatzNetto > 0 ? Number(((hzKosten / umsatzNetto) * 100).toFixed(1)) : 0;
    const unfilteredUmsatz = unfilteredUmsatzByPLZ[plz] ?? 0;
    const wkNachbarn = unfilteredUmsatz > 0 ? Number(((hzKosten / unfilteredUmsatz) * 100).toFixed(1)) : 0;
    const potHzPercent = umsatzNetto > 0 ? Number(((avgPotHzKosten / umsatzNetto) * 100).toFixed(1)) : 0;
    const isHZ = entry.hzCount > 0, isCritical = entry.hzCount > 1;
    this.filteredKennwerte[plz] = {
      isHZ, isCritical,
      value_hr_n_umsatz_0:   { raw: umsatzNetto },
      value_wk_in_percent_0: { raw: wkPercent },
      value_wk_nachbar_0:    { raw: wkNachbarn },
      value_hz_kosten_0:     { raw: hzKosten },
      value_werbeverweigerer_0: { raw: avg(avgArr.werbeverweigerer) },
      value_haushalte_0:     { raw: avg(avgArr.haushalte) },
      value_kaufkraft_0:     { raw: avg(avgArr.kaufkraft) },
      value_ums_erhebung_0:  { raw: sum.umsatzErhebung },
      value_kd_erhebung_0:   { raw: sum.kdErhebung },
      value_bon_erhebung_0:  { raw: sum.kdErhebung > 0 ? Number((sum.umsatzErhebung / sum.kdErhebung).toFixed(2)) : 0 },
      value_auflage_0:       { raw: sum.auflage },
      value_wk_potentiell_0: { raw: potHzPercent }
    };
    const old = this.filteredPLZWerte?.[plz] || {};
    mergedPLZWerte[plz] = { wk: wkPercent, wkNachbarn, wkPot: potHzPercent, hz: isHZ, umsatz: old.umsatz ?? 0, ra: old.ra ?? 0, onlineshop: old.onlineshop ?? 0, pluscard: old.pluscard ?? 0, haushalte: old.haushalte ?? 0, umsatzProHaushalt: old.umsatzProHaushalt ?? 0, raProHaushalt: old.raProHaushalt ?? 0, onlineshopProHaushalt: old.onlineshopProHaushalt ?? 0, pluscardProHaushalt: old.pluscardProHaushalt ?? 0 };
  });
  this.filteredPLZWerte = mergedPLZWerte;
  this.streuverlust = { umsatz: streuverlust.sum.umsatzNetto, anteil: totalErhebungUmsatz > 0 ? streuverlust.sum.umsatzNetto / totalErhebungUmsatz : 0 };
  return result;
}

closeNLTable() {
  const nlContainer = this._shadowRoot.getElementById("nl-info-container");
  const filterContainer = this._shadowRoot.querySelector(".filter-container");
  nlContainer?.classList.remove("show");
  filterContainer?.classList.remove("nl-info-active");
}

showEmptyUmsatzPopup(plz) {
  const popup = this._shadowRoot.getElementById("side-popup-umsatz");
  if (!popup) return;
  const note = this.geoNotes?.[plz] || "—";
  popup.innerHTML = `
    <div class="popup-header">
      <span title="${note}" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${note}</span>
      <button class="close-btn" style="flex-shrink:0">✕</button>
    </div>
    <div style="padding:20px 14px;text-align:center;color:#adb5bd;font-size:0.85rem">
      <div style="font-size:2rem;margin-bottom:8px;opacity:.4">📭</div>
      Keine Umsatzdaten für PLZ ${plz}
    </div>
    <div class="umsatz-legend" style="padding:0 14px 12px;justify-content:center">
      <span><span style="color:#b41821">⬤</span> Stationär</span>
      <span><span style="color:#1f78b4">⬤</span> Pluscard</span>
      <span><span style="color:#33a02c">⬤</span> R&amp;A</span>
      <span><span style="color:#ffb000">⬤</span> KUBE OS</span>
    </div>
  `;
  popup.classList.remove("hidden");
  void popup.offsetWidth;
  popup.classList.add("show");
  popup.querySelector(".close-btn").onclick = () => { popup.classList.remove("show"); popup.classList.add("hidden"); };
}

prepareDropdownData(data) {
  const erhSelect    = this._shadowRoot.getElementById("erhebung-select");
  const jahrSelect   = this._shadowRoot.getElementById("jahr-select");
  const nummerSelect = this._shadowRoot.getElementById("nummer-select");
  if (!erhSelect || !jahrSelect || !nummerSelect) return;
  erhSelect.innerHTML = ""; jahrSelect.innerHTML = ""; nummerSelect.innerHTML = "";
  jahrSelect.disabled = true; nummerSelect.disabled = true;
  this._erhData = {};
  data.forEach(row => {
    const erhID = row["dimension_erhebung_0"]?.id?.trim();
    const jahr  = row["dimension_jahr_0"]?.id?.trim();
    const nummer = row["dimension_erhebungsnummer_0"]?.id?.trim();
    if (!erhID || !jahr || !nummer) return;
    this._erhData[erhID] = this._erhData[erhID] || {};
    this._erhData[erhID][jahr] = this._erhData[erhID][jahr] || new Set();
    this._erhData[erhID][jahr].add(nummer);
  });
  Object.keys(this._erhData).forEach(erhID => {
    const opt = document.createElement("option"); opt.value = erhID; opt.textContent = erhID;
    erhSelect.appendChild(opt);
  });
  erhSelect.addEventListener("change", () => {
    jahrSelect.innerHTML = ""; nummerSelect.innerHTML = ""; jahrSelect.disabled = false; nummerSelect.disabled = true;
    Object.keys(this._erhData[erhSelect.value] || {}).forEach(j => { const opt = document.createElement("option"); opt.value = j; opt.textContent = j; jahrSelect.appendChild(opt); });
  });
  jahrSelect.addEventListener("change", () => {
    nummerSelect.innerHTML = ""; nummerSelect.disabled = false;
    Array.from(this._erhData[erhSelect.value]?.[jahrSelect.value] || []).forEach(n => { const opt = document.createElement("option"); opt.value = n; opt.textContent = n; nummerSelect.appendChild(opt); });
  });
  const filterButton = this._shadowRoot.getElementById("filter-button");
  if (filterButton) {
    filterButton.addEventListener("click", () => this.loadErhebung(erhSelect.value, jahrSelect.value, nummerSelect.value));
  }
}

async render() {
  if (!this.map || !this._myDataSource || this._myDataSource.state !== "success") return;
  this.showSpinner();
  const rawData = this._myDataSource.data;
  this._erhData = this.buildErhebungsStruktur(rawData);
  this.setupFilterDropdowns();
  const isFiltered = !!this._activeFilter;
  const filteredData = isFiltered ? this.getFilteredData() : rawData;
  this.prepareMapData(filteredData);
  this.prepareUmsatzPLZWerte();
  this.computeWKKennwerte();
  this.computeStreuverlust();
  await this.loadGeoJson();
  this.updateGeoLayer();
  this.createAllMarkers();
  const filteredPLZs = isFiltered ? filteredData.map(d => d["dimension_plz_0"]?.id?.trim()).filter(plz => plz && plz !== "@NullMember") : Object.keys(this.allMarkers);
  this.updateMarkers(filteredPLZs);
  this.renderDataTable(this.filteredKennwerte);
  this.hideSpinner();
}

updateHeatmapLegend() {
  const legend = this._shadowRoot.getElementById("heatmap-legend");
  if (!legend) return;
  if (!this._activeFilter || !this.filteredPLZWerte || Object.keys(this.filteredPLZWerte).length === 0) { legend.classList.add("hidden"); return; }
  if (!this.currentMapMode) { legend.classList.add("hidden"); return; }

  const mkRow = (bg, label) => `<div class="heatmap-legend-row"><div class="heatmap-legend-color" style="background:${bg}"></div>${label}</div>`;

  if (this.currentMapMode === "wk") {
    legend.innerHTML = `
      <strong>Werbekosten</strong>
      <div style="font-size:0.7rem;color:#adb5bd;font-weight:600;margin:6px 0 3px;text-transform:uppercase;letter-spacing:.04em">Bestreut</div>
      ${mkRow('#e31a1c','> 25 %')}${mkRow('#fd8d3c','15–25 %')}${mkRow('#ffffb2','10–15 %')}${mkRow('#78c679','5–10 %')}${mkRow('#41ab5d','2–5 %')}${mkRow('#006837','0–2 %')}
      <div style="font-size:0.7rem;color:#adb5bd;font-weight:600;margin:8px 0 3px;text-transform:uppercase;letter-spacing:.04em">Nicht bestreut</div>
      ${mkRow('#cfd4da','> 50 %')}${mkRow('#bdbdbd','25–50 %')}${mkRow('#969696','15–25 %')}${mkRow('#6baed6','10–15 %')}${mkRow('#2171b5','5–10 %')}${mkRow('#08306b','0–5 %')}
    `;
    legend.classList.remove("hidden"); return;
  }

  if (this.currentMapMode === "umsatz-multi") {
    const values = Object.values(this.filteredPLZWerte).map(v => this.getUmsatzSumForPLZ(v)).filter(v => v > 0);
    const max = values.length > 0 ? Math.max(...values) : 0;
    const steps = [max, max*0.85, max*0.75, max*0.65, max*0.55, max*0.45, max*0.35, max*0.20, 0];
    const fmt = n => n.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " €";
    legend.innerHTML = `<strong>Umsatz (absolut)</strong>` + steps.map(v => mkRow(this.getDynamicHeatColor(v, max), fmt(v))).join("");
    legend.classList.remove("hidden"); return;
  }

  if (this.currentMapMode === "werbeanteil") {
    legend.innerHTML = `<strong>Werbeanteil</strong>` +
      [['#7a0f17','>80%'],['#b41821','60–80%'],['#e96a3a','40–60%'],['#f6b65b','20–40%'],['#f7d77a','10–20%'],['#fce9b2','<10%']].map(([bg,l]) => mkRow(bg,l)).join("");
    legend.classList.remove("hidden"); return;
  }

  legend.classList.add("hidden");
}

getUmsatzValueForLegend(v) {
  let sum = 0;
  for (const cat of this.activeCategories) { if (v[cat] != null) sum += v[cat]; }
  if (this.umsatzMainMode === "werbung") {
    sum = 0;
    if (this.useWerbeUmsatz) sum += v.werbung ?? 0;
    if (this.useZusatzUmsatz) sum += v.zusatz ?? 0;
  }
  if (this.umsatzDarstellung === "hh") { const hh = v.haushalte || 1; sum = sum / hh; }
  return sum;
}

async loadErhebung(erhID, jahr, nummer) {
  const legend = this._shadowRoot.getElementById("heatmap-legend");
  legend?.classList.add("hidden");
  this.closeNLTable?.();
  this._showCinematicLoader();

  try {
    this._updateLoaderPhase(1, "Erhebungsdaten werden geladen…");
    const rawData = await this.queryErhebungFromBW(erhID, jahr, nummer);
    this._activeFilter = { erhID, jahr, nummer };
    this.filteredData = rawData;

    this._updateLoaderPhase(2, "Karte wird vorbereitet…");
    this.prepareMapData(rawData);
    await this.loadGeoJson();

    this._updateLoaderPhase(3, "Niederlassungen werden gesetzt…");
    this.allNLs = [...Object.keys(this.Niederlassung), ...(this.extraNLs?.map(e => e.nl) ?? [])];
    this._selectedNLs = new Set(this.allNLs);
    this.createAllMarkers();
    const radius = Number(this._shadowRoot.getElementById("radius-slider")?.value ?? 40);
    this._buildDistanceCache();
    this.applyRadiusFilter(radius);

    this._updateLoaderPhase(4, "Kennwerte werden berechnet…");
    this.prepareUmsatzPLZWerte();
    this.computeWKKennwerte();
    this.computeStreuverlust();
    this.updateGeoLayer();
    this.prepareErhebungsInfo();
    this.renderDataTable(this.filteredKennwerte);
    this.zoomToFilteredPLZ();

    this._updateLoaderPhase(5, "Fertig!");
    await new Promise(r => setTimeout(r, 500));
  } finally {
    this._hideCinematicLoader();
  }
}

_showCinematicLoader() {
  this._hideCinematicLoader(true);
  const overlay = document.createElement("div");
  overlay.id = "cinematic-loader";
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
  `;
  const mapContainer = this._shadowRoot.querySelector(".map-container");
  if (mapContainer) mapContainer.appendChild(overlay);
  else this._shadowRoot.appendChild(overlay);
  this._cinematicLoader = overlay;
}

_updateLoaderPhase(phase, text) {
  const loader = this._shadowRoot.getElementById("cinematic-loader");
  if (!loader) return;
  const phaseText = loader.querySelector("#loader-phase-text");
  if (phaseText) { phaseText.style.opacity = "0"; setTimeout(() => { phaseText.textContent = text; phaseText.style.opacity = "1"; }, 140); }
  const bar = loader.querySelector("#loader-bar");
  const progressMap = { 1: 15, 2: 40, 3: 65, 4: 85, 5: 100 };
  if (bar) bar.style.width = (progressMap[phase] || 0) + "%";
  loader.querySelectorAll(".loader-dot").forEach(dot => {
    const dotPhase = Number(dot.dataset.phase);
    dot.classList.remove("active", "done");
    if (dotPhase === phase) dot.classList.add("active");
    else if (dotPhase < phase) dot.classList.add("done");
  });
}

_hideCinematicLoader(immediate = false) {
  const loader = this._shadowRoot.getElementById("cinematic-loader");
  if (!loader) return;
  if (immediate) { loader.remove(); return; }
  loader.classList.add("fade-out");
  setTimeout(() => loader.remove(), 380);
}

showLoadingOverlay() {
  const overlay = this._shadowRoot.getElementById("loading-spinner");
  if (!overlay) return;
  overlay.classList.remove("hidden");
  overlay.style.opacity = "1";
  overlay.style.pointerEvents = "auto";
}

hideLoadingOverlay() {
  const overlay = this._shadowRoot.getElementById("loading-spinner");
  if (!overlay) return;
  overlay.style.transition = "opacity 0.25s ease";
  overlay.style.opacity = "0";
  overlay.style.pointerEvents = "none";
  setTimeout(() => overlay.classList.add("hidden"), 250);
}

async queryErhebungFromBW(erhID, jahr, nummer) {
  const raw = this._myDataSource?.data || [];
  return raw.filter(row =>
    row["dimension_erhebung_0"]?.id == erhID &&
    row["dimension_jahr_0"]?.id == jahr &&
    row["dimension_erhebungsnummer_0"]?.id == nummer
  );
}

closeAllPopups() {
  const popupUmsatz = this._shadowRoot.getElementById("side-popup-umsatz");
  const popupWK     = this._shadowRoot.getElementById("side-popup");
  popupUmsatz?.classList.add("hidden");
  popupWK?.classList.add("hidden");
}

showNotesOnMap() {
  if (!this._geoLayer) return;
  const zoomLevel = this.map.getZoom();
  const bounds = this.map.getBounds();
  this._geoLayer.eachLayer(layer => {
    const note = layer.feature?.properties?.note;
    const center = layer.getBounds?.().getCenter?.();
    if (zoomLevel >= 12 && note && center && bounds.contains(center)) {
      if (!layer.getTooltip()) layer.bindTooltip(note, { permanent: true, direction: 'center', className: 'note-label' }).openTooltip();
      else layer.openTooltip();
    } else {
      if (layer.getTooltip()) layer.closeTooltip();
    }
  });
}

prepareMapData(filteredData) {
  this.Niederlassung = {}; this.nlKoordinaten = {}; this.hzFlags = {}; this.extraNLs = [];
  filteredData.forEach(row => {
    const plz   = row["dimension_plz_0"]?.id?.trim();
    const nlKey = row["dimension_niederlassung_0"]?.id?.trim();
    const hzFlag = row["dimension_hzflag_0"]?.id?.trim() === "X";
    const lat = parseFloat(row["dimension_Lat_0"]?.label);
    const lon = parseFloat(row["dimension_lon_0"]?.label);
    if (nlKey) { this.Niederlassung[nlKey] = nlKey; if (!isNaN(lat) && !isNaN(lon)) this.nlKoordinaten[nlKey] = { lat, lon }; }
    if (plz) this.hzFlags[plz] = hzFlag;
  });
}

getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

getPolygonCenter(layer) { return layer.getBounds().getCenter(); }

applyRadiusFilter(radiusKm) {
  if (!this._layerByPLZ) return;
  if (!this._distanceCache || Object.keys(this._distanceCache).length === 0) this._buildDistanceCache();
  const plzImRadius = new Set();
  const cache = this._distanceCache;
  const plzList = Object.keys(this._layerByPLZ);
  for (let i = 0; i < plzList.length; i++) {
    const plz = plzList[i];
    if ((cache[plz] ?? Infinity) <= radiusKm) plzImRadius.add(plz);
  }
  this.plzImRadius = plzImRadius;
  this.computeWKKennwerte(); this.computeStreuverlust(); this.updateGeoLayer(); this.renderDataTable(this.filteredKennwerte);
}

computeWKKennwerte() {
  if (!this.filteredData) return;
  const aggregated = {}, unfilteredUmsatzByPLZ = {};
  this.filteredData.forEach(row => {
    const rawPLZ = row["dimension_plz_0"]?.id ?? row["dimension_plz_0"]?.raw;
    const plz = String(rawPLZ || "").padStart(5, "0");
    const umsatz = row["value_hr_n_umsatz_0"]?.raw ?? 0;
    unfilteredUmsatzByPLZ[plz] = (unfilteredUmsatzByPLZ[plz] || 0) + umsatz;
  });
  this.filteredData.forEach(row => {
    const nl = row["dimension_niederlassung_0"]?.id?.trim();
    const rawPLZ = row["dimension_plz_0"]?.id ?? row["dimension_plz_0"]?.raw;
    const plz = String(rawPLZ || "").padStart(5, "0");
    if (this._selectedNLs.size > 0 && !this._selectedNLs.has(nl)) return;
    if (this.plzImRadius instanceof Set && !this.plzImRadius.has(plz)) return;
    if (!aggregated[plz]) aggregated[plz] = { hzCount: 0, umsatzNetto: 0, hzKosten: 0, potHzKosten: [] };
    const entry = aggregated[plz];
    const hz = row["dimension_hzflag_0"]?.id?.trim() === "X";
    if (hz) entry.hzCount++;
    entry.umsatzNetto += row["value_hr_n_umsatz_0"]?.raw ?? 0;
    entry.hzKosten    += row["value_hz_kosten_0"]?.raw ?? 0;
    const potHz = row["value_hz_potentiell_0"]?.raw;
    if (typeof potHz === "number") entry.potHzKosten.push(potHz);
  });
  const base = this.filteredKennwerte || {};
  const newFilteredKennwerte = {}, newFilteredPLZWerte = {};
  Object.entries(aggregated).forEach(([plz, entry]) => {
    const umsatzNetto = entry.umsatzNetto, hzKosten = entry.hzKosten;
    const wkPercent = umsatzNetto > 0 ? Number(((hzKosten / umsatzNetto) * 100).toFixed(1)) : 0;
    const unfilteredUmsatz = unfilteredUmsatzByPLZ[plz] ?? 0;
    const wkNachbarn = unfilteredUmsatz > 0 ? Number(((hzKosten / unfilteredUmsatz) * 100).toFixed(1)) : 0;
    const avgPotHz = entry.potHzKosten.length > 0 ? entry.potHzKosten.reduce((a, b) => a + b, 0) / entry.potHzKosten.length : 0;
    const potHzPercent = umsatzNetto > 0 ? Number(((avgPotHz / umsatzNetto) * 100).toFixed(1)) : 0;
    const isHZ = entry.hzCount > 0, isCritical = entry.hzCount > 1;
    const baseEntry = base[plz] || {}, old = this.filteredPLZWerte?.[plz] || {};
    newFilteredKennwerte[plz] = { ...baseEntry, isHZ, isCritical, value_hr_n_umsatz_0: { raw: umsatzNetto }, value_wk_in_percent_0: { raw: wkPercent }, value_wk_nachbar_0: { raw: wkNachbarn }, value_hz_kosten_0: { raw: hzKosten }, value_hz_potentiell_0: { raw: avgPotHz }, value_wk_potentiell_0: { raw: potHzPercent }, value_ums_erhebung_0: { raw: old.umsatzErhebung ?? 0 }, value_kd_erhebung_0: { raw: old.kdErhebung ?? 0 }, value_auflage_0: { raw: old.auflage ?? 0 }, value_werbeverweigerer_0: { raw: old.werbeverweigerer ?? 0 } };
    newFilteredPLZWerte[plz] = { wk: wkPercent, wkPot: potHzPercent, hz: isHZ, umsatz: old.umsatz ?? 0, ra: old.ra ?? 0, onlineshop: old.onlineshop ?? 0, pluscard: old.pluscard ?? 0, haushalte: old.haushalte ?? 0, umsatzProHaushalt: old.umsatzProHaushalt ?? 0, raProHaushalt: old.raProHaushalt ?? 0, onlineshopProHaushalt: old.onlineshopProHaushalt ?? 0, pluscardProHaushalt: old.pluscardProHaushalt ?? 0, umsatzWerbung: old.umsatzWerbung ?? 0, raWerbung: old.raWerbung ?? 0, onlineshopWerbung: old.onlineshopWerbung ?? 0, pluscardWerbung: old.pluscardWerbung ?? 0, umsatzZusatz: old.umsatzZusatz ?? 0, raZusatz: old.raZusatz ?? 0, onlineshopZusatz: old.onlineshopZusatz ?? 0, pluscardZusatz: old.pluscardZusatz ?? 0, umsatzWerbungProHaushalt: old.umsatzWerbungProHaushalt ?? 0, raWerbungProHaushalt: old.raWerbungProHaushalt ?? 0, onlineshopWerbungProHaushalt: old.onlineshopWerbungProHaushalt ?? 0, pluscardWerbungProHaushalt: old.pluscardWerbungProHaushalt ?? 0, umsatzZusatzProHaushalt: old.umsatzZusatzProHaushalt ?? 0, raZusatzProHaushalt: old.raZusatzProHaushalt ?? 0, onlineshopZusatzProHaushalt: old.onlineshopZusatzProHaushalt ?? 0, pluscardZusatzProHaushalt: old.pluscardZusatzProHaushalt ?? 0, werbeAnteil: old.werbeAnteil ?? 0 };
  });
  this.filteredKennwerte = newFilteredKennwerte;
  this.filteredPLZWerte  = newFilteredPLZWerte;
}

toggleNLSelection(nl) {
  if (!this._selectedNLs) this._selectedNLs = new Set();
  if (this._selectedNLs.has(nl)) this._selectedNLs.delete(nl);
  else this._selectedNLs.add(nl);
  if (this._selectedNLs.size === this.allNLs.length) this._selectedNLs = new Set(this.allNLs);
  this.updateNLSelectionUI();
  this.applyNLFilter([...this._selectedNLs]);
  const radius = Number(this._shadowRoot.getElementById("radius-slider").value);
  this.applyRadiusFilter(radius);
  this.updateGeoLayer();
  this.renderDataTable(this.filteredKennwerte);
  this.prepareUmsatzPLZWerte();
}

initRadiusSlider() {
  const slider = this._shadowRoot.getElementById("radius-slider");
  const valueLabel = this._shadowRoot.getElementById("radius-value");
  if (!slider) return;
  valueLabel.textContent = slider.value;

  // Track-Fill initial setzen
  const updateFill = () => {
    const min = +slider.min, max = +slider.max, val = +slider.value;
    const pct = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(90deg, #b41821 ${pct}%, #dee2e6 ${pct}%)`;
  };
  updateFill();

  let debounceTimer = null;
  slider.addEventListener("input", () => {
    const radius = Number(slider.value);
    valueLabel.textContent = radius;
    updateFill();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      this.applyRadiusFilter(radius);
      this.renderDataTable(this.filteredKennwerte);
    }, 80);
  });
}

onCustomWidgetEvent(event) {
  if (event.name === "toggleTiles") this.toggleMapTiles();
}

set myDataSource(dataBinding) {
  this._myDataSource = dataBinding;
  if (!this.map) {
    const waitForMap = setInterval(() => {
      if (this.map) { clearInterval(waitForMap); this.render(); }
    }, 100);
    return;
  }
  this.render();
}
}

    if (!customElements.get('geo-map-widget')) {
      customElements.define('geo-map-widget', GeoMapWidget);
    }
  })();
