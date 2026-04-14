  let neighbours = true;
  let hasTriggeredClick = false;
  (function () {
    const template = document.createElement('template');
    template.innerHTML = `
    <style>
      :host {
        display: block;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
      }

    

      .layout {
        display: flex;
        height: 100%;
        width: 100%;
      }

.map-container {
  width: 70%;
  height: 100%;
  position: relative;   /* WICHTIG */
  z-index: 10;
}



      #map {
        height: 100%;
        width: 100%;
        background: white;
      }
      .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #b41821;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2000;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }


  #loading-spinner.hidden {
    display: none;
  }


      .note-label {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid #999;
        padding: 2px 6px;
        font-size: 11px;
        color: #333;
        border-radius: 4px;
      }

/* ------------------------------------------------------ */
/* Gemeinsames Popup-Layout für WK & Umsatz               */
/* ------------------------------------------------------ */

.side-popup {
  position: absolute;
  right: 0;
  top: 0;
  width: 25%;
  height: 70%;
  background: white;
  border-left: 2px solid #b41821;
  padding: 10px;
  font-family: sans-serif;
  color: #b41821;
  box-sizing: border-box;
  overflow-y: auto;
  z-index: 99999;

  /* Animation */
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.side-popup.show {
  opacity: 1;
  transform: translateX(0);
}

.side-popup.hidden {
  opacity: 0;
  transform: translateX(20px);
  pointer-events: none;
}

/* Close-Button */
.side-popup .close-btn {
  position: absolute;
  top: 5px;
  right: 8px;
  background: #b41821;
  color: white;
  border: none;
  padding: 2px 6px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 3px;
}

/* ------------------------------------------------------ */
/* Tabellen-Layout (identisch für WK & Umsatz)            */
/* ------------------------------------------------------ */

.side-popup table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  border: 1px solid #b41821;
  margin-top: 30px;
}
.side-popup th {
  background-color: #b41821;
  color: white;
  font-weight: bold;
  padding: 6px;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: none; /* NEU */
}

.side-popup td {
  font-size: 0.85rem;
  padding: 4px 8px;
  color: black;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: none; /* NEU */
}


.side-popup th.subtitle-cell {
  background-color: #f3f3f3;
  color: black;
  font-weight: bold;
  padding: 6px;
  font-size: 0.85rem;
}


.side-popup td.label-cell {
  width: 70%;
  text-align: left;
}

.side-popup td.value-cell {
  width: 30%;
  text-align: right;
  font-weight: normal;
}

.side-popup .section-title {
  background: #f3f3f3;
  color: #000;
  font-weight: bold;
  padding: 6px 8px;
  font-size: 0.85rem;
  border-top: 1px solid #b41821;   /* optional */
  border-bottom: 1px solid #b41821; /* optional */
}



/* ------------------------------------------------------ */
/* UMSATZ-POPUP (sauber, stabil, bündig, wie WK-Popup)    */
/* ------------------------------------------------------ */

#side-popup-umsatz {
  position: absolute;
  right: 0;
  top: 0;
  width: 25%;
  height: 70%;
  background: white;
  border-left: 2px solid #b41821;
  border-top: 2px solid #b41821;
  box-sizing: border-box;
  overflow-y: auto;
  z-index: 99999;

  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

#side-popup-umsatz.show {
  opacity: 1;
  transform: translateX(0);
}

/* Header */
#side-popup-umsatz .popup-header {
  background: #b41821;
  color: white;
  padding: 10px 12px;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#side-popup-umsatz .popup-header .close-btn {
  background: white;
  color: #b41821;
  border: none;
  padding: 2px 8px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
}

/* Summenblock */
.umsatz-subheader {
  padding: 14px 12px 4px 12px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.umsatz-subheader .strong {
  font-weight: 700;
  color: #000;
}

/* Abschnittstitel */
.section-title {
  margin: 12px 0 6px 0;
  padding: 6px 12px;
  background: #f3f3f3;
  border-top: 1px solid #b41821;
  border-bottom: 1px solid #b41821;
  font-weight: 700;
  font-size: 0.9rem;
  color: #333;
}
.umsatz-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 0.8fr; /* Beschreibung | Absolut | HH */
  gap: 6px 12px;
  padding: 0 12px;
  align-items: center;
}

.umsatz-grid.header {
  font-weight: 700;
  color: #000;
  margin-bottom: 4px;
}


.umsatz-grid .label {
  font-weight: 500;
  color: #333;
}

.umsatz-grid .value {
  text-align: right;
  font-weight: 600;
  color: #111;
}


/* Balken */
.umsatz-bar {
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  margin: 8px 12px;
}

.share-stationaer { background: #b41821; }
.share-pluscard   { background: #1f78b4; }
.share-ra         { background: #33a02c; }
.share-online     { background: #ffb000; }

/* Legende */
.umsatz-legend {
  display: flex;
  gap: 12px;
  padding: 0 12px 12px 12px;
  font-size: 0.85rem;
  color: #444;
}

.disabled-cell {
  opacity: 0.35;
  filter: grayscale(100%);
}


/* ------------------------------------------------------ */
/* HH-Kennzahlen-Tabelle                                  */
/* ------------------------------------------------------ */

.side-popup .hh-table {
  margin-top: 20px;
}

.side-popup .hh-table th {
  background-color: #f3f3f3;
  color: black;
  font-weight: bold;
  padding: 6px;
  font-size: 0.85rem;
}

/* ============================================
   PANEL-HÖHE & ANIMATION
   ============================================ */

#map-control-panel {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 25%;
  height: 25%;              /* ⭐ Standardhöhe */
  max-height: 55%;          /* ⭐ Obergrenze */
  overflow-y: auto;
  background: #fafafa;
  border-left: 2px solid #b41821;
  border-top: 2px solid #b41821;
  padding: 14px;
  box-sizing: border-box;
  font-family: sans-serif;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: height 0.35s ease;
}

/* ⭐ Wenn Umsatz aktiv → Panel wächst */
#map-control-panel.panel-large {
  height: 55%;
}

#map-control-panel.panel-medium {
  height: 30%;
}




/* Karten-Panel Cards */
.panel-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #b41821;
  margin-bottom: 4px;
}

/* Switch Buttons (WK / Umsatz) */
.switch-row {
  display: flex;
  gap: 8px;
}

.switch-btn {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  border: 2px solid #b41821;
  background: white;
  color: #b41821;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.switch-btn.active {
  background: #b41821;
  color: white;
}

.switch-btn:hover:not(.active) {
  background: #fff3f3;
}

/* Option Rows */
.option-row {
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
  color: #333;
}
/* ============================================
   Moderner Segmented Switch (Apple-Style)
   ============================================ */

.mode-selector {
  display: flex;
  background: #f2f2f2;
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
  cursor: pointer;
  user-select: none;
}

.mode-selector span {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6px;
  transition: 0.2s;
  color: #666;
}

/* Aktive Seite links */
.mode-selector.active-left .mode-left {
  background: #b41821;
  color: white;
}

/* Aktive Seite rechts */
.mode-selector.active-right .mode-right {
  background: #b41821;
  color: white;
}

/* Kategorien */
.category-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.category-toggle {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #b41821;
  background: white;
  color: #b41821;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
  transition: 0.2s;
}

.category-toggle.active {
  background: #fff3f3;
  box-shadow: 0 0 6px rgba(180,24,33,0.4);
}


/* --------------------------------------------- */
/* PLZ-TABELLE (OBERE TABELLE) */
/* --------------------------------------------- */

.table-container {
  margin-top: 1rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-family: sans-serif;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
}

.table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  transition: transform 0.35s ease;
  overflow: hidden;
}

.table-scroll {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #b41821;
  border-radius: 6px;
  background: white;
  min-height: 0;
  margin-bottom: 8px;
}

.table-container table {
  width: 100%;
  border-collapse: collapse;
}

.table-container th,
.table-container td {
  padding: 0.6rem 0.8rem;
  border-bottom: 1px solid #eee;
  text-align: left;
  font-size: 0.8rem;
}

.table-container th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #333;
}

.table-container tr:hover {
  background-color: #f0f8ff;
}

.table-row-selected {
  background-color: #fff8c4 !important;
}

/* --------------------------------------------- */
/* STREUVERLUST (STICKY FOOTER) */
/* --------------------------------------------- */

#streuverlust-box {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 10px;
  border-top: 2px solid #b41821;
  z-index: 5;
  transition: transform 0.35s ease;
}

/* --------------------------------------------- */
/* NL-TABELLE (UNTERE TABELLE) */
/* --------------------------------------------- */
/* ------------------------------------------------------ */
/* NL-INFO-CONTAINER (fährt von unten hoch und runter)    */
/* ------------------------------------------------------ */

#nl-info-container {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  height: 60%; /* oder auto + max-height */
  max-height: 70%;

  background: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);

  transform: translateY(100%);
  opacity: 0;
  transition: transform 0.35s ease, opacity 0.35s ease;

  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10;
}


#nl-info-container.show {
  transform: translateY(0);
  opacity: 1;
}

/* Scrollbereich */
.nl-info-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #b41821 #ffffff;
}

.nl-info-scroll::-webkit-scrollbar {
  width: 6px;
}

.nl-info-scroll::-webkit-scrollbar-thumb {
  background: #b41821;
  border-radius: 4px;
}

/* Tabelle */
.nl-info-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 0.8rem;
}

.nl-info-table th {
  background-color: #b41821;
  color: white;
  padding: 8px;
  position: sticky;
  top: 0;
  z-index: 2;
  white-space: pre-line;
  border-bottom: 1px solid #b41821;
  border-right: 1px solid #b41821;
}

.nl-info-table td {
  padding: 6px 8px;
  border-bottom: 1px solid #b41821;
  border-right: 1px solid #b41821;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nl-info-row:hover {
  background-color: #f0f8ff;
  cursor: pointer;
}

/* Spaltenbreiten */
.nl-col-nl      { width: 15px; }
.nl-col-jahr    { width: 55px; }
.nl-col-erf     { width: 45px; }
.nl-col-pct1    { width: 25px; }
.nl-col-val     { width: 40px; }
.nl-col-pct2    { width: 25px; }
.nl-col-abd     { width: 45px; }

/* ------------------------------------------------------ */
/* PLZ-TABELLE HOCHSCHIEBEN, WENN NL-INFO AKTIV           */
/* ------------------------------------------------------ */

.filter-container.nl-info-active .table-wrapper {
  transform: translateY(-100%);
  transition: transform 0.35s ease;
}

/* ------------------------------------------------------ */
/* FILTER-CONTAINER BASISLAYOUT                           */
/* ------------------------------------------------------ */

.filter-container {
  width: 30%;
  padding: 10px;
  box-sizing: border-box;
  font-family: sans-serif;
  background: #f2f4f7;
  border-right: 2px solid #b41821;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  z-index: 2;
}

.filter-container label {
  display: block;
  margin-top: 10px;
  font-weight: bold;
  color: #333;
}

.filter-container select,
.filter-container button {
  width: 100%;
  margin-top: 5px;
  padding: 6px;
  font-size: 0.9rem;
}


/* --------------------------------------------- */
/* RADIUS-SLIDER */
/* --------------------------------------------- */
#radius-slider-container {
  position: absolute;
  top: 10px;
  right: 40%; /* weiter links */
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  font-size: 14px;
  z-index: 9999;
}
#map-tile-toggle-btn {
  position: absolute;
  bottom: 20px;
  right: 40%;
  width: 54px;   /* größer */
  height: 54px;  /* größer */
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  cursor: pointer;
  z-index: 9999;

  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23b41821" viewBox="0 0 24 24"><path d="M3 6.5l6-2 6 2 6-2v13l-6 2-6-2-6 2v-13zm6 0v11l4 1.3v-11l-4-1.3zm10 0l-4 1.3v11l4-1.3v-11zm-14 0v11l4-1.3v-11l-4 1.3z"/></svg>');
  background-size: 65%; /* größer */
  background-repeat: no-repeat;
  background-position: center;

  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

#map-tile-toggle-btn:hover {
  transform: scale(1.12); /* etwas größerer Hover */
  box-shadow: 0 3px 12px rgba(0,0,0,0.4);
}

#legend-toggle-btn {
  position: absolute;
  bottom: 20px;
  left: 5%; /* ⭐ unten links */
  width: 54px;
  height: 54px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  cursor: pointer;
  z-index: 9999;

  /* ⭐ EXAKT wie map-tile-toggle-btn */
   background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23b41821" viewBox="0 0 24 24">      <rect x="4" y="5" width="16" height="2" rx="1"/>      <rect x="4" y="11" width="12" height="2" rx="1"/>      <rect x="4" y="17" width="8" height="2" rx="1"/>    </svg>'); background-size: 65%;
  background-repeat: no-repeat;
  background-position: center;

  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

#legend-toggle-btn:hover {
  transform: scale(1.12);
  box-shadow: 0 3px 12px rgba(0,0,0,0.4);
}


.analysis-switch {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
}

.analysis-btn {
  flex: 1;
  padding: 14px 16px;              /* ✔ höhere Buttons */
  text-align: center;
  cursor: pointer;
  background: white;
  color: #b41821;
  font-size: 1rem;                 /* ✔ größere Schrift */
  font-weight: 700;                /* ✔ fetter */
  border: 2px solid #b41821;       /* ✔ kräftiger Rahmen */
  border-right: none;
  border-radius: 6px 0 0 6px;      /* ✔ leichte Rundung */
  transition: background 0.2s ease, color 0.2s ease;
}

.analysis-btn:last-child {
  border-right: 2px solid #b41821;
  border-radius: 0 6px 6px 0;      /* ✔ rechte Rundung */
}

/* ⭐ aktive Box */
.analysis-btn.active {
  background: #b41821 !important;
  color: white !important;
}

/* Hover nur für NICHT aktive */
.analysis-btn:not(.active):hover {
  background: #ffecec;
}
/* ============================================
   Untergeordneter ABS/HH Switch
   ============================================ */

#umsatz-mode-switch {
  background: #ececec;
  border-radius: 6px;
  padding: 3px;
  display: flex;
  gap: 4px;
  cursor: pointer;
  user-select: none;
  width: 100%;
  margin-top: -4px;
  margin-bottom: 4px;
}

#umsatz-mode-switch span {
  flex: 1;
  text-align: center;
  padding: 5px 0;
  font-size: 0.75rem;       /* ⭐ kleiner */
  font-weight: 600;
  border-radius: 4px;
  transition: 0.2s;
  color: #666;
}

#umsatz-mode-switch.active-left .mode-left {
  background: #b41821;
  color: white;
}

#umsatz-mode-switch.active-right .mode-right {
  background: #b41821;
  color: white;
}





.map-toggle {
  padding: 10px;
  border: 1px solid #b41821;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
  color: #b41821;
  font-weight: bold;
  text-align: center;

}

.map-toggle.active {
  background: #fff3f3;
  box-shadow: 0 0 6px rgba(180,24,33,0.4);
}
.hidden {
  display: none;
}
.umsatz-analysis-row {
  display: none;
}
.umsatz-analysis-row .switch-btn {
  padding: 6px 8px;
  font-size: 0.75rem;
  border-width: 1px;
}

.umsatz-analysis-row.show {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 6px;
}
.compact-switch {
  display: flex;
  background: #f2f2f2;
  border-radius: 6px;
  padding: 3px;
  gap: 3px;
  cursor: pointer;
  user-select: none;
}

.compact-switch span {
  flex: 1;
  text-align: center;
  padding: 5px 0;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: 4px;
  transition: 0.2s;
  color: #555;
}

.compact-switch.active-left .mode-left {
  background: #b41821;
  color: white;
}

.compact-switch.active-right .mode-right {
  background: #b41821;
  color: white;
}

.switch-label {
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 2px;
  color: #444;
}

.big-check {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border: 2px solid #b41821;
  border-radius: 6px;
  background: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.big-check:hover {
  background: #fff3f3;
}

.big-check input {
  transform: scale(1.3);
  accent-color: #b41821;
}
.triple-switch {
  display: flex;
  background: #f2f2f2;
  border-radius: 6px;
  padding: 3px;
  gap: 3px;
  user-select: none;
}

.triple-switch span {
  flex: 1;
  text-align: center;
  padding: 6px 0;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.2s;
  color: #555;
}

.triple-switch span.active {
  background: #b41821;
  color: white;
}

.triple-switch span.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 📦 Heatmap-Legende (unten links über dem Button) */
#heatmap-legend {
  position: absolute;
  bottom: 90px;
  left: 5%;

  background: white;
  border: 2px solid #b41821;
  border-radius: 10px;
  padding: 12px 14px;

  width: 220px;
  max-height: 300px;
  overflow-y: auto;

  font-size: 12px;
  font-family: sans-serif;

  z-index: 9998;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);

  pointer-events: none; /* blockiert NICHT die Karte */
  opacity: 1;
  transition: opacity 0.25s ease;
}

/* ⭐ Legende verstecken */
#heatmap-legend.hidden {
  opacity: 0;
  visibility: hidden;
}

/* Zeilen */
#heatmap-legend .heatmap-legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

/* Farbfelder */
#heatmap-legend .heatmap-legend-color {
  width: 20px;
  height: 12px;
  border-radius: 3px;
  border: 1px solid #999;
}

.heatmap-reveal {
  mask-image: linear-gradient(to right, black 0%, black 0%, transparent 0%);
  -webkit-mask-image: linear-gradient(to right, black 0%, black 0%, transparent 0%);
  transition: mask-image 0.8s ease, -webkit-mask-image 0.8s ease;
}


</style>

<div class="layout">

  <!-- 🔍 Filterbereich -->
  <div class="filter-container">

    <label for="erhebung-select">ErhebungsID:</label>
    <select id="erhebung-select"></select>

    <label for="jahr-select">Jahr:</label>
    <select id="jahr-select" disabled></select>

    <label for="nummer-select">Erhebungsnummer:</label>
    <select id="nummer-select" disabled></select>

    <button id="filter-button">Anzeigen</button>

    <!-- 📊 Tabellenbereich -->
    <div class="table-container">

      <!-- PLZ-Tabelle -->
      <div class="table-wrapper" id="table-container">
        <div id="streuverlust-box"></div>
      </div>

      <!-- NL-Tabelle -->
      <div id="nl-info-container"></div>

    </div>

  </div> <!-- END filter-container -->

  <!-- 🗺️ Kartenbereich -->
  <div class="map-container">

    <div id="loading-spinner" class="spinner"></div>

    <!-- Radius-Slider -->
    <div id="radius-slider-container">
      <label>Radius: <span id="radius-value">40</span> km</label>
      <input type="range" id="radius-slider" min="10" max="100" value="40" step="5">
    </div>

    <!-- 🔥 Kartenstil-Button -->
    <div id="map-tile-toggle-btn" title="Kartenstil wechseln"></div>

    <!-- Leaflet Map -->
    <div id="map"></div>

    <!-- 🔘 Legenden-Button (unten rechts) -->
    <div id="legend-toggle-btn" title="Legende einblenden"></div>

    <!-- 📦 Legenden-Overlay (unten rechts) -->
    <div id="heatmap-legend" class="heatmap-legend hidden"></div>

    <!-- 📦 Umsatz-Overview oben rechts -->
    <div id="umsatz-overview" class="hidden"></div>

  </div>

  <!-- 📌 Popup für WK -->
  <div id="side-popup" class="side-popup hidden"></div>

  <!-- 📌 Popup für Umsatz -->
  <div id="side-popup-umsatz" class="side-popup hidden"></div>

</div>

<!-- ⭐ MAP CONTROL PANEL -->
<div id="map-control-panel">

  <!-- CARD 1: ANALYSE-MODUS -->
  <div class="panel-card">
    <div class="panel-title">Analyse-Modus</div>

    <div class="switch-row">
      <button id="btn-wk" class="switch-btn active">
        <span class="icon">📊</span> WK
      </button>

      <button id="btn-umsatz" class="switch-btn">
        <span class="icon">💶</span> Umsatz
      </button>
    </div>

    <!-- Doppelbestreuung nur im WK-Modus -->
    <div id="wk-extra" class="option-row">
      <label><input type="checkbox" id="chk-doppelbestreuung" checked> Doppelbestreuung anzeigen</label>
    </div>

    <!-- Umsatz-Optionen (nur im Umsatzmodus) -->
    <div id="umsatz-options-row" class="option-row hidden">
      <label><input type="checkbox" id="chk-bestreuung"> 📍 Bestreuung</label>
    </div>
  </div>

  <!-- CARD 2: UMSATZ-EINSTELLUNGEN -->
  <div id="umsatz-panel" class="panel-card hidden">

    <div class="panel-title">Umsatz-Einstellungen</div>

    <!-- Umsatztyp -->
    <div class="switch-label">Umsatztyp</div>
    <div id="umsatz-type-switch" class="compact-switch">
      <span class="mode-left">Umsatz</span>
      <span class="mode-right">Werbeumsatz</span>
    </div>

    <!-- Werbeoptionen (nur bei Werbeumsatz sichtbar) -->
    <div id="werbe-options-row" class="option-row hidden">
      <label class="big-check">
        <input type="checkbox" id="chk-werbeumsatz" checked> Werbeumsatz
      </label>
      <label class="big-check">
        <input type="checkbox" id="chk-mitgekauft"> Mitgekauft
      </label>
    </div>

    <!-- Darstellung: 3-Wege-Switch -->
    <div class="switch-label">Darstellung</div>
    <div id="umsatz-analysis-switch" class="triple-switch">
      <span class="mode-abs active">Absolut</span>
      <span class="mode-hh">pro HH</span>
      <span class="mode-werbeanteil">Werbeanteil</span>
    </div>

    <!-- Kategorien -->
    <div class="category-grid">
      <div class="category-toggle active" data-cat="stationaer">🏬 Stationär</div>
      <div class="category-toggle" data-cat="pluscard">💳 Pluscard</div>
      <div class="category-toggle" data-cat="ra">📦 R&A</div>
      <div class="category-toggle" data-cat="online">🛒 KUBE OS</div>
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

    this.currentMapMode = "wk";       // "wk" oder "umsatz-multi"

    // Kategorien (Stationär, Pluscard, R&A, Online)
    this.activeCategories = new Set(["stationaer"]);

    // ⭐ NEU: Umsatztyp
    // "gesamt" = bisheriger Umsatz
    // "werbung" = Werbeumsatz / Mitgekauft-Kombination
    this.umsatzMainMode = "gesamt";
    this.useWerbeUmsatz = true;       // innerhalb Werbeumsatz: Werbeumsatz aktiv
    this.useZusatzUmsatz = false;     // innerhalb Werbeumsatz: Mitgekauft aktiv

    // Radiusfilter
    this.useRadiusFilter = true;

    // NL-Auswahl
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

      // 🚫 Ungültige Werte überspringen
      if (
        !erhID || erhID === "@NullMember" ||
        !jahr || jahr === "@NullMember" ||
        !nummer || nummer === "@NullMember"
      ) return;

      // 🧩 Struktur aufbauen
      struktur[erhID] = struktur[erhID] || {};
      struktur[erhID][jahr] = struktur[erhID][jahr] || new Set();
      struktur[erhID][jahr].add(nummer);
    });

    return struktur;
  }

async loadGeoJson() {
  if (this._geoLayer) return;

  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/Benne2000/PLZAnalyse/main/PLZ.geojson"
    );
    this._geoData = await response.json();

    // Notes extrahieren
    this.geoNotes = {};
    (this._geoData.features || []).forEach(feature => {
      const plz = feature.properties?.plz?.trim();
      const note = feature.properties?.note?.trim();
      if (plz && note) this.geoNotes[plz] = note;
    });

    // Erste Kennwerte berechnen
    const filteredData = this.getFilteredData();
    const plzWerte = this.extractPLZWerte(filteredData);

    // GeoJSON Layer
    this._geoLayer = L.geoJSON(this._geoData, {
      style: feature => {
        const plz = feature.properties?.plz?.trim();
        const values = plzWerte[plz] || { wk: 0, wkPot: 0 };
        const isHZ = this.hzFlags?.[plz] ?? false;

        const value = isHZ ? values.wk : values.wkPot;

        return {
          fillColor: this.getColor(value, isHZ),
          weight: 1,
          opacity: 1,
          color: "white",
          fillOpacity: 0.5
        };
      },

      onEachFeature: (feature, layer) => {
        layer.on("click", e => {
          const plz = String(e.target.feature.properties.plz).padStart(5, "0");

          this.highlightMapArea(plz);
          this.highlightTableRowByPLZ(plz);

          const popupWK = this._shadowRoot.getElementById("side-popup");
          const popupU = this._shadowRoot.getElementById("side-popup-umsatz");

          popupWK?.classList.remove("show");
          popupWK?.classList.add("hidden");

          popupU?.classList.remove("show");
          popupU?.classList.add("hidden");

          // -----------------------------
          // Umsatz-Modi (inkl. Werbeanteil)
          // -----------------------------
          if (this.currentMapMode === "umsatz-multi" || this.currentMapMode === "werbeanteil") {
            this.activePopupType = "umsatz";

            const values = this.filteredPLZWerte?.[plz];
            if (!values) {
              this.showEmptyUmsatzPopup(plz);
              return;
            }

            this.showUmsatzPopup(plz, values);
            return;
          }

          // -----------------------------
          // WK-Modus
          // -----------------------------
          this.activePopupType = "wk";
          const kennwerte = this.filteredKennwerte?.[plz];
          this.showPopup(e.target.feature, kennwerte);
        });
      }
    }).addTo(this.map);

  } catch (err) {
    console.error("Fehler beim Laden des GeoJSON:", err);
  }
}


applyMapMode(mode) {
  this.currentMapMode = mode;
  this.updateGeoLayer(); // färbt die Karte neu
}


renderDataTable(data) {
  console.log("▶ renderDataTable aufgerufen");
  console.log("   _sortState beim Render:", this._sortState);

  let entries = Object.entries(data || {});

  // 🔥 PLZ 00000 (Streuverlust) entfernen
  entries = entries.filter(([plz]) => plz !== "00000");

  // 🔥 Radiusfilter anwenden
  if (this.plzImRadius && this.plzImRadius.size > 0) {
    entries = entries.filter(([plz]) => {
      const norm = String(plz).padStart(5, "0");
      return this.plzImRadius.has(norm);
    });
  }

  // Standard-Sortierung nach PLZ, wenn keine Sortierung aktiv ist
  if (!this._sortState || this._sortState.column == null) {
    entries = entries.sort(([plzA], [plzB]) => plzA.localeCompare(plzB));
  }

  // Tabelle rendern
  this.renderDataTableFromEntries(entries);

  // 🔥 Sticky-Footer aktualisieren
  const box = this._shadowRoot.getElementById("streuverlust-box");
  this.updateStreuverlustFooter();

}

updateStreuverlustFooter() {
  const box = this._shadowRoot.getElementById("streuverlust-box");
  if (!box) return;

  if (!this.streuverlust) {
    box.innerHTML = "";
    return;
  }

  box.innerHTML = `
    <div style="
      background: white;
      padding: 10px;
      border-top: 2px solid #b41821;
      font-size: 0.85rem;
    ">
      <strong>Streuverlust:</strong>
      ${this.streuverlust.umsatz.toLocaleString("de-DE")} €,
      ${(this.streuverlust.anteil * 100).toFixed(1)} %
    </div>
  `;
}

computeStreuverlust() {
  if (!this.filteredData) return;

  const result = {
    umsatz: 0,
    hzKosten: 0,
    umsatzErhebung: 0,
    kdErhebung: 0,
    auflage: 0,
    potHzAbs: 0,
    avg: {
      werbeverweigerer: 0,
      haushalte: 0,
      kaufkraft: 0
    }
  };

  const avgArrays = {
    werbeverweigerer: [],
    haushalte: [],
    kaufkraft: []
  };

  let totalErhebungUmsatz = 0;

  this.filteredData.forEach(row => {
    const nl = row["dimension_niederlassung_0"]?.id?.trim();
    const rawPLZ = row["dimension_plz_0"]?.id ?? row["dimension_plz_0"]?.raw;
    const plz = String(rawPLZ || "").padStart(5, "0");

    // NL-Filter
    if (this._selectedNLs.size > 0 && !this._selectedNLs.has(nl)) return;

    // Gesamtumsatz der Erhebung (für Anteil)
    totalErhebungUmsatz += row["value_hr_n_umsatz_0"]?.raw ?? 0;

    // PLZ im Radius → kein Streuverlust
    if (this.plzImRadius instanceof Set && this.plzImRadius.has(plz)) return;

    // PLZ außerhalb Radius → Streuverlust
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

  const avg = arr =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  result.avg.werbeverweigerer = avg(avgArrays.werbeverweigerer);
  result.avg.haushalte = avg(avgArrays.haushalte);
  result.avg.kaufkraft = avg(avgArrays.kaufkraft);

  result.anteil =
    totalErhebungUmsatz > 0
      ? result.umsatz / totalErhebungUmsatz
      : 0;

  this.streuverlust = result;
}


sortTableByColumn(columnIndex) {
  console.log("▶ sortTableByColumn aufgerufen, columnIndex:", columnIndex);
  console.log("   SortState VOR Toggle:", this._sortState);

  if (this._sortState.column === columnIndex) {
    this._sortState.direction =
      this._sortState.direction === "asc" ? "desc" : "asc";
  } else {
    this._sortState.column = columnIndex;
    this._sortState.direction = "desc";
  }

  console.log("   SortState NACH Toggle:", this._sortState);

  const dir = this._sortState.direction === "asc" ? 1 : -1;

  const entries = Object.entries(this.filteredKennwerte);
  console.log("   Einträge vor Sortierung:", entries.length);

  const sorted = entries.sort(([plzA, a], [plzB, b]) => {
    let valA, valB;

    switch (columnIndex) {
      case 0: // PLZ
        valA = plzA;
        valB = plzB;
        break;

      case 1: // Gemeinde
        valA = this.geoNotes?.[plzA] || "";
        valB = this.geoNotes?.[plzB] || "";
        break;

      case 2: // HZ
        valA = this.hzFlags[plzA] ? 1 : 0;
        valB = this.hzFlags[plzB] ? 1 : 0;
        break;

      case 3: // Umsatz
        valA = a["value_hr_n_umsatz_0"]?.raw ?? -999999;
        valB = b["value_hr_n_umsatz_0"]?.raw ?? -999999;
        break;

      case 4: // WK
        valA = a["value_wk_nachbar_0"]?.raw ?? -999999;
        valB = b["value_wk_nachbar_0"]?.raw ?? -999999;
        break;
    }

    if (typeof valA === "string") {
      return valA.localeCompare(valB) * dir;
    }

    return (valA - valB) * dir;
  });

  console.log("   Erste 5 PLZ nach Sortierung:",
    sorted.slice(0, 5).map(([plz]) => plz)
  );

  // Wichtig: wir verlassen uns NICHT mehr auf Objekt-Reihenfolge,
  // sondern geben das sortierte Array direkt an den Renderer
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
    container.textContent = 'Keine Daten verfügbar.';
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
  { label: 'PLZ', width: '40px' },
  { label: 'Gemeinde', width: '90px' },
  { label: 'HZ', width: '20px' },
  { label: 'Netto-Umsatz\n(Jahr)', width: '50px' },
  { label: 'WK (%)', width: '50px' }   // ✔ geändert
];


  headers.forEach(({ label, width }, i) => {
    const th = document.createElement('th');
    th.innerHTML = `${label} <span class="sort-icon"></span>`;
    th.style.backgroundColor = '#b41821';
    th.style.color = 'white';
    th.style.padding = '8px';
    th.style.position = 'sticky';
    th.style.top = '0';
    th.style.zIndex = '2';
    th.style.whiteSpace = 'pre-line';
    th.style.width = width;
    th.style.borderBottom = '1px solid #b41821';
    th.style.borderRight = '1px solid #b41821';
    th.style.cursor = 'pointer';

    th.addEventListener('click', () => this.sortTableByColumn(i));

    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  entries.forEach(([plz, kennwerte]) => {
    const tr = document.createElement('tr');
    tr.style.cursor = "pointer";

    tr.addEventListener("click", () => {
      this.highlightMapArea(plz);
      this.openPopupFromTable(plz);
      this.highlightTableRow(tr);
    });

    let note = this.geoNotes?.[plz] || "Keine PLZ-Bezeichnung";
    note = note.replace(/^\d{4,5}\s*[-–]?\s*/, "").trim();

   let symbol = "🔴"; // Standard

if (this.filteredKennwerte[plz]?.isCritical) {
  symbol = "⚠️";
} else if (this.filteredKennwerte[plz]?.isHZ) {
  symbol = "🟢";
}


    const umsatz = kennwerte["value_hr_n_umsatz_0"]?.raw?.toLocaleString('de-DE') ?? '–';
    const wk = kennwerte["value_wk_in_percent_0"]?.raw?.toFixed(1) ?? '–';  // ✔ geändert

const rowValues = [plz, note, symbol, umsatz, wk];


    rowValues.forEach((text, i) => {
      const td = document.createElement('td');
      td.textContent = text;
      td.style.padding = '6px 8px';
      td.style.borderBottom = '1px solid #b41821';
      td.style.borderRight = '1px solid #b41821';
      td.style.fontSize = '0.8rem';
      td.style.whiteSpace = 'nowrap';
      td.style.overflow = 'hidden';
      td.style.textOverflow = 'ellipsis';
      td.style.width = headers[i].width;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  scrollWrapper.appendChild(table);
  container.appendChild(scrollWrapper);

  const footer = document.createElement("div");
  footer.id = "streuverlust-box";
  footer.style.position = "sticky";
  footer.style.bottom = "0";
  footer.style.background = "white";
  footer.style.padding = "10px";
  footer.style.borderTop = "2px solid #b41821";
  footer.style.zIndex = "10";
  container.appendChild(footer);

  if (this._sortState?.column != null) {
    this.updateSortIcons(this._sortState.column);
  }
  this.updateStreuverlustFooter();

}



      
// highlightTableRow(rowElement)
highlightTableRow(rowElement) {
  if (this._lastHighlightedRow) {
    this._lastHighlightedRow.classList.remove("table-row-selected");
  }

  rowElement.classList.add("table-row-selected");
  this._lastHighlightedRow = rowElement;
}
      
      // highlightTableRowByPLZ(plz)
highlightTableRowByPLZ(plz) {
  const container = this._shadowRoot.getElementById("table-container");
  const rows = container.querySelectorAll("tbody tr");

  rows.forEach(row => {
    const cellPLZ = row.children[0]?.textContent?.trim();
    if (cellPLZ === plz) {
      this.highlightTableRow(row);
    }
  });
}

   
openPopupFromTable(plz) {
  if (!this._geoLayer) return;

  let targetLayer = null;

  // Layer finden
  this._geoLayer.eachLayer(layer => {
    if (String(layer.feature?.properties?.plz).padStart(5, "0") === plz) {
      targetLayer = layer;
    }
  });

  if (!targetLayer) return;

  // Popups referenzieren
  const popupWK = this._shadowRoot.getElementById("side-popup");
  const popupUmsatz = this._shadowRoot.getElementById("side-popup-umsatz");

  // Beide schließen (safe)
  if (popupWK) {
    popupWK.classList.remove("show");
    popupWK.classList.add("hidden");
  }
  if (popupUmsatz) {
    popupUmsatz.classList.remove("show");
    popupUmsatz.classList.add("hidden");
  }

  // Umsatzmodus → Umsatz-Popup öffnen
  if (this.currentMapMode === "umsatz-multi") {
    const values = this.filteredPLZWerte?.[plz];

    if (values) {
      this.showUmsatzPopup(plz, values);
    } else {
      this.showEmptyUmsatzPopup(plz);
    }

    return;
  }

  // WK-Modus → WK-Popup öffnen
  const kennwerte = this.filteredKennwerte?.[plz] || {};
  this.showPopup(targetLayer.feature, kennwerte);
}


      
// highlightMapArea(plz)
highlightMapArea(plz) {
  if (!this._geoLayer) return;

  let targetLayer = null;

  this._geoLayer.eachLayer(layer => {
    if (layer.feature?.properties?.plz === plz) {
      targetLayer = layer;
    }
  });

  if (!targetLayer) return;

  if (this._lastHighlightedLayer) {
    this._lastHighlightedLayer.setStyle(this._lastHighlightedStyle);
  }

  this._lastHighlightedStyle = {
    weight: targetLayer.options.weight,
    color: targetLayer.options.color,
    fillOpacity: targetLayer.options.fillOpacity
  };

  targetLayer.setStyle({
    weight: 4,
    color: "#ffeb3b",
    fillOpacity: targetLayer.options.fillOpacity
  });

  this._lastHighlightedLayer = targetLayer;
}

      
updateSortIcons(activeIndex) {
  const headerCells = this._shadowRoot.querySelectorAll("th .sort-icon");

  headerCells.forEach((icon, i) => {
    if (i !== activeIndex) {
      icon.textContent = ""; // andere Spalten leeren
      return;
    }

    icon.textContent = this._sortState.direction === "asc" ? "▲" : "▼";
  });
}

// zoomToFilteredPLZ()
zoomToFilteredPLZ() {
  if (!this._geoLayer || !this.plzImRadius || this.plzImRadius.size === 0) {
    console.warn("⚠️ Kein Autozoom möglich – keine PLZ im Radius.");
    return;
  }

  const bounds = L.latLngBounds([]);

  this._geoLayer.eachLayer(layer => {
    const plz = String(layer.feature?.properties?.plz ?? "").padStart(5, "0");

    if (this.plzImRadius.has(plz)) {
      const layerBounds = layer.getBounds?.();
      if (layerBounds) {
        bounds.extend(layerBounds);
      }
    }
  });

  if (bounds.isValid()) {
    this.map.fitBounds(bounds, {
      padding: [30, 30],
      maxZoom: 12
    });
  } else {
    console.warn("⚠️ Keine gültigen Bounds für Autozoom gefunden.");
  }
}

initializeMapBase() {
 

  // Helper
  const $ = id => this._shadowRoot.getElementById(id);

  const mapContainer = $("map");
  if (!mapContainer) return;

  // Karte
  this.map = L.map(mapContainer).setView([49.4, 8.7], 7);

  // Basiszustände
  this.currentMapMode = "wk";              // wk | umsatz-multi | werbeanteil
  this.activePopupType = "wk";             // wk | umsatz
  this.umsatzDarstellung = "abs";          // abs | hh | werbeanteil
  this.umsatzMainMode = "gesamt";          // gesamt | werbung
  this.useWerbeUmsatz = true;
  this.useZusatzUmsatz = false;

  this.activeCategories = new Set(["stationaer"]);
  this.showBestreuung = false;
  this.useRadiusFilter = true;

  // LayerGroups
  this.filteredGroup = L.layerGroup().addTo(this.map);
  this.neighbourGroup = L.layerGroup().addTo(this.map);
  this.radiusGroup = L.layerGroup().addTo(this.map);
  this.bestreuungGroup = L.layerGroup().addTo(this.map);

  // Rendering starten
  this.render();
  this.initRadiusSlider();

  // Panel
  const panel = $("map-control-panel");

  // Buttons
  const btnWK = $("btn-wk");
  const btnUmsatz = $("btn-umsatz");

  // Umsatzpanel
  const umsatzPanel = $("umsatz-panel");

  // Extra-Bereiche
  const wkExtra = $("wk-extra");
  const umsatzOptionsRow = $("umsatz-options-row");

  // Switches
  const typeSwitch = $("umsatz-type-switch");
  const darstellungSwitch = $("umsatz-analysis-switch");

  // 3-Wege-Switch Buttons
  const btnAbs = darstellungSwitch?.querySelector(".mode-abs");
  const btnHH = darstellungSwitch?.querySelector(".mode-hh");
  const btnWA = darstellungSwitch?.querySelector(".mode-werbeanteil");

  // Werbeoptionen
  const werbeRow = $("werbe-options-row");
  const chkWerbe = $("chk-werbeumsatz");
  const chkMit = $("chk-mitgekauft");

  // Bestreuung
  const chkBestreuung = $("chk-bestreuung");

  // Doppelbestreuung
  const chkDoppel = $("chk-doppelbestreuung");
  this.showCritical = chkDoppel.checked;

  // Radiusfilter
  const chkRadius = $("chk-radiusfilter");

  // Kartenstil
  const tileBtn = $("map-tile-toggle-btn");
  tileBtn?.addEventListener("click", () => this.toggleMapTiles());

const legendBtn = this._shadowRoot.getElementById("legend-toggle-btn");
const legendBox = this._shadowRoot.getElementById("heatmap-legend");

legendBtn.addEventListener("click", () => {
  legendBox.classList.toggle("hidden");
});



  // ---------------------------------------------------------
  // INITIAL: Werbeanteil deaktivieren
  // ---------------------------------------------------------
  if (btnWA) btnWA.classList.add("disabled");

  // ---------------------------------------------------------
  // WK-MODUS
  // ---------------------------------------------------------
btnWK?.addEventListener("click", () => {

    btnWK.classList.add("active");
    btnUmsatz.classList.remove("active");

    this.currentMapMode = "wk";
    this.activePopupType = "wk";

    wkExtra.style.display = "block";
    umsatzOptionsRow.style.display = "none";
    umsatzPanel.classList.add("hidden");

    panel.classList.remove("panel-large", "panel-medium");

    // ⭐ WICHTIG: Checkbox-Wert übernehmen
    this.showCritical = chkDoppel.checked;

    // Darstellung zurücksetzen
    this.umsatzDarstellung = "abs";
    darstellungSwitch.querySelectorAll("span").forEach(s => s.classList.remove("active"));
    btnAbs.classList.add("active");

    btnWA.classList.add("disabled");

   // $("side-popup")?.classList.remove("show");
   // $("side-popup-umsatz")?.classList.remove("show");

    const { erhID, jahr, nummer } = this._activeFilter || {};
    if (erhID && jahr && nummer) {
        this.prepareUmsatzPLZWerte();
        this.computeWKKennwerte();
        this.updateGeoLayer();
    } else {
        this.updateGeoLayer();
    }
    this.updateHeatmapLegend();
});


  // ---------------------------------------------------------
  // UMSATZ-MODUS
  // ---------------------------------------------------------
  btnUmsatz?.addEventListener("click", () => {

     const typeSwitch = this._shadowRoot.getElementById("umsatz-type-switch");
typeSwitch.classList.add("active-left");   // Umsatz = links aktiv

    btnUmsatz.classList.add("active");
    btnWK.classList.remove("active");

    this.currentMapMode = "umsatz-multi";
    this.activePopupType = "umsatz";

    this.prepareUmsatzPLZWerte();

    wkExtra.style.display = "none";
    umsatzOptionsRow.style.display = "flex";
    umsatzPanel.classList.remove("hidden");

    panel.classList.remove("panel-medium");
    panel.classList.add("panel-large");


    // Darstellung auf ABS setzen
    this.umsatzDarstellung = "abs";
    darstellungSwitch.querySelectorAll("span").forEach(s => s.classList.remove("active"));
    btnAbs.classList.add("active");

    // Werbeanteil deaktivieren (Umsatztyp = gesamt)
    btnWA.classList.add("disabled");

    //$("side-popup-umsatz")?.classList.remove("show");
   // $("side-popup")?.classList.remove("show");

    this.updateGeoLayer();
    this.updateHeatmapLegend();
  });

  // ---------------------------------------------------------
  // UMSATZTYP (Umsatz / Werbeumsatz)
  // ---------------------------------------------------------
  typeSwitch?.addEventListener("click", () => {

    const isWerbung = this.umsatzMainMode === "gesamt";
    this.umsatzMainMode = isWerbung ? "werbung" : "gesamt";

    typeSwitch.classList.toggle("active-right", isWerbung);
    typeSwitch.classList.toggle("active-left", !isWerbung);

    werbeRow.style.display = isWerbung ? "flex" : "none";

    if (isWerbung) {
      // Werbeanteil aktivierbar
      btnWA.classList.remove("disabled");

      // Standard: Werbeumsatz aktiv
      this.useWerbeUmsatz = true;
      this.useZusatzUmsatz = false;
      chkWerbe.checked = true;
      chkMit.checked = false;
      chkMit.disabled = false;

    } else {
      // Werbeanteil deaktivieren
      btnWA.classList.add("disabled");

      // Darstellung zurück auf Absolut
      this.umsatzDarstellung = "abs";
      darstellungSwitch.querySelectorAll("span").forEach(s => s.classList.remove("active"));
      btnAbs.classList.add("active");
    }

    this.updateGeoLayer();
  });

  // ---------------------------------------------------------
  // Werbeumsatz / Mitgekauft
  // ---------------------------------------------------------
  chkWerbe?.addEventListener("change", () => {
    this.useWerbeUmsatz = chkWerbe.checked;

    if (!this.useWerbeUmsatz && !this.useZusatzUmsatz) {
      this.useWerbeUmsatz = true;
      chkWerbe.checked = true;
    }

    this.updateGeoLayer();
  });

  chkMit?.addEventListener("change", () => {
    this.useZusatzUmsatz = chkMit.checked;

    if (!this.useWerbeUmsatz && !this.useZusatzUmsatz) {
      this.useWerbeUmsatz = true;
      chkWerbe.checked = true;
    }

    this.updateGeoLayer();
  });

  // ---------------------------------------------------------
  // 3-WEGE-SWITCH: Absolut / pro HH / Werbeanteil
  // ---------------------------------------------------------
// ---------------------------------------------------------
// 3-WEGE-SWITCH: Absolut / pro HH / Werbeanteil
// ---------------------------------------------------------
btnAbs?.addEventListener("click", () => {
  this.umsatzDarstellung = "abs";
  this.currentMapMode = "umsatz-multi";
  this.activePopupType = "umsatz";

  darstellungSwitch.querySelectorAll("span").forEach(s => s.classList.remove("active"));
  btnAbs.classList.add("active");

  console.log("➡️ Switch: ABS | umsatzDarstellung =", this.umsatzDarstellung);

  // 🔁 Werte neu berechnen
  this.prepareUmsatzPLZWerte();
  this.computeWKKennwerte();
  this.updateGeoLayer();
});

btnHH?.addEventListener("click", () => {
  this.umsatzDarstellung = "hh";
  this.currentMapMode = "umsatz-multi";
  this.activePopupType = "umsatz";

  darstellungSwitch.querySelectorAll("span").forEach(s => s.classList.remove("active"));
  btnHH.classList.add("active");

  console.log("➡️ Switch: HH | umsatzDarstellung =", this.umsatzDarstellung);

  // 🔁 Werte neu berechnen (pro HH)
  this.prepareUmsatzPLZWerte();
  this.computeWKKennwerte();
  this.updateGeoLayer();
});

btnWA?.addEventListener("click", () => {
  if (this.umsatzMainMode !== "werbung") return;

  this.umsatzDarstellung = "werbeanteil";
  this.currentMapMode = "werbeanteil";
  this.activePopupType = "umsatz";

  darstellungSwitch.querySelectorAll("span").forEach(s => s.classList.remove("active"));
  btnWA.classList.add("active");

  // Automatische Checkbox-Logik
  chkWerbe.checked = true;
  this.useWerbeUmsatz = true;

  chkMit.checked = false;
  chkMit.disabled = true;
  this.useZusatzUmsatz = false;

  console.log("➡️ Switch: WERBEANTEIL | umsatzDarstellung =", this.umsatzDarstellung);

  // 🔁 Werte neu berechnen (Werbeanteil basiert auf Umsatzaggregation)
  this.prepareUmsatzPLZWerte();
  this.computeWKKennwerte();
  this.updateGeoLayer();
});


  // ---------------------------------------------------------
  // Kategorien
  // ---------------------------------------------------------
// in initializeMapBase(), bei den Kategorie-Toggles:
this._shadowRoot.querySelectorAll(".category-toggle").forEach(toggle => {
  toggle.addEventListener("click", () => {
    const cat = toggle.dataset.cat;
    if (!cat) return;

    if (this.activeCategories.has(cat)) {
      this.activeCategories.delete(cat);
      toggle.classList.remove("active");
    } else {
      this.activeCategories.add(cat);
      toggle.classList.add("active");
    }

    this.currentMapMode = "umsatz-multi";
    this.activePopupType = "umsatz";

    // ✅ Werbeanteil neu berechnen
    this.prepareUmsatzPLZWerte();
    this.computeWKKennwerte();

    this.updateGeoLayer();
  });
});


  // ---------------------------------------------------------
  // Doppelbestreuung
  // ---------------------------------------------------------
  chkDoppel?.addEventListener("change", () => {
    this.showCritical = chkDoppel.checked;
    this.updateGeoLayer();
  });

  // ---------------------------------------------------------
  // Bestreuung
  // ---------------------------------------------------------
  chkBestreuung?.addEventListener("change", () => {
    this.showBestreuung = chkBestreuung.checked;
    this.updateBestreuungMarkers();
  });

  // ---------------------------------------------------------
  // Radiusfilter
  // ---------------------------------------------------------
  chkRadius?.addEventListener("change", () => {
    this.useRadiusFilter = chkRadius.checked;

    if (!this.useRadiusFilter) {
      this.plzImRadius = new Set(Object.keys(this.filteredPLZWerte || {}));
      this.updateGeoLayer();
      this.renderDataTable(this.filteredKennwerte);
      return;
    }

    const slider = $("radius-slider");
    const radius = slider ? Number(slider.value) : 0;
    this.applyRadiusFilter(radius);
  });
}






updateBestreuungMarkers() {
  // Erst alles löschen
  this.bestreuungGroup.clearLayers();

  if (!this.showBestreuung) return;

  if (!this._geoLayer) return;

  this._geoLayer.eachLayer(layer => {
    const plz = String(layer.feature?.properties?.plz ?? "").padStart(5, "0");

    const daten = this.filteredKennwerte?.[plz];
    if (!daten) return;

    // Nur HZ-Flag X anzeigen
    if (daten.isHZ !== true) return;

    const center = layer.getBounds().getCenter();

    const icon = L.divIcon({
      html: `<div style="
        background:#ffffff;
        border:2px solid #1565c0;
        border-radius:50%;
        width:22px;
        height:22px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:14px;
        font-weight:bold;
        color:#1565c0;
      ">H</div>`,
      className: "",
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    L.marker(center, { icon, interactive: false }).addTo(this.bestreuungGroup);
  });
}



      initializeMapTiles() {
        if (!this.map) return;
        this._tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19
        }).addTo(this.map);

      }

      removeMapTiles() {
        if (this.map && this._tileLayer) {
          this.map.removeLayer(this._tileLayer);
          this._tileLayer = null;
        }
      }

      toggleMapTiles() {
        if (this._tilesVisible) {
          this.removeMapTiles();
          this._tilesVisible = false;
        } else {
          this.initializeMapTiles();
          this._tilesVisible = true;
        }
      }

  toggleNeighbours() {
    if (this.map.hasLayer(this.neighbourGroup)) {
      this.map.removeLayer(this.neighbourGroup);
    } else {
      this.map.addLayer(this.neighbourGroup);
    }
  }
   createAllMarkers() {
  if (!this.filteredGroup) return;

  this.filteredGroup.clearLayers();
  this.neighbourGroup?.clearLayers();
  this.radiusGroup?.clearLayers();

  this.allMarkers = [];
  this.nlMarkers = [];

  if (!this.Niederlassung || !this.nlKoordinaten) return;

  const seen = new Set();

  // Haupt-Niederlassungen
  Object.entries(this.Niederlassung).forEach(([nlKey, nlName]) => {
    const coords = this.nlKoordinaten[nlKey];
    if (!coords || seen.has(nlKey)) return;

    const marker = L.marker([coords.lat, coords.lon], {
      icon: this.createMarkerIcon(nlName),
      title: nlName,
      plzs: [nlKey]
    });

    marker.setZIndexOffset(1000);
    marker.on("click", () => this.toggleNLSelection(nlKey));

    this.allMarkers.push(marker);
    this.filteredGroup.addLayer(marker);

    this.nlMarkers.push({ lat: coords.lat, lng: coords.lon, marker });
    seen.add(nlKey);
  });

  // Extra-Niederlassungen
  if (Array.isArray(this.extraNLs)) {
    this.extraNLs.forEach(({ nl, lat, lon }) => {
      const marker = L.marker([lat, lon], {
        icon: this.createMarkerIcon(nl),
        title: nl,
        plzs: [nl]
      });

      marker.setZIndexOffset(1000);
      marker.on("click", () => this.toggleNLSelection(nl));

      this.allMarkers.push(marker);
      this.filteredGroup.addLayer(marker);

      this.nlMarkers.push({ lat, lng: lon, marker });
    });
  }

  // NL-Auswahl initialisieren
  this.allNLs = [
    ...Object.keys(this.Niederlassung),
    ...(this.extraNLs?.map(e => e.nl) ?? [])
  ];

  this._selectedNLs = new Set(this.allNLs);

  this.applyNLFilter([...this._selectedNLs]);

  const radius = Number(this._shadowRoot.getElementById("radius-slider")?.value ?? 0);
  this.applyRadiusFilter(radius);

  this.updateGeoLayer();
  this.updateNLSelectionUI?.();
}


applyNLFilter(selectedNLs) {
  if (!this._selectedNLs) this._selectedNLs = new Set();
  this._selectedNLs = new Set(selectedNLs);

  console.log("🔵 applyNLFilter():", [...this._selectedNLs]);

  if (!this.filteredData || this.filteredData.length === 0) {
    console.warn("⚠️ applyNLFilter(): Keine Erhebungsdaten vorhanden!");
    return;
  }



  // 1️⃣ PLZ-Liste nach NL-Filter
  this.filteredPLZs = this.filteredData
    .filter(row => {
      const nl = row["dimension_niederlassung_0"]?.id?.trim();
      return this._selectedNLs.size === 0 || this._selectedNLs.has(nl);
    })
    .map(row => row["dimension_plz_0"]?.id?.trim())
    .filter(plz => plz && plz !== "@NullMember");

  // 2️⃣ Marker aktualisieren (aktive vs. Phantom)
  this.updateMarkers();
  this.computeWKKennwerte();
  // 3️⃣ Radius erneut anwenden
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
    const color = isPhantom ? "#9a9a9a" : "#ed1f34";
    const opacity = isPhantom ? 0.8 : 1;

    const markerHtml = `
      <div style="
        width:30px;height:30px;
        background-color:${color};
        opacity:${opacity};
        border-radius:50% 50% 50% 0;
        box-shadow:-1px 1px 4px rgba(0,0,0,.5);
        transform:rotate(-45deg);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:10px;
        font-weight:bold;
        color:white;
        font-family:sans-serif;">
        <div style="transform:rotate(45deg);">${nl}</div>
      </div>
    `;

    this.iconCache[key] = L.divIcon({
      html: markerHtml,
      className: "",
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });
  }

  return this.iconCache[key];
}


showPopup(feature) {
  const plz = String(feature.properties?.plz ?? "")
    .padStart(5, "0")
    .trim();

  const note = feature.properties?.note || "Keine Notiz";

  // Umsatz-Popup schließen
  const popupUmsatz = this._shadowRoot.getElementById("side-popup-umsatz");
  if (popupUmsatz) {
    popupUmsatz.classList.remove("show");
    popupUmsatz.classList.add("hidden");
  }

  // Panel anpassen
  const panel = this._shadowRoot.getElementById("map-control-panel");
  panel.classList.remove("panel-large");
  panel.classList.add("panel-medium");

  // WK-Daten
  const daten = this.filteredKennwerte?.[plz] || {};
  const umsatz = this.filteredPLZWerte?.[plz] || {};

  // Symbol bestimmen
  let symbol = "🔴";
  if (daten?.isCritical) symbol = "⚠️";
  else if (daten?.isHZ) symbol = "🟢";

  // Beschriftungen Haupttabelle
  const beschreibungen = {
    value_hr_n_umsatz_0: "Netto-Umsatz (Jahr)",
    value_umsatz_p_hh_0: "Umsatz p. HH",
    value_wk_in_percent_0: "Werbekosten (%)",
    value_wk_nachbar_0: "WK (%) incl. Nachb.",
    value_hz_kosten_0: "HZ-Werbekosten",
    value_werbeverweigerer_0: "Werbeverweigerer (%)",
    value_haushalte_0: "Haushalte",
    value_kaufkraft_0: "BM-Kaufkraft-Idx",
    value_ums_erhebung_0: "Umsatz",
    value_kd_erhebung_0: "Anzahl Kunden",
    value_bon_erhebung_0: "Ø-Bon",
    value_auflage_0: "Auflage"
  };

  // Zusatz-Beschriftungen
  const beschreibungenSide = {
    value_wk_potentiell_0: "WK in %",
    value_hz_potentiell_0: "HZ-Werbekosten"
  };

  // Umsatzdaten korrekt einfügen
  daten.value_umsatz_p_hh_0 = { raw: umsatz.umsatzProHaushalt ?? 0 };
  daten.value_haushalte_0 = { raw: umsatz.haushalte ?? 0 };

  // Durchschnittsbon berechnen
  const kd = daten.value_kd_erhebung_0?.raw ?? 0;
  const umsatzErhebung = daten.value_ums_erhebung_0?.raw ?? 0;
  daten.value_bon_erhebung_0 = {
    raw: kd > 0 ? Number((umsatzErhebung / kd).toFixed(2)) : 0
  };

  // Haupttabelle aufbauen
  let rows = "";
  Object.entries(beschreibungen).forEach(([id, label], index) => {
    const rawValue = daten?.[id]?.raw;
    const wert = typeof rawValue === "number"
      ? rawValue.toLocaleString("de-DE")
      : "–";

    if (index === 8) {
      rows += `<tr><td colspan="2" class="section-title">Daten Erhebung</td></tr>`;
    }

    rows += `
      <tr class="kennzahl-row">
        <td class="label-cell">${label}</td>
        <td class="value-cell">${wert}</td>
      </tr>
    `;
  });

  // WK-Popup holen
  const sidePopup = this._shadowRoot.getElementById("side-popup");

  // Hauptinhalt setzen
  sidePopup.innerHTML = `
    <button class="close-btn">×</button>
    <table>
      <thead>
        <tr>
          <th colspan="2" class="title-cell" title="${note}">
            ${symbol} ${note}
          </th>
        </tr>
        <tr><th colspan="2" class="subtitle-cell">Hochrechnung Jahr</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  // EXTRA-TABELLE WIEDER EINBAUEN
  const isHZ = daten?.isHZ === false;     // nur wenn NICHT HZ
  const umsatzJahr = daten?.value_hr_n_umsatz_0?.raw;

  if (isHZ && typeof umsatzJahr === "number" && umsatzJahr > 0) {
    const wkPotRaw = daten.value_wk_potentiell_0?.raw;
    const hzPotRaw = daten.value_hz_potentiell_0?.raw;

    const wkPot = typeof wkPotRaw === "number"
      ? wkPotRaw.toLocaleString("de-DE")
      : "–";

    const hzPot = typeof hzPotRaw === "number"
      ? hzPotRaw.toLocaleString("de-DE")
      : "–";

    const extraTable = `
      <table class="extra-table">
        <thead>
          <tr><th colspan="2">Potentielle Bestreuung (100% HH-Abdeckung)</th></tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-cell">${beschreibungenSide.value_wk_potentiell_0}</td>
            <td class="value-cell">${wkPot}</td>
          </tr>
          <tr>
            <td class="label-cell">${beschreibungenSide.value_hz_potentiell_0}</td>
            <td class="value-cell">${hzPot}</td>
          </tr>
        </tbody>
      </table>
    `;

    sidePopup.insertAdjacentHTML("beforeend", extraTable);
  }

  // Animation
  sidePopup.classList.remove("hidden");
  void sidePopup.offsetWidth;
  sidePopup.classList.add("show");

  // Close-Button
  sidePopup.querySelector(".close-btn").onclick = () => {
    sidePopup.classList.remove("show");
    sidePopup.classList.add("hidden");
  };
}

showUmsatzPopup(plz, values) {
  const popup = this._shadowRoot.getElementById("side-popup-umsatz");
  const popupWK = this._shadowRoot.getElementById("side-popup");

  if (popupWK) {
    popupWK.classList.remove("show");
    popupWK.classList.add("hidden");
  }

  const panel = this._shadowRoot.getElementById("map-control-panel");
  panel.classList.remove("panel-large");
  panel.classList.add("panel-medium");

  const isWerbungMode = this.umsatzMainMode === "werbung";
  const useWerbe = this.useWerbeUmsatz === true;
  const useZusatz = this.useZusatzUmsatz === true;

  const note = this.geoNotes?.[plz] || "Keine Notiz";

  // Hilfsfunktion
  const pickPair = (base, werb, zusatz, baseHH, werbHH, zusatzHH) => {
    if (!isWerbungMode) return { abs: base, hh: baseHH };
    let abs = 0, hh = 0;
    if (useWerbe) { abs += werb; hh += werbHH; }
    if (useZusatz) { abs += zusatz; hh += zusatzHH; }
    return { abs, hh };
  };

  // Kategorien
  const st = pickPair(values.umsatz, values.umsatzWerbung, values.umsatzZusatz,
                      values.umsatzProHaushalt, values.umsatzWerbungProHaushalt, values.umsatzZusatzProHaushalt);

  const pc = pickPair(values.pluscard, values.pluscardWerbung, values.pluscardZusatz,
                      values.pluscardProHaushalt, values.pluscardWerbungProHaushalt, values.pluscardZusatzProHaushalt);

  const ra = pickPair(values.ra, values.raWerbung, values.raZusatz,
                      values.raProHaushalt, values.raWerbungProHaushalt, values.raZusatzProHaushalt);

  const os = pickPair(values.onlineshop, values.onlineshopWerbung, values.onlineshopZusatz,
                      values.onlineshopProHaushalt, values.onlineshopWerbungProHaushalt, values.onlineshopZusatzProHaushalt);

  const active = {
    stationaer: this.activeCategories.has("stationaer"),
    pluscard:   this.activeCategories.has("pluscard"),
    ra:         this.activeCategories.has("ra"),
    online:     this.activeCategories.has("online")
  };

  // Summen für Anzeige
  const totalAbs =
    (active.stationaer ? st.abs : 0) +
    (active.pluscard   ? pc.abs : 0) +
    (active.ra         ? ra.abs : 0) +
    (active.online     ? os.abs : 0);

  const totalHH =
    (active.stationaer ? st.hh : 0) +
    (active.pluscard   ? pc.hh : 0) +
    (active.ra         ? ra.hh : 0) +
    (active.online     ? os.hh : 0);

  const hh = values.haushalte || 0;

  // Werbeanteil IMMER gegen Gesamtumsatz
  const totalNormalAbs =
    values.umsatz +
    values.pluscard +
    values.ra +
    values.onlineshop;

  const totalWerbeAbs =
    values.umsatzWerbung +
    values.pluscardWerbung +
    values.raWerbung +
    values.onlineshopWerbung;

  const totalZusatzAbs =
    values.umsatzZusatz +
    values.pluscardZusatz +
    values.raZusatz +
    values.onlineshopZusatz;

  const anteilWerbeUmsatz =
    totalNormalAbs > 0 ? ((totalWerbeAbs / totalNormalAbs) * 100).toFixed(1) : "–";

  // Formatierer
  const fmtAbs = x => Number(x || 0).toLocaleString("de-DE");
  const fmtHH  = x => Number(x || 0).toFixed(2);
  const pct = (x, total) => total > 0 ? (x / total) * 100 : 0;

  // Header-Label
  const headerLabel = (() => {
    if (!isWerbungMode) return "Gesamtumsatz";
    if (useWerbe && useZusatz) return "Werbeumsatz + Mitgekauft";
    if (useWerbe) return "Werbeumsatz";
    return "Mitgekauft";
  })();

  // HTML
  popup.innerHTML = `
    <div class="popup-header">
      <span>${note}</span>
      <button class="close-btn">×</button>
    </div>

    <div class="umsatz-subheader">
      <span class="strong">${headerLabel}: ${fmtAbs(totalAbs)} €</span><br>
      <span class="strong">pro Haushalt: ${fmtHH(totalHH)} €</span><br>
      <span style="color:#000;">Anteil Werbeumsatz: ${anteilWerbeUmsatz} %</span>
    </div>

    <!-- NEUER WERBEANTEIL-BALKEN -->
    <div class="umsatz-bar" style="margin-top:4px;">
      <div style="background:#b41821;width:${pct(totalNormalAbs,totalNormalAbs+totalWerbeAbs+totalZusatzAbs)}%"></div>
      <div style="background:#1f78b4;width:${pct(totalWerbeAbs,totalNormalAbs+totalWerbeAbs+totalZusatzAbs)}%"></div>
      <div style="background:#ffb000;width:${pct(totalZusatzAbs,totalNormalAbs+totalWerbeAbs+totalZusatzAbs)}%"></div>
    </div>

    <div class="umsatz-legend">
      <span><span style="color:#b41821;">⬤</span> Normal</span>
      <span><span style="color:#1f78b4;">⬤</span> Werbung</span>
      <span><span style="color:#ffb000;">⬤</span> Mitgekauft</span>
    </div>

    <div class="section-title">Haushalte</div>
    <div class="umsatz-grid">

      <div class="label">Haushalte</div>
      <div class="value">${hh.toLocaleString("de-DE")}</div>
      <div class="value"></div>
    </div>

    <div class="section-title">Umsatz nach Kategorien</div>

    <div class="umsatz-grid">

       <div class="label"><strong>Kategorie</strong></div>
      <div class="value"><strong>Absolut</strong></div>
      <div class="value"><strong>pro HH</strong></div>

      <div class="label ${!active.stationaer ? "disabled-cell" : ""}">Stationär</div>
      <div class="value ${!active.stationaer ? "disabled-cell" : ""}">${fmtAbs(st.abs)} €</div>
      <div class="value ${!active.stationaer ? "disabled-cell" : ""}">${fmtHH(st.hh)} €</div>

      <div class="label ${!active.pluscard ? "disabled-cell" : ""}">Pluscard</div>
      <div class="value ${!active.pluscard ? "disabled-cell" : ""}">${fmtAbs(pc.abs)} €</div>
      <div class="value ${!active.pluscard ? "disabled-cell" : ""}">${fmtHH(pc.hh)} €</div>

      <div class="label ${!active.ra ? "disabled-cell" : ""}">R&A</div>
      <div class="value ${!active.ra ? "disabled-cell" : ""}">${fmtAbs(ra.abs)} €</div>
      <div class="value ${!active.ra ? "disabled-cell" : ""}">${fmtHH(ra.hh)} €</div>

      <div class="label ${!active.online ? "disabled-cell" : ""}">KUBE OS</div>
      <div class="value ${!active.online ? "disabled-cell" : ""}">${fmtAbs(os.abs)} €</div>
      <div class="value ${!active.online ? "disabled-cell" : ""}">${fmtHH(os.hh)} €</div>
    </div>

    <div class="section-title">Umsatzanteile</div>

    <!-- NEU: Kategorien-Balken wird NICHT gefiltert -->
    <div class="umsatz-bar">
      <div class="share-stationaer" style="width:${pct(values.umsatz,totalNormalAbs)}%"></div>
      <div class="share-pluscard"   style="width:${pct(values.pluscard,totalNormalAbs)}%"></div>
      <div class="share-ra"         style="width:${pct(values.ra,totalNormalAbs)}%"></div>
      <div class="share-online"     style="width:${pct(values.onlineshop,totalNormalAbs)}%"></div>
    </div>

    <div class="umsatz-legend">
      <span><span style="color:#b41821;">⬤</span> Stationär</span>
      <span><span style="color:#1f78b4;">⬤</span> Pluscard</span>
      <span><span style="color:#33a02c;">⬤</span> R&A</span>
      <span><span style="color:#ffb000;">⬤</span> KUBE OS</span>
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
    if (!isWerbungMode) {
      return safe(useHH ? baseHH : base);
    }

    let sum = 0;

    if (useWerbe) {
      sum += safe(useHH ? werbHH : werb);
    }
    if (useZusatz) {
      sum += safe(useHH ? zusatzHH : zusatz);
    }

    return sum;
  };

  let sum = 0;

  if (this.activeCategories.has("stationaer")) {
    sum += pick(
      v.umsatz, v.umsatzWerbung, v.umsatzZusatz,
      v.umsatzProHaushalt, v.umsatzWerbungProHaushalt, v.umsatzZusatzProHaushalt
    );
  }

  if (this.activeCategories.has("pluscard")) {
    sum += pick(
      v.pluscard, v.pluscardWerbung, v.pluscardZusatz,
      v.pluscardProHaushalt, v.pluscardWerbungProHaushalt, v.pluscardZusatzProHaushalt
    );
  }

  if (this.activeCategories.has("ra")) {
    sum += pick(
      v.ra, v.raWerbung, v.raZusatz,
      v.raProHaushalt, v.raWerbungProHaushalt, v.raZusatzProHaushalt
    );
  }

  if (this.activeCategories.has("online")) {
    sum += pick(
      v.onlineshop, v.onlineshopWerbung, v.onlineshopZusatz,
      v.onlineshopProHaushalt, v.onlineshopWerbungProHaushalt, v.onlineshopZusatzProHaushalt
    );
  }

  return sum;
}



  updateNeighbours(filteredData) {
    const filteredMarkers = filteredData.map(entry => createMarker(entry));
    this.neighbours = computeNeighbours(filteredMarkers);
  }


applyFilter(erhID, jahr, nummer) {

  if (!erhID || !jahr || !nummer) {
    console.warn("⛔ applyFilter abgebrochen: Filter unvollständig");
    return;
  }

  // 🧹 NL-Tabelle schließen
  const filterContainer = this._shadowRoot.querySelector(".filter-container");
  if (filterContainer?.classList.contains("nl-info-active")) {
    this.closeNLTable();
  }

  this._activeFilter = { erhID, jahr, nummer };

  // 🔄 NL-Auswahl zurücksetzen
  if (!this._selectedNLs) {
    this._selectedNLs = new Set();
  } else {
    this._selectedNLs.clear();
  }

  // 1️⃣ Daten filtern
  const filteredData = this.getFilteredData();
  this.filteredData = filteredData;

  // 2️⃣ Umsatzwerte vorbereiten
  this.prepareUmsatzPLZWerte();
  this.computeWKKennwerte();
  this.computeStreuverlust();


  // 3️⃣ MapMode korrekt setzen
  const btnUmsatz = this._shadowRoot.getElementById("btn-umsatz");

  if (btnUmsatz?.classList.contains("active")) {
    this.currentMapMode = "umsatz-multi";

    if (!this.activeCategories || this.activeCategories.size === 0) {
      this.activeCategories = new Set(["stationaer", "pluscard", "ra", "online"]);
    }

    this._shadowRoot.getElementById("wk-extra").style.display = "none";
    this._shadowRoot.getElementById("umsatz-options-row").style.display = "flex";


  } else {
    this.currentMapMode = "wk";

    this._shadowRoot.getElementById("wk-extra").style.display = "block";
    this._shadowRoot.getElementById("umsatz-options-row").style.display = "none";

  }

  // 4️⃣ HZ-Flags neu berechnen
  this.hzFlags = {};
  filteredData.forEach(row => {
    const plz = row["dimension_plz_0"]?.id?.trim();
    const hz = row["dimension_hzflag_0"]?.id?.trim();
    if (plz) this.hzFlags[plz] = hz === "X";
  });

  // 5️⃣ PLZ-Liste extrahieren
  this.filteredPLZs = filteredData
    .map(row => row["dimension_plz_0"]?.id?.trim())
    .filter(plz => plz && plz !== "@NullMember");

  // 6️⃣ Karte initial einfärben
  this.updateGeoLayer();

  // 7️⃣ NL-Marker aktualisieren
  this.updateMarkers();

  // 8️⃣ Radius anwenden
  const radius = Number(this._shadowRoot.getElementById("radius-slider").value);
  this.currentRadius = radius;
  this.applyRadiusFilter(radius);

  // 9️⃣ Tabelle rendern
  this.renderDataTable(this.filteredKennwerte);

  // 🔟 Zoom
  this.zoomToFilteredPLZ();

  // 1️⃣1️⃣ Erhebungsinfo aktualisieren
  this.prepareErhebungsInfo();
}






extractPLZWerte(data) {
  const plzWerte = {};

  data.forEach(row => {
    const plz = row["dimension_plz_0"]?.id?.trim();
    if (!plz || plz === "@NullMember") return;

    const wk = row["value_wk_in_percent_0"]?.raw;
    const wkPot = row["value_wk_potentiell_0"]?.raw;
    const hz = row["dimension_hzflag_0"]?.id?.trim() === "X";

    plzWerte[plz] = {
      wk: typeof wk === "number" ? wk : 0,
      wkPot: typeof wkPot === "number" ? wkPot : 0,
      hz
    };

    console.log(
      `📊 extractPLZWerte → PLZ ${plz}: WK=${plzWerte[plz].wk}, WKPot=${plzWerte[plz].wkPot}, HZ=${hz}`
    );
  });

  return plzWerte;
}

getFilteredData() {
  if (!this._myDataSource || this._myDataSource.state !== "success") {
    console.warn("⛔ getFilteredData: Keine gültige Datenquelle.");
    return [];
  }

  const data = this._myDataSource.data;
  const { erhID, jahr, nummer } = this._activeFilter || {};

  console.group("🔍 Filtervorgang gestartet");
  console.log("➡️ ErhebungsID:", erhID);
  console.log("➡️ Jahr:", jahr);
  console.log("➡️ Nummer:", nummer);

  const filteredKennwerte = {};

  const filtered = data.filter(row => {
    const id = row["dimension_erhebung_0"]?.id?.trim();
    const y = row["dimension_jahr_0"]?.id?.trim();
    const num = row["dimension_erhebungsnummer_0"]?.id?.trim();
    const rawPLZ = row["dimension_plz_0"]?.id ?? row["dimension_plz_0"]?.raw;
    const plz = String(rawPLZ).padStart(5, "0");
    
    const match = id === erhID && y === jahr && num === nummer;

    if (match && plz && plz !== "@NullMember") {
      filteredKennwerte[plz] = row;
    }

    return match;
  });

  this.filteredKennwerte = filteredKennwerte;

  console.log("📦 Gefilterte PLZs:", Object.keys(filteredKennwerte));
  console.groupEnd();

  return filtered;
}





  getColor(value, isHZ) {
    const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;

  if (isHZ) {
    return safeValue > 25 ? "#e31a1c" :   // Rot
           safeValue > 15 ? "#fd8d3c" :   // Orange
           safeValue > 10 ? "#ffffb2" :   // Gelb
           safeValue > 5  ? "#78c679" :   // Hellgrün
           safeValue > 2  ? "#41ab5d" :   // Mittelgrün
           safeValue > 0  ? "#006837" :   // Dunkelgrün
                            "#cfd4da";    // Grau
  } else {
    return safeValue > 50 ? "#cfd4da" :   // Grau
           safeValue > 25 ? "#bdbdbd" :   // Dunkles Grau
           safeValue > 15 ? "#969696" :   // Noch dunkleres Grau
           safeValue > 10 ? "#6baed6" :   // Hellblau
           safeValue > 5  ? "#2171b5" :   // Dunkles Blau
           safeValue > 0  ? "#08306b" :   // Sehr dunkles Blau
                            "#cfd4da";    // Grau
  }
  }


updateGeoLayer() {
  if (!this._geoLayer) return;

  console.group("🧪 updateGeoLayer()");
  console.log("➡️ Modus:", this.currentMapMode, "| Haushaltmodus:", this.umsatzDarstellung);

  // 1️⃣ Max-Wert global berechnen (für Umsatz-Heatmap)
  this.computeMaxValue();

  // 2️⃣ Alle Layer aktualisieren
this._geoLayer.eachLayer(layer => {
  const path = layer._path;
  if (path) {
    path.classList.add("heatmap-reveal");
  }
  this.applyStyleToLayer(layer);
});


  // 3️⃣ Bestreuungsmarker aktualisieren
  this.updateBestreuungMarkers();

  console.groupEnd();

  // ⭐ 4️⃣ Legende aktualisieren (WICHTIG!)
  this.updateHeatmapLegend();
}

computeFillColor(plz) {
  const v = this.filteredPLZWerte?.[plz];
  if (!v) return "#cfd4da";

  // WK-Modus
  if (this.currentMapMode === "wk") {
    const value = v.hz ? v.wk : v.wkPot;
    return this.getColor(value, v.hz);
  }

  // Umsatzmodus
  if (this.currentMapMode === "umsatz-multi") {
    const sum = this.getUmsatzSumForPLZ(v);
    return this.getDynamicHeatColor(sum, this._maxValueCache || 1);
  }

  // Werbeanteil-Modus
  if (this.currentMapMode === "werbeanteil") {
    const ratio = v.werbeAnteil ?? 0;
    return this.getWerbeAnteilColor(ratio);
  }

  return "#cfd4da";
}


computeMaxValue() {
  const plzWerte = this.filteredPLZWerte || {};
  const safe = x => Number.isFinite(x) ? x : 0;

  let maxValue = 0;

  // WK
  if (this.currentMapMode === "wk") {
    Object.values(plzWerte).forEach(v => {
      const val = safe(v.hz ? v.wk : v.wkPot);
      if (val > maxValue) maxValue = val;
    });
  }

  // Umsatz
  if (this.currentMapMode === "umsatz-multi") {
    Object.values(plzWerte).forEach(v => {
      const sum = this.getUmsatzSumForPLZ(v);
      if (sum > maxValue) maxValue = sum;
    });
  }

  // ⭐ Werbeanteil (immer 0–1)
  if (this.currentMapMode === "werbeanteil") {
    this._maxValueCache = 1;
    return 1;
  }

  this._maxValueCache = maxValue || 1;
  return this._maxValueCache;
}
applyStyleToLayer(layer) {
  const plz = String(layer.feature?.properties?.plz ?? "").padStart(5, "0");
  const v = this.filteredPLZWerte?.[plz];

  // -------------------------------------------------
  // 0) Layer IMMER klickbar machen (Leaflet-Schutz)
  // -------------------------------------------------
  layer.options.interactive = true;

  if (layer._path) {
    layer._path.setAttribute("pointer-events", "auto");
  }

  // -------------------------------------------------
  // 1) Radiuslogik
  // -------------------------------------------------
  const hasRadius = this.plzImRadius instanceof Set && this.plzImRadius.size > 0;
  let inRadius = true;

  if (this.currentMapMode === "umsatz-multi" || this.currentMapMode === "werbeanteil") {
    inRadius = !this.useRadiusFilter || !hasRadius || this.plzImRadius.has(plz);
  } else {
    inRadius = !hasRadius || this.plzImRadius.has(plz);
  }

  // -------------------------------------------------
  // 2) PLZ ohne Werte oder außerhalb Radius → grau
  //    (ABER klickbar, Popup soll leer öffnen)
  // -------------------------------------------------
  if (!v || !inRadius) {
    layer.setStyle({
      fillColor: "#cfd4da",
      fillOpacity: 0.45,
      color: "#ffffff",
      weight: 1
    });

    // Layer bleibt klickbar!
    layer.options.interactive = true;
    if (layer._path) {
      layer._path.setAttribute("pointer-events", "auto");
    }

    // Click-Handler trotzdem setzen
    layer.off("click");
    layer.on("click", () => {
      const popupWK = this._shadowRoot.getElementById("side-popup");
      const popupU = this._shadowRoot.getElementById("side-popup-umsatz");

      popupWK?.classList.remove("show");
      popupWK?.classList.add("hidden");

      popupU?.classList.remove("show");
      popupU?.classList.add("hidden");

      if (this.currentMapMode === "umsatz-multi" || this.currentMapMode === "werbeanteil") {
        this.activePopupType = "umsatz";
        this.showEmptyUmsatzPopup(plz);
        return;
      }

      this.activePopupType = "wk";
      this.showPopup(layer.feature, {}); // leeres WK-Popup
    });

    // Critical Marker entfernen
    if (this.criticalMarkers?.[plz]) {
      this.map.removeLayer(this.criticalMarkers[plz]);
      delete this.criticalMarkers[plz];
    }

    return;
  }

  // -------------------------------------------------
  // 3) Farbe berechnen
  // -------------------------------------------------
  const fillColor = this.computeFillColor(plz);

  layer.setStyle({
    fillColor,
    fillOpacity: 0.7,
    color: "#ffffff",
    weight: 1
  });

  // Sicherheit: Layer klickbar halten
  layer.options.interactive = true;
  if (layer._path) {
    layer._path.setAttribute("pointer-events", "auto");
  }

  // -------------------------------------------------
  // 4) Click-Handler neu setzen
  // -------------------------------------------------
  layer.off("click");

  layer.on("click", () => {
    const values = this.filteredPLZWerte?.[plz];

    const popupWK = this._shadowRoot.getElementById("side-popup");
    const popupU = this._shadowRoot.getElementById("side-popup-umsatz");

    popupWK?.classList.remove("show");
    popupWK?.classList.add("hidden");

    popupU?.classList.remove("show");
    popupU?.classList.add("hidden");

    if (this.currentMapMode === "umsatz-multi" || this.currentMapMode === "werbeanteil") {
      this.activePopupType = "umsatz";

      if (values) {
        this.showUmsatzPopup(plz, values);
      } else {
        this.showEmptyUmsatzPopup(plz);
      }
      return;
    }

    this.activePopupType = "wk";
    const kennwerte = this.filteredKennwerte?.[plz] || {};
    this.showPopup(layer.feature, kennwerte);
  });

  // -------------------------------------------------
  // 5) Critical-Marker (nur WK-Modus)
  // -------------------------------------------------
  const showCritical = this.currentMapMode === "wk" && this.showCritical;
  const isCritical = this.filteredKennwerte?.[plz]?.isCritical;

  if (!showCritical || !isCritical) {
    if (this.criticalMarkers?.[plz]) {
      this.map.removeLayer(this.criticalMarkers[plz]);
      delete this.criticalMarkers[plz];
    }
    return;
  }

  if (!this.criticalMarkers) this.criticalMarkers = {};

  if (!this.criticalMarkers[plz]) {
    const center = layer.getBounds().getCenter();

    const icon = L.divIcon({
      html: `<div style="
        background:#ffffff;
        border:2px solid #b41821;
        border-radius:50%;
        width:22px;
        height:22px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:14px;
        font-weight:bold;
      ">⚠️</div>`,
      className: "",
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    this.criticalMarkers[plz] = L.marker(center, {
      icon,
      interactive: false
    }).addTo(this.map);
  }
}




getDynamicHeatColor(value, max) {
  value = Number(value);
  max = Number(max);

  // ❗ Kein Wert → Standardgrau
  if (!Number.isFinite(value) || value <= 0 || !Number.isFinite(max) || max <= 0) {
    return "#cfd4da";
  }

  const ratio = value / max;

  if (ratio > 0.95) return "#7a0f17";  // sehr dunkelrot
  if (ratio > 0.85) return "#9d131b";  // dunkles rot
  if (ratio > 0.75) return "#b41821";  // signature red
  if (ratio > 0.65) return "#d9483b";  // rot-orange
  if (ratio > 0.55) return "#e96a3a";  // orange
  if (ratio > 0.45) return "#f08a3c";  // hellorange
  if (ratio > 0.35) return "#f6b65b";  // gelb-orange
  if (ratio > 0.20) return "#f7d77a";  // ⭐ kräftiges Gelb (statt #ffe89c)
  return "#fce9b2";                    // ⭐ helles Gelb (statt #fff6d6)
}


getWerbeAnteilColor(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) return "#cfd4da";

  if (ratio > 0.80) return "#7a0f17";
  if (ratio > 0.60) return "#b41821";
  if (ratio > 0.40) return "#e96a3a";
  if (ratio > 0.20) return "#f6b65b";
  if (ratio > 0.10) return "#f7d77a";  // ⭐ kräftiges Gelb
  return "#fce9b2";                    // ⭐ helles Gelb
}



updateMarkers() {
  if (!this.filteredGroup || !this.allMarkers) return;

  this.filteredGroup.clearLayers();

  const filteredData = this.filteredData || [];
  if (!filteredData.length) return;

  const erhNLs = new Set(
    filteredData
      .map(row => row["dimension_niederlassung_0"]?.id?.trim())
      .filter(Boolean)
  );

  const hasNLFilter = this._selectedNLs?.size > 0;

  const activeMarkers = [];

  this.allMarkers.forEach(marker => {
    const nl = marker.options.plzs?.[0];
    if (!nl || !erhNLs.has(nl)) return;

    this.filteredGroup.addLayer(marker);

    const isSelected = !hasNLFilter || this._selectedNLs.has(nl);

    marker.setIcon(this.createMarkerIcon(nl, !isSelected));

    marker.off("mouseover");
    marker.off("mouseout");

    marker.on("mouseover", () => {
      const el = marker.getElement();
      if (el) {
        el.style.filter = "brightness(1.35)";
        el.style.boxShadow = "0 0 10px rgba(0,0,0,0.7)";
      }
    });

    marker.on("mouseout", () => {
      const el = marker.getElement();
      if (el) {
        el.style.filter = "brightness(1)";
        el.style.boxShadow = "-1px 1px 4px rgba(0,0,0,.5)";
      }
    });

    if (isSelected) {
      marker.setZIndexOffset(1000);
      activeMarkers.push(marker);
    } else {
      marker.setZIndexOffset(100);
    }
  });

  this.nlMarkers = activeMarkers.map(marker => ({
    lat: marker.getLatLng().lat,
    lng: marker.getLatLng().lng,
    marker
  }));
}



onMarkerClick(nl) {
  if (this._selectedNLs.has(nl)) {
    this._selectedNLs.delete(nl);
  } else {
    this._selectedNLs.add(nl);
  }

  this.updateNLSelectionUI();

  this.applyNLFilter([...this._selectedNLs]);

  const radius = Number(this._shadowRoot.getElementById("radius-slider").value);
  this.applyRadiusFilter(radius);

  this.updateGeoLayer();
  this.renderDataTable(this.filteredKennwerte);
}




setupFilterDropdowns() {
  const erhSelect = this._shadowRoot.getElementById("erhebung-select");
  const jahrSelect = this._shadowRoot.getElementById("jahr-select");
  const nummerSelect = this._shadowRoot.getElementById("nummer-select");

  if (!erhSelect || !jahrSelect || !nummerSelect) {
    console.warn("❌ Dropdown-Elemente nicht gefunden im Shadow DOM");
    return;
  }

  // 🧹 Reset
  erhSelect.innerHTML = "";
  jahrSelect.innerHTML = "";
  nummerSelect.innerHTML = "";
  jahrSelect.disabled = true;
  nummerSelect.disabled = true;

  // 🏷️ Platzhalter
  const createPlaceholder = (text) => {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = text;
    opt.disabled = true;
    opt.selected = true;
    return opt;
  };

  erhSelect.appendChild(createPlaceholder("Bitte auswählen"));
  Object.keys(this._erhData).forEach(erhID => {
    if (erhID !== "@NullMember") {
      const opt = document.createElement("option");
      opt.value = erhID;
      opt.textContent = erhID;
      erhSelect.appendChild(opt);
    }
  });

  erhSelect.addEventListener("change", () => {
    jahrSelect.innerHTML = "";
    nummerSelect.innerHTML = "";
    jahrSelect.disabled = false;
    nummerSelect.disabled = true;

    jahrSelect.appendChild(createPlaceholder("Bitte auswählen"));
    const selectedID = erhSelect.value;
    const jahre = Object.keys(this._erhData[selectedID] || {}).filter(j => j !== "@NullMember");

    jahre.forEach(j => {
      const opt = document.createElement("option");
      opt.value = j;
      opt.textContent = j;
      jahrSelect.appendChild(opt);
    });
  });

  jahrSelect.addEventListener("change", () => {
    nummerSelect.innerHTML = "";
    nummerSelect.disabled = false;

    nummerSelect.appendChild(createPlaceholder("Bitte auswählen"));
    const selectedID = erhSelect.value;
    const selectedJahr = jahrSelect.value;
    const nummern = Array.from(this._erhData[selectedID]?.[selectedJahr] || []).filter(n => n !== "@NullMember");

    nummern.forEach(n => {
      const opt = document.createElement("option");
      opt.value = n;
      opt.textContent = n;
      nummerSelect.appendChild(opt);
    });
  });

  const filterButton = this._shadowRoot.getElementById("filter-button");
  if (filterButton) {
    filterButton.addEventListener("click", () => {
      const selectedID = erhSelect.value;
      const selectedJahr = jahrSelect.value;
      const selectedNummer = nummerSelect.value;

      if (selectedID && selectedJahr && selectedNummer) {
        this.loadErhebung(selectedID, selectedJahr, selectedNummer);

      } else {
        console.warn("⚠️ Bitte alle Filterfelder korrekt auswählen.");
      }
    });
  }

  // ---------------------------------------------------------
  // 🔥 NL-INFO CONTAINER (nur einmal erzeugen)
  // ---------------------------------------------------------
  let nlInfo = this._shadowRoot.getElementById("nl-info-container");
  if (!nlInfo) {
    nlInfo = document.createElement("div");
    nlInfo.classList.add("nl-info-container");
    nlInfo.id = "nl-info-container";
    this._shadowRoot.querySelector(".filter-container").appendChild(nlInfo);
  }

  // ---------------------------------------------------------
  // 🔥 BUTTON: Erhebungsübersicht (TOGGLE)
  // ---------------------------------------------------------
  const infoBtn = document.createElement("button");
  infoBtn.textContent = "Erhebungsübersicht";
  infoBtn.style.marginTop = "10px";
  infoBtn.style.padding = "6px";
  infoBtn.style.background = "#b41821";
  infoBtn.style.color = "white";
  infoBtn.style.border = "none";
  infoBtn.style.cursor = "pointer";
  infoBtn.style.borderRadius = "4px";

infoBtn.addEventListener("click", () => {
  const nlBox = this._shadowRoot.getElementById("nl-info-container");
  const filter = this._shadowRoot.querySelector(".filter-container");

  if (!nlBox) return;

  if (nlBox.classList.contains("show")) {
    nlBox.classList.remove("show");
    filter.classList.remove("nl-info-active");
    return;
  }

  this.prepareErhebungsInfo();
  this.renderErhebungsInfoTable();

  nlBox.classList.add("show");
  filter.classList.add("nl-info-active");
});



  this._shadowRoot.querySelector(".filter-container").appendChild(infoBtn);
}


restoreFilterUI() {
  const container = this._shadowRoot.querySelector(".filter-container");
  if (!container) return;

  container.innerHTML = `
    <label for="erhebung-select">ErhebungsID:</label>
    <select id="erhebung-select"></select>

    <label for="jahr-select">Jahr:</label>
    <select id="jahr-select" disabled></select>

    <label for="nummer-select">Erhebungsnummer:</label>
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

  const scroll = document.createElement("div");
  scroll.classList.add("nl-info-scroll");

  const table = document.createElement("table");
  table.classList.add("nl-info-table");

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const headers = [
    { label: 'NL', width: '15px', class: 'nl-col-nl' },
    { label: 'Umsatz (Hochrechnung)', width: '70px', class: 'nl-col-jahr' },
    { label: 'Erfasst (Zeitraum)', width: '55px', class: 'nl-col-erf' },
    { label: '%', width: '25px', class: 'nl-col-pct1' },
    { label: 'Davon Valide', width: '55px', class: 'nl-col-val' },
    { label: 'Abdeckung', width: '55px', class: 'nl-col-abd' }
  ];

  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h.label;
    th.classList.add(h.class);
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  Object.values(this.erhebungsInfo).forEach(info => {
    const tr = document.createElement("tr");
    tr.classList.add("nl-info-row");
    tr.dataset.nl = info.nl;

const values = [
  info.nl,
  Math.round(info.jahresumsatz).toLocaleString("de-DE"),
  Math.round(info.erfasst_total).toLocaleString("de-DE"),
  (info.pct_erfassung * 100).toFixed(1) + "%",
  Math.round(info.erfasst_valid).toLocaleString("de-DE"),
  (info.pct_hochrechnung * 100).toFixed(1) + "%"
];


    values.forEach((val, i) => {
      const td = document.createElement("td");
      td.textContent = val;
      td.classList.add(headers[i].class);
      tr.appendChild(td);
    });

    tr.addEventListener("click", () => this.toggleNLSelection(info.nl));

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  scroll.appendChild(table);
  container.appendChild(scroll);

  this.updateNLSelectionUI();
}



updateNLSelectionUI() {
  const rows = this._shadowRoot.querySelectorAll(".nl-info-row");

  rows.forEach(row => {
    const nl = row.dataset.nl;

    if (this._selectedNLs.has(nl)) {
      row.classList.add("table-row-selected");
    } else {
      row.classList.remove("table-row-selected");
    }
  });
}




restoreDropdownSelections() {
  const { erhID, jahr, nummer } = this._activeFilter || {};

  const erhSelect = this._shadowRoot.getElementById("erhebung-select");
  const jahrSelect = this._shadowRoot.getElementById("jahr-select");
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

  const jahresumsatz = {};
  const erfasst_total = {};
  const erfasst_valid = {};

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

    if (plz !== "00000") {
      jahresumsatz[nl] += umsatzJahr;
      erfasst_valid[nl] += umsatzErhebung;
    }
  });

  Object.keys(erfasst_total).forEach(nl => {
    const jahrU = jahresumsatz[nl] || 0;
    const total = erfasst_total[nl] || 0;
    const valid = erfasst_valid[nl] || 0;

    this.erhebungsInfo[nl] = {
      nl,
      jahresumsatz: jahrU,
      erfasst_total: total,
      erfasst_valid: valid,
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

  // ============================================
  // SAFE() – robustes Parsing inkl. Tausenderpunkt
  // ============================================
  const safe = x => {
    if (x == null) return 0;

    let original = x;

    if (typeof x === "string") {
      x = x.replace(/\./g, "").replace(",", ".");
    }

    const n = Number(x);

    if (!Number.isFinite(n)) {
      console.warn("❗ SAFE-PARSE-ERROR", { original, parsed: n });
    }

    return Number.isFinite(n) ? n : 0;
  };

  // ============================================
  // Haushalte-PARSER (immer ganze Zahl!)
  // ============================================
  const parseHH = x => {
    if (x == null) return 0;

    if (typeof x === "number") {
      return Number.isFinite(x) ? x : 0;
    }

    if (typeof x === "string") {
      // Tausendertrennzeichen entfernen (egal ob . oder ,)
      const s = x.replace(/[.,\s]/g, "");
      const n = Number(s);
      if (!Number.isFinite(n)) {
        console.warn("❗ HH-PARSE-ERROR", { original: x, parsed: n });
        return 0;
      }
      return n;
    }

    return 0;
  };

  // Debug-Safe für Umsatzfelder
  const debugSafe = (label, value, plz) => {
    const parsed = safe(value);
    if (!Number.isFinite(parsed)) {
      console.warn(`❗ SAFE-PARSE-ERROR @ ${label} | PLZ ${plz}`, {
        original: value,
        parsed
      });
    }
    return parsed;
  };

  // ============================================
  // (Optional) Cache-Struktur initialisieren – aber NICHT mehr als Short-Cut nutzen
  // ============================================
  if (!this._umsatzCache) this._umsatzCache = {};
  const nlKey = [...(this._selectedNLs || new Set())].sort().join("_") || "ALL";
  const cacheKey = `${erhID}_${jahr}_${nummer}_${nlKey}`;

  // ============================================
  // 1) Aggregation – IMMER NEU BERECHNEN
  // ============================================
  const rows = raw.filter(row =>
    row["dimension_erhebung_0"]?.id == erhID &&
    row["dimension_jahr_0"]?.id == jahr &&
    row["dimension_erhebungsnummer_0"]?.id == nummer
  );

  const aggregated = {};

  rows.forEach(row => {
    const nl = row["dimension_niederlassung_0"]?.id?.trim();

    if (this._selectedNLs?.size > 0 && !this._selectedNLs.has(nl)) {
      return;
    }

    const rawPLZ = row["dimension_plz_0"]?.id ?? row["dimension_plz_0"]?.raw;

    if (!rawPLZ || rawPLZ === "@NullMember") return;

    const plz = String(rawPLZ).padStart(5, "0");
    if (plz === "00000") return;

    if (!aggregated[plz]) {
      aggregated[plz] = {
        _hhValues: [],

        umsatz: 0,
        ra: 0,
        onlineshop: 0,
        pluscard: 0,

        umsatzWerbung: 0,
        raWerbung: 0,
        onlineshopWerbung: 0,
        pluscardWerbung: 0,

        umsatzZusatz: 0,
        raZusatz: 0,
        onlineshopZusatz: 0,
        pluscardZusatz: 0
      };
    }

    const v = aggregated[plz];

    // Haushalte
    const rawHH = row["value_haushalte_0"]?.raw;
    const hh = parseHH(rawHH);


    if (hh > 0) v._hhValues.push(hh);

    // Umsatzfelder
    v.umsatz     += debugSafe("umsatz_stationaer", row["value_umsatz_stationaer_0"]?.raw, plz);
    v.ra         += debugSafe("umsatz_ra", row["value_umsatz_ra_0"]?.raw, plz);
    v.onlineshop += debugSafe("umsatz_online", row["value_umsatz_online_0"]?.raw, plz);
    v.pluscard   += debugSafe("umsatz_pluscard", row["value_umsatz_grosskunden_0"]?.raw, plz);

    v.umsatzWerbung     += debugSafe("werbung_stationaer", row["value_umsatz_stationaer_werbung_0"]?.raw, plz);
    v.raWerbung         += debugSafe("werbung_ra", row["value_umsatz_ra_werbung_0"]?.raw, plz);
    v.onlineshopWerbung += debugSafe("werbung_online", row["value_umsatz_online_werbung_0"]?.raw, plz);
    v.pluscardWerbung   += debugSafe("werbung_pluscard", row["value_umsatz_grosskunden_werbung_0"]?.raw, plz);

    v.umsatzZusatz     += debugSafe("zusatz_stationaer", row["value_umsatz_stationaer_zusatz_0"]?.raw, plz);
    v.raZusatz         += debugSafe("zusatz_ra", row["value_umsatz_ra_zusatz_0"]?.raw, plz);
    v.onlineshopZusatz += debugSafe("zusatz_online", row["value_umsatz_online_zusatz_0"]?.raw, plz);
    v.pluscardZusatz   += debugSafe("zusatz_pluscard", row["value_umsatz_grosskunden_zusatz_0"]?.raw, plz);
  });

  // ============================================
  // 2) Haushalte + pro HH + Werbeanteil
  // ============================================
  Object.entries(aggregated).forEach(([plz, v]) => {
    if (v._hhValues.length > 0) {
      v.haushalte =
        v._hhValues.reduce((a, b) => a + b, 0) / v._hhValues.length;
    } else {
      v.haushalte = 0;
    }



    delete v._hhValues;

    const hh = v.haushalte;
    const perHH = val => (hh > 0 ? val / hh : 0);

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

    const catMapNormal = {
      stationaer: v.umsatz ?? 0,
      ra: v.ra ?? 0,
      onlineshop: v.onlineshop ?? 0,
      pluscard: v.pluscard ?? 0
    };

    const catMapWerbung = {
      stationaer: v.umsatzWerbung ?? 0,
      ra: v.raWerbung ?? 0,
      onlineshop: v.onlineshopWerbung ?? 0,
      pluscard: v.pluscardWerbung ?? 0
    };

    let totalNormal = 0;
    let totalWerbe = 0;

    for (const cat of this.activeCategories) {
      totalNormal += catMapNormal[cat] ?? 0;
      totalWerbe  += catMapWerbung[cat] ?? 0;
    }

    v.werbeAnteil = totalNormal > 0 ? (totalWerbe / totalNormal) : 0;
  });

  // optional: aktualisierten Aggregat-Cache speichern
  this._umsatzCache[cacheKey] = aggregated;

  // ============================================
  // 3) Radiusfilter
  // ============================================
  const full = aggregated;
  const result = {};

  Object.entries(full).forEach(([plz, v]) => {
    if ((this.currentMapMode === "umsatz-multi" || this.currentMapMode === "werbeanteil") && this.useRadiusFilter) {
      if (this.plzImRadius instanceof Set && !this.plzImRadius.has(plz)) return;
    }
    result[plz] = v;
  });

  this.filteredPLZWerte = result;

  console.log(
    "%c🧪 prepareUmsatzPLZWerte() → Fertig",
    "color:#33a02c; font-weight:bold;",
    { plzCount: Object.keys(result).length }
  );
}




renderErhebungsInfo() {
  this._infoMaskActive = true;

  const container = this._shadowRoot.querySelector(".filter-container");
  if (!container) return;

  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.style.padding = "10px";
  wrapper.style.fontFamily = "sans-serif";

  wrapper.innerHTML = `
    <h3 style="margin-top:0;color:#b41821;">Erhebungsübersicht</h3>

    <table style="width:100%;border-collapse:collapse;font-size:0.75rem;table-layout:fixed;">
      <thead>
        <tr style="background:#b41821;color:white;">
          <th style="padding:4px;text-align:left;width:50px;">NL</th>
          <th style="padding:4px;text-align:right;width:90px;">Jahresumsatz</th>
          <th style="padding:4px;text-align:right;width:90px;">Erfasst</th>
          <th style="padding:4px;text-align:right;width:90px;">Abdeckung</th>
          <th style="padding:4px;text-align:right;width:90px;">Valide</th>
          <th style="padding:4px;text-align:right;width:90px;">Validität</th>
          <th style="padding:4px;text-align:right;width:90px;">Jahresabdeckung</th>
        </tr>
      </thead>
      <tbody>
        ${Object.values(this.erhebungsInfo).map(info => `
          <tr class="nl-row" data-nl="${info.nl}" style="cursor:pointer;">
            <td style="padding:4px;">${info.nl}</td>
            <td style="padding:4px;text-align:right;">${info.jahresumsatz.toLocaleString("de-DE")}</td>
            <td style="padding:4px;text-align:right;">${info.erfasst_total.toLocaleString("de-DE")}</td>
            <td style="padding:4px;text-align:right;">${(info.pct_erfassung * 100).toFixed(1)}%</td>
            <td style="padding:4px;text-align:right;">${info.erfasst_valid.toLocaleString("de-DE")}</td>
            <td style="padding:4px;text-align:right;">${(info.pct_valid * 100).toFixed(1)}%</td>
            <td style="padding:4px;text-align:right;">${(info.pct_hochrechnung * 100).toFixed(1)}%</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <button id="btn-erhebung-weiter"
      style="margin-top:15px;width:100%;padding:8px;background:#b41821;color:white;border:none;cursor:pointer;border-radius:4px;">
      Weiter zur PLZ-Analyse
    </button>
  `;

  container.appendChild(wrapper);

  // 🔥 Klick auf NL-Zeile = Klick auf Marker
  wrapper.querySelectorAll(".nl-row").forEach(row => {
    row.addEventListener("click", () => {
      const nl = row.dataset.nl;

      if (!this._selectedNLs) this._selectedNLs = new Set();
      this._selectedNLs.clear();
      this._selectedNLs.add(nl);

      this.applyNLFilter([nl]);

      const radius = Number(this._shadowRoot.getElementById("radius-slider").value);
      this.applyRadiusFilter(radius);

      this.updateGeoLayer();
      this.renderDataTable(this.filteredKennwerte);

      const popup = this._shadowRoot.getElementById("side-popup");
      popup.classList.remove("show");
    });
  });

  // 🔥 Zurück zur PLZ-Analyse
  wrapper.querySelector("#btn-erhebung-weiter").addEventListener("click", () => {
    wrapper.style.transition = "opacity 0.4s ease";
    wrapper.style.opacity = "0";

    setTimeout(() => {
      this._infoMaskActive = false;
      this.restoreFilterUI();
      this.setupFilterDropdowns();
      this.restoreDropdownSelections();
      this.renderDataTable(this.filteredKennwerte);
    }, 400);
  });
}


      onCustomWidgetEvent(event) {
        if (event.name === "toggleTiles") {
          this.toggleMapTiles();
        }
      }

      set myDataSource(dataBinding) {
        this._myDataSource = dataBinding;

        if (!this.map) {
          const waitForMap = setInterval(() => {
            if (this.map) {
              clearInterval(waitForMap);
              this.render();
            }
          }, 100);
          return;
        }

        this.render();
      }


prepareMapData(filteredData) {
  const rawData = this._myDataSource?.data || [];
  const geoFeatures = this._geoData?.features || [];

  // Reset
  this.kennwerte = {};
  this.hzFlags = {};
  this.Niederlassung = {};
  this.nlKoordinaten = {};
  this.plzKennwerte = {};
  this.filteredKennwerte = {};
  this.extraNLs = [];

  const kennzahlenIDs = [
    "value_hr_n_umsatz_0", "value_umsatz_p_hh_0", "value_wk_in_percent_0",
    "value_wk_nachbar_0", "value_hz_kosten_0",
    "value_werbeverweigerer_0", "value_haushalte_0", "value_kaufkraft_0",
    "value_ums_erhebung_0", "value_kd_erhebung_0",
    "value_bon_erhebung_0", "value_auflage_0"
  ];

  // Geo-Notes
  const geoNotes = {};
  geoFeatures.forEach(f => {
    const plz = f.properties?.plz?.trim();
    const note = f.properties?.note?.trim();
    if (plz) geoNotes[plz] = note || "";
  });

  // Verarbeitung der gefilterten Daten
  filteredData.forEach(row => {
    const plz = row["dimension_plz_0"]?.id?.trim();
    const nlKey = row["dimension_niederlassung_0"]?.id?.trim();
    const hzFlag = row["dimension_hzflag_0"]?.id?.trim() === "X";

    const lat = parseFloat(row["dimension_Lat_0"]?.label);
    const lon = parseFloat(row["dimension_lon_0"]?.label);

    // --- Niederlassung speichern ---
    if (nlKey) {
      this.Niederlassung[nlKey] = nlKey;

      if (!isNaN(lat) && !isNaN(lon)) {
        this.nlKoordinaten[nlKey] = { lat, lon };
      }
    }

    // --- PLZ-Kennwerte speichern ---
    if (plz && plz !== "@NullMember") {
      this.filteredKennwerte[plz] = {};
      this.hzFlags[plz] = hzFlag;

      kennzahlenIDs.forEach(id => {
        const raw = row[id]?.raw;
        this.filteredKennwerte[plz][id] = typeof raw === "number" ? raw : "–";
      });

      this.filteredKennwerte[plz]["dimension_note_0"] = {
        label: geoNotes[plz] || ""
      };
    }
  });
}

// getDistanceKm(lat1, lon1, lat2, lon2)
getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// getPolygonCenter(layer)
getPolygonCenter(layer) {
  return layer.getBounds().getCenter();
}


applyRadiusFilter(radiusKm) {
  if (!this._geoLayer || !this.nlMarkers || this.nlMarkers.length === 0) return;

  // Cache initialisieren
  if (!this._plzCenterCache) this._plzCenterCache = {};
  if (!this._distanceCache) this._distanceCache = {};

  const plzImRadius = new Set();

  this._geoLayer.eachLayer(layer => {
    const plz = String(layer.feature?.properties?.plz ?? "").padStart(5, "0");
    if (!plz) return;

    // 1) PLZ-Zentrum cachen
    if (!this._plzCenterCache[plz]) {
      this._plzCenterCache[plz] = layer.getBounds().getCenter();
    }
    const center = this._plzCenterCache[plz];

    // 2) Distanz zu NLs cachen
    if (!this._distanceCache[plz]) this._distanceCache[plz] = {};

    let minDist = Infinity;

    for (const nl of this.nlMarkers) {
      const key = nl.lat + "," + nl.lng;

      if (!this._distanceCache[plz][key]) {
        this._distanceCache[plz][key] =
          this.getDistanceKm(center.lat, center.lng, nl.lat, nl.lng);
      }

      const d = this._distanceCache[plz][key];
      if (d < minDist) minDist = d;
    }

    // 3) Radiusentscheidung
    if (minDist <= radiusKm) {
      plzImRadius.add(plz);
    }
  });

  this.plzImRadius = plzImRadius;

  // 4) Karte + Tabelle aktualisieren
this.computeWKKennwerte();
this.computeStreuverlust();
this.updateGeoLayer();
this.renderDataTable(this.filteredKennwerte);

}
computeWKKennwerte() {
  if (!this.filteredData) return;

  const aggregated = {};
  const unfilteredUmsatzByPLZ = {};

  // Ungefilterter Umsatz pro PLZ
  this.filteredData.forEach(row => {
    const rawPLZ = row["dimension_plz_0"]?.id ?? row["dimension_plz_0"]?.raw;
    const plz = String(rawPLZ || "").padStart(5, "0");
    const umsatz = row["value_hr_n_umsatz_0"]?.raw ?? 0;
    unfilteredUmsatzByPLZ[plz] = (unfilteredUmsatzByPLZ[plz] || 0) + umsatz;
  });

  // Aggregation WK
  this.filteredData.forEach(row => {
    const nl = row["dimension_niederlassung_0"]?.id?.trim();
    const rawPLZ = row["dimension_plz_0"]?.id ?? row["dimension_plz_0"]?.raw;
    const plz = String(rawPLZ || "").padStart(5, "0");

    if (this._selectedNLs.size > 0 && !this._selectedNLs.has(nl)) return;
    if (this.plzImRadius instanceof Set && !this.plzImRadius.has(plz)) return;

    if (!aggregated[plz]) {
      aggregated[plz] = {
        hzCount: 0,
        umsatzNetto: 0,
        hzKosten: 0,
        potHzKosten: []
      };
    }

    const entry = aggregated[plz];

    const hz = row["dimension_hzflag_0"]?.id?.trim() === "X";
    if (hz) entry.hzCount++;

    entry.umsatzNetto += row["value_hr_n_umsatz_0"]?.raw ?? 0;
    entry.hzKosten += row["value_hz_kosten_0"]?.raw ?? 0;

    const potHz = row["value_hz_potentiell_0"]?.raw;
    if (typeof potHz === "number") entry.potHzKosten.push(potHz);
  });

  const base = this.filteredKennwerte || {};
  const newFilteredKennwerte = {};
  const newFilteredPLZWerte = {};

  Object.entries(aggregated).forEach(([plz, entry]) => {
    const umsatzNetto = entry.umsatzNetto;
    const hzKosten = entry.hzKosten;

    const wkPercent =
      umsatzNetto > 0 ? Number(((hzKosten / umsatzNetto) * 100).toFixed(1)) : 0;

    const unfilteredUmsatz = unfilteredUmsatzByPLZ[plz] ?? 0;
    const wkNachbarn =
      unfilteredUmsatz > 0
        ? Number(((hzKosten / unfilteredUmsatz) * 100).toFixed(1))
        : 0;

    const avgPotHz =
      entry.potHzKosten.length > 0
        ? entry.potHzKosten.reduce((a, b) => a + b, 0) / entry.potHzKosten.length
        : 0;

    const potHzPercent =
      umsatzNetto > 0 ? Number(((avgPotHz / umsatzNetto) * 100).toFixed(1)) : 0;

    const isHZ = entry.hzCount > 0;
    const isCritical = entry.hzCount > 1;

    const baseEntry = base[plz] || {};
    const old = this.filteredPLZWerte?.[plz] || {};

    // WK-Kennwerte
    newFilteredKennwerte[plz] = {
      ...baseEntry,
      isHZ,
      isCritical,
      value_hr_n_umsatz_0: { raw: umsatzNetto },
      value_wk_in_percent_0: { raw: wkPercent },
      value_wk_nachbar_0: { raw: wkNachbarn },
      value_hz_kosten_0: { raw: hzKosten },
      value_hz_potentiell_0: { raw: avgPotHz },
      value_wk_potentiell_0: { raw: potHzPercent }
    };

    // Umsatzdaten übernehmen
    newFilteredPLZWerte[plz] = {
      wk: wkPercent,
      wkPot: potHzPercent,
      hz: isHZ,

      umsatz: old.umsatz ?? 0,
      ra: old.ra ?? 0,
      onlineshop: old.onlineshop ?? 0,
      pluscard: old.pluscard ?? 0,
      haushalte: old.haushalte ?? 0,

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

      // WICHTIG: Werbeanteil erhalten
      werbeAnteil: old.werbeAnteil ?? 0
    };
  });

  this.filteredKennwerte = newFilteredKennwerte;
  this.filteredPLZWerte = newFilteredPLZWerte;
}



toggleNLSelection(nl) {
  if (!this._selectedNLs) this._selectedNLs = new Set();

  // Toggle
  if (this._selectedNLs.has(nl)) {
    this._selectedNLs.delete(nl);
  } else {
    this._selectedNLs.add(nl);
  }

  // Wenn ALLE NLs ausgewählt → alle markieren
  if (this._selectedNLs.size === this.allNLs.length) {
    this._selectedNLs = new Set(this.allNLs);
  }

  // Tabelle aktualisieren
  this.updateNLSelectionUI();

  // Filter anwenden
  this.applyNLFilter([...this._selectedNLs]);

  const radius = Number(this._shadowRoot.getElementById("radius-slider").value);
  this.applyRadiusFilter(radius);

  // Karte aktualisieren
  this.updateGeoLayer();

  // PLZ-Tabelle aktualisieren
  this.renderDataTable(this.filteredKennwerte);
  this.prepareUmsatzPLZWerte();

}



initRadiusSlider() {
  const slider = this._shadowRoot.getElementById("radius-slider");
  const valueLabel = this._shadowRoot.getElementById("radius-value");

  if (!slider) {
    console.warn("⚠️ Radius-Slider nicht gefunden!");
    return;
  }

  // Standardwert anzeigen
  valueLabel.textContent = slider.value;

  slider.addEventListener("input", () => {
    const radius = Number(slider.value);
    valueLabel.textContent = radius;

    // 1) Karte live filtern
    this.applyRadiusFilter(radius);

    // 2) Tabelle live filtern
    this.renderDataTable(this.filteredKennwerte);

    // 3) Optional: Zoom live aktualisieren
    // this.zoomToFilteredPLZ();
  });
}


getColorForPLZ(plz) {
  const data = this.filteredPLZWerte?.[plz];
  if (!data) return "#cfd4da";

  const wk = data.wk ?? 0;
  const wkPot = data.wkPot ?? 0;
  const isHZ = data.hz === true;

  const value = isHZ ? wk : wkPot;

  return this.getColor(value, isHZ);
}


getFilteredDataWithRadius() {
  if (!this.filteredData) return [];

  const result = [];
  const aggregated = {};

  // 🔥 Ungefilterter Umsatz pro PLZ (für WK inkl. Nachbarn)
  const unfilteredUmsatzByPLZ = {};
  this.filteredData.forEach(row => {
    const rawPLZ = row["dimension_plz_0"]?.id ?? row["dimension_plz_0"]?.raw;
    const plz = rawPLZ == null ? "" : String(rawPLZ).padStart(5, "0");
    const umsatz = row["value_hr_n_umsatz_0"]?.raw ?? 0;
    unfilteredUmsatzByPLZ[plz] = (unfilteredUmsatzByPLZ[plz] || 0) + umsatz;
  });

  // 🔥 Gesamtumsatz der Erhebung (nach NL-Filter, unabhängig vom Radius)
  let totalErhebungUmsatz = 0;

  // 🔥 Streuverlust-Struktur
  const streuverlust = {
    sum: {
      umsatzNetto: 0,
      hzKosten: 0,
      umsatzErhebung: 0,
      kdErhebung: 0,
      auflage: 0,
      potHzAbs: 0
    },
    avgArrays: {
      werbeverweigerer: [],
      haushalte: [],
      kaufkraft: []
    }
  };

  this.filteredData.forEach(row => {
    const nl = row["dimension_niederlassung_0"]?.id?.trim();
    const rawPLZ = row["dimension_plz_0"]?.id ?? row["dimension_plz_0"]?.raw;
    const plz = rawPLZ == null ? "" : String(rawPLZ).padStart(5, "0");

    // 1️⃣ NL-Filter
    if (this._selectedNLs.size > 0 && !this._selectedNLs.has(nl)) {
      return;
    }

    // 🔥 Gesamtumsatz der Erhebung (für diese NLs, unabhängig vom Radius)
    totalErhebungUmsatz += row["value_hr_n_umsatz_0"]?.raw ?? 0;

    // 2️⃣ Radiusfilter
    const isInRadius = this.plzImRadius instanceof Set
      ? this.plzImRadius.has(plz)
      : true;

    // 3️⃣ Streuverlust (PLZ gehört zur NL, aber liegt außerhalb Radius)
    if (!isInRadius) {
      streuverlust.sum.umsatzNetto += row["value_hr_n_umsatz_0"]?.raw ?? 0;
      streuverlust.sum.hzKosten += row["value_hz_kosten_0"]?.raw ?? 0;
      streuverlust.sum.umsatzErhebung += row["value_ums_erhebung_0"]?.raw ?? 0;
      streuverlust.sum.kdErhebung += row["value_kd_erhebung_0"]?.raw ?? 0;
      streuverlust.sum.auflage += row["value_auflage_0"]?.raw ?? 0;
      streuverlust.sum.potHzAbs += row["value_hz_potentiell_0"]?.raw ?? 0;

      const wv = row["value_werbeverweigerer_0"]?.raw;
      if (typeof wv === "number") streuverlust.avgArrays.werbeverweigerer.push(wv);

      const hh = row["value_haushalte_0"]?.raw;
      if (typeof hh === "number") streuverlust.avgArrays.haushalte.push(hh);

      const kk = row["value_kaufkraft_0"]?.raw;
      if (typeof kk === "number") streuverlust.avgArrays.kaufkraft.push(kk);

      return; // nicht aggregieren
    }

    // 4️⃣ Reguläre Radius-PLZ
    result.push(row);

    if (!aggregated[plz]) {
      aggregated[plz] = {
        hzCount: 0,
        sum: {
          umsatzNetto: 0,
          hzKosten: 0,
          umsatzErhebung: 0,
          kdErhebung: 0,
          auflage: 0,
          potHzAbs: 0
        },
        avgArrays: {
          werbeverweigerer: [],
          haushalte: [],
          kaufkraft: [],
          potHzKosten: []   // ⭐ NEU: Array für Durchschnitt
        }
      };
    }

    const entry = aggregated[plz];

    const hz = row["dimension_hzflag_0"]?.id?.trim() === "X";
    if (hz) entry.hzCount++;

    entry.sum.umsatzNetto += row["value_hr_n_umsatz_0"]?.raw ?? 0;
    entry.sum.hzKosten += row["value_hz_kosten_0"]?.raw ?? 0;
    entry.sum.umsatzErhebung += row["value_ums_erhebung_0"]?.raw ?? 0;
    entry.sum.kdErhebung += row["value_kd_erhebung_0"]?.raw ?? 0;
    entry.sum.auflage += row["value_auflage_0"]?.raw ?? 0;

    // ⭐ NEU: potentielle HZ-Kosten als Durchschnitt, nicht Summe
    const potHz = row["value_hz_potentiell_0"]?.raw;
    if (typeof potHz === "number") {
      entry.avgArrays.potHzKosten.push(potHz); // Durchschnitt
    }

    const wv2 = row["value_werbeverweigerer_0"]?.raw;
    if (typeof wv2 === "number") entry.avgArrays.werbeverweigerer.push(wv2);

    const hh2 = row["value_haushalte_0"]?.raw;
    if (typeof hh2 === "number") entry.avgArrays.haushalte.push(hh2);

    const kk2 = row["value_kaufkraft_0"]?.raw;
    if (typeof kk2 === "number") entry.avgArrays.kaufkraft.push(kk2);
  });

  // 5️⃣ Aggregation
  const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const mergedPLZWerte = {};

  Object.entries(aggregated).forEach(([plz, entry]) => {
    const sum = entry.sum;
    const avgArr = entry.avgArrays;

    const avgWerbeverweigerer = avg(avgArr.werbeverweigerer);
    const avgHaushalte = avg(avgArr.haushalte);
    const avgKaufkraft = avg(avgArr.kaufkraft);

    // ⭐ NEU: Durchschnitt der potenziellen HZ-Kosten
    const avgPotHzKosten = avg(avgArr.potHzKosten);

    const umsatzNetto = sum.umsatzNetto;
    const hzKosten = sum.hzKosten;

    const wkPercent = umsatzNetto > 0
      ? Number(((hzKosten / umsatzNetto) * 100).toFixed(1))
      : 0;

    const unfilteredUmsatz = unfilteredUmsatzByPLZ[plz] ?? 0;
    const wkNachbarn = unfilteredUmsatz > 0
      ? Number(((hzKosten / unfilteredUmsatz) * 100).toFixed(1))
      : 0;

    // ⭐ NEU: potHzPercent basiert auf Durchschnitt, nicht Summe
    const potHzPercent = umsatzNetto > 0
      ? Number(((avgPotHzKosten / umsatzNetto) * 100).toFixed(1))
      : 0;

    const isHZ = entry.hzCount > 0;
    const isCritical = entry.hzCount > 1;

    // WK-Kennwerte
    this.filteredKennwerte[plz] = {
      isHZ,
      isCritical,
      value_hr_n_umsatz_0: { raw: umsatzNetto },
      value_wk_in_percent_0: { raw: wkPercent },
      value_wk_nachbar_0: { raw: wkNachbarn },
      value_hz_kosten_0: { raw: hzKosten },
      value_werbeverweigerer_0: { raw: avgWerbeverweigerer },
      value_haushalte_0: { raw: avgHaushalte },
      value_kaufkraft_0: { raw: avgKaufkraft },
      value_ums_erhebung_0: { raw: sum.umsatzErhebung },
      value_kd_erhebung_0: { raw: sum.kdErhebung },
      value_bon_erhebung_0: { raw: sum.kdErhebung > 0 ? Number((sum.umsatzErhebung / sum.kdErhebung).toFixed(2)) : 0 },
      value_auflage_0: { raw: sum.auflage },

      // ⭐ NEU: Durchschnittliche potenzielle HZ-Kosten
      value_hz_potentiell_avg_0: { raw: avgPotHzKosten },

      // ⭐ NEU: Prozentwert basierend auf Durchschnitt
      value_wk_potentiell_0: { raw: potHzPercent }
    };

    // Umsatzwerte aus prepareUmsatzPLZWerte übernehmen
    const old = this.filteredPLZWerte?.[plz] || {};

    mergedPLZWerte[plz] = {
      // WK
      wk: wkPercent,
      wkNachbarn,
      wkPot: potHzPercent,
      hz: isHZ,

      // Umsatz
      umsatz: old.umsatz ?? 0,
      ra: old.ra ?? 0,
      onlineshop: old.onlineshop ?? 0,
      pluscard: old.pluscard ?? 0,
      haushalte: old.haushalte ?? 0,
      umsatzProHaushalt: old.umsatzProHaushalt ?? 0,
      raProHaushalt: old.raProHaushalt ?? 0,
      onlineshopProHaushalt: old.onlineshopProHaushalt ?? 0,
      pluscardProHaushalt: old.pluscardProHaushalt ?? 0
    };
  });

  this.filteredPLZWerte = mergedPLZWerte;

  // 6️⃣ Streuverlust final berechnen
  this.streuverlust = {
    umsatz: streuverlust.sum.umsatzNetto,
    anteil: totalErhebungUmsatz > 0
      ? streuverlust.sum.umsatzNetto / totalErhebungUmsatz
      : 0
  };

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

  const note = this.geoNotes?.[plz] || "Keine Notiz";

  popup.innerHTML = `
    <button class="close-btn">×</button>

    <!-- =============================== -->
    <!--   TABELLE 1: GESAMT-KENNZAHLEN  -->
    <!-- =============================== -->
    <table>
      <thead>
        <tr><th colspan="2" class="title-cell">${note}</th></tr>
        <tr><th colspan="2" class="subtitle-cell">
          Keine Umsatzdaten für PLZ ${plz}
        </th></tr>
      </thead>

      <tbody>
        <tr>
          <td class="label-cell">Stationär</td>
          <td class="value-cell">–</td>
        </tr>
        <tr>
          <td class="label-cell">Pluscard</td>
          <td class="value-cell">–</td>
        </tr>
        <tr>
          <td class="label-cell">R&A</td>
          <td class="value-cell">–</td>
        </tr>
        <tr>
          <td class="label-cell">Onlineshop</td>
          <td class="value-cell">–</td>
        </tr>
      </tbody>
    </table>

    <!-- Umsatz-Balken (leer) -->
    <div class="umsatz-share-bar empty">
      <div class="share-segment empty"></div>
    </div>

    <div class="umsatz-legend">
<span><span style="color:#b41821;">⬤</span> Stationär</span>
<span><span style="color:#1f78b4;">⬤</span> Pluscard</span>
<span><span style="color:#33a02c;">⬤</span> R&A</span>
<span><span style="color:#ffb000;">⬤</span> Onlineshop</span>

    </div>

    <!-- ===================================== -->
    <!--   TABELLE 2: PRO-HAUSHALT-KENNZAHLEN  -->
    <!-- ===================================== -->
    <table class="hh-table">
      <thead>
        <tr><th colspan="2" class="subtitle-cell">Kennzahlen pro Haushalt</th></tr>
      </thead>

      <tbody>
        <tr><td class="label-cell">Haushalte</td><td class="value-cell">–</td></tr>
        <tr><td class="label-cell">Stationär pro HH</td><td class="value-cell">–</td></tr>
        <tr><td class="label-cell">Pluscard pro HH</td><td class="value-cell">–</td></tr>
        <tr><td class="label-cell">R&A pro HH</td><td class="value-cell">–</td></tr>
        <tr><td class="label-cell">Onlineshop pro HH</td><td class="value-cell">–</td></tr>
      </tbody>
    </table>
  `;

  popup.classList.remove("hidden");
  void popup.offsetWidth;
  popup.classList.add("show");

  popup.querySelector(".close-btn").onclick = () => {
    popup.classList.remove("show");
    popup.classList.add("hidden");
  };
}




  prepareDropdownData(data) {
    const erhSelect = this._shadowRoot.getElementById("erhebung-select");
    const jahrSelect = this._shadowRoot.getElementById("jahr-select");
    const nummerSelect = this._shadowRoot.getElementById("nummer-select");

    if (!erhSelect || !jahrSelect || !nummerSelect) {
      console.warn("❌ Dropdown-Elemente nicht gefunden im Shadow DOM");
      return;
    }

    // 🧹 Vorherige Optionen entfernen
    erhSelect.innerHTML = "";
    jahrSelect.innerHTML = "";
    nummerSelect.innerHTML = "";
    jahrSelect.disabled = true;
    nummerSelect.disabled = true;

    // 🧩 Erhebungsstruktur aufbauen
    this._erhData = {}; // { erhID: { jahr: Set(nummern) } }

    data.forEach(row => {
      const erhID = row["dimension_erhebung_0"]?.id?.trim();
      const jahr = row["dimension_jahr_0"]?.id?.trim();
      const nummer = row["dimension_erhebungsnummer_0"]?.id?.trim();
      if (!erhID || !jahr || !nummer) return;

      this._erhData[erhID] = this._erhData[erhID] || {};
      this._erhData[erhID][jahr] = this._erhData[erhID][jahr] || new Set();
      this._erhData[erhID][jahr].add(nummer);
    });

    // 🧩 ErhebungsIDs in Dropdown einfügen
    Object.keys(this._erhData).forEach(erhID => {
      const opt = document.createElement("option");
      opt.value = erhID;
      opt.textContent = erhID;
      erhSelect.appendChild(opt);
    });

    // 📅 Jahre nach Auswahl
    erhSelect.addEventListener("change", () => {
      jahrSelect.innerHTML = "";
      nummerSelect.innerHTML = "";
      jahrSelect.disabled = false;
      nummerSelect.disabled = true;

      const selectedID = erhSelect.value;
      const jahre = Object.keys(this._erhData[selectedID] || {});

      jahre.forEach(j => {
        const opt = document.createElement("option");
        opt.value = j;
        opt.textContent = j;
        jahrSelect.appendChild(opt);
      });
    });

    // 🔢 Nummern nach Jahr
    jahrSelect.addEventListener("change", () => {
      nummerSelect.innerHTML = "";
      nummerSelect.disabled = false;

      const selectedID = erhSelect.value;
      const selectedJahr = jahrSelect.value;
      const nummern = Array.from(this._erhData[selectedID]?.[selectedJahr] || []);

      nummern.forEach(n => {
        const opt = document.createElement("option");
        opt.value = n;
        opt.textContent = n;
        nummerSelect.appendChild(opt);
      });
    });

    // 🟢 Filter aktivieren
    const filterButton = this._shadowRoot.getElementById("filter-button");
    if (filterButton) {
      filterButton.addEventListener("click", () => {
        const selectedID = erhSelect.value;
        const selectedJahr = jahrSelect.value;
        const selectedNummer = nummerSelect.value;

       this.loadErhebung(selectedID, selectedJahr, selectedNummer);

      });
    }
  }

  async render() {
    if (!this.map || !this._myDataSource || this._myDataSource.state !== "success") {
      console.warn("⛔️ Voraussetzungen für Render nicht erfüllt.");
      return;
    }

    this.showSpinner();

    const rawData = this._myDataSource.data;

    // 🔧 Filterstruktur & Dropdowns vorbereiten
    this._erhData = this.buildErhebungsStruktur(rawData);
    this.setupFilterDropdowns();

    // 🔍 Filter anwenden oder Rohdaten verwenden
    const isFiltered = !!this._activeFilter;
    const filteredData = isFiltered ? this.getFilteredData() : rawData;

    // 📦 Daten vorbereiten für Marker, Kennzahlen etc.
  this.prepareMapData(filteredData);

// WK neu berechnen
this.computeWKKennwerte();
this.computeStreuverlust();




    // 🌍 GeoJSON laden & Layer aktualisieren
    await this.loadGeoJson();

    this.updateGeoLayer();
      this.createAllMarkers();
    // 📌 PLZs extrahieren für Marker-Filterung
    const filteredPLZs = isFiltered
      ? filteredData
          .map(d => d["dimension_plz_0"]?.id?.trim())
          .filter(plz => plz && plz !== "@NullMember")
      : Object.keys(this.allMarkers); // ⬅️ Initial: alle Marker anzeigen

    // 📍 Marker anzeigen (gefiltert oder vollständig)
    this.updateMarkers(filteredPLZs);

    // 📊 Tabelle aktualisieren
    this.renderDataTable(this.filteredKennwerte);

    this.hideSpinner();
  }
updateHeatmapLegend() {

  const legend = this._shadowRoot.getElementById("heatmap-legend");
  if (!legend) return;
  if (!this.currentMapMode) {
    legend.classList.add("hidden");
    return;
  }

  // WK-Modus → Werbekosten (isHZ === false Skala)
// WK-Modus → Werbekosten (isHZ === false Skala)
if (this.currentMapMode === "wk") {
  legend.innerHTML = `
    <div><strong>Werbekosten</strong></div>

    <div style="margin-top:6px; font-weight:bold; color:#444;">Bestreut (% WK am Umsatz)</div>

    <div class="heatmap-legend-row">
      <div class="heatmap-legend-color" style="background:#e31a1c"></div> > 25 %
    </div>
    <div class="heatmap-legend-row">
      <div class="heatmap-legend-color" style="background:#fd8d3c"></div> 15–25 %
    </div>
    <div class="heatmap-legend-row">
      <div class="heatmap-legend-color" style="background:#ffffb2"></div> 10–15 %
    </div>
    <div class="heatmap-legend-row">
      <div class="heatmap-legend-color" style="background:#78c679"></div> 5–10 %
    </div>
    <div class="heatmap-legend-row">
      <div class="heatmap-legend-color" style="background:#41ab5d"></div> 2–5 %
    </div>
    <div class="heatmap-legend-row">
      <div class="heatmap-legend-color" style="background:#006837"></div> 0–2 %
    </div>

    <div style="margin-top:10px; font-weight:bold; color:#444;">Nicht bestreut (% Pot. WK am Umsatz)</div>

    <div class="heatmap-legend-row">
      <div class="heatmap-legend-color" style="background:#cfd4da"></div> > 50 %
    </div>
    <div class="heatmap-legend-row">
      <div class="heatmap-legend-color" style="background:#bdbdbd"></div> 25–50 %
    </div>
    <div class="heatmap-legend-row">
      <div class="heatmap-legend-color" style="background:#969696"></div> 15–25 %
    </div>
    <div class="heatmap-legend-row">
      <div class="heatmap-legend-color" style="background:#6baed6"></div> 10–15 %
    </div>
    <div class="heatmap-legend-row">
      <div class="heatmap-legend-color" style="background:#2171b5"></div> 5–10 %
    </div>
    <div class="heatmap-legend-row">
      <div class="heatmap-legend-color" style="background:#08306b"></div> 0–5 %
    </div>
  `;
  legend.classList.remove("hidden");
  return;
}



  // Umsatz-Heatmap
  if (this.currentMapMode === "umsatz-multi") {
    legend.innerHTML = `
      <div><strong>Umsatz-Heatmap</strong></div>
      <div class="heatmap-legend-row"><div class="heatmap-legend-color" style="background:#7a0f17"></div> &gt;95%</div>
      <div class="heatmap-legend-row"><div class="heatmap-legend-color" style="background:#9d131b"></div> 85–95%</div>
      <div class="heatmap-legend-row"><div class="heatmap-legend-color" style="background:#b41821"></div> 75–85%</div>
      <div class="heatmap-legend-row"><div class="heatmap-legend-color" style="background:#d9483b"></div> 65–75%</div>
      <div class="heatmap-legend-row"><div class="heatmap-legend-color" style="background:#e96a3a"></div> 55–65%</div>
      <div class="heatmap-legend-row"><div class="heatmap-legend-color" style="background:#f08a3c"></div> 45–55%</div>
      <div class="heatmap-legend-row"><div class="heatmap-legend-color" style="background:#f6b65b"></div> 35–45%</div>
      <div class="heatmap-legend-row"><div class="heatmap-legend-color" style="background:#f7d77a"></div> 20–35%</div>
      <div class="heatmap-legend-row"><div class="heatmap-legend-color" style="background:#fce9b2"></div> &lt;20%</div>
    `;
    legend.classList.remove("hidden");
    return;
  }

  // Werbeanteil-Heatmap
  if (this.currentMapMode === "werbeanteil") {
    legend.innerHTML = `
      <div><strong>Werbeanteil</strong></div>
      <div class="heatmap-legend-row"><div class="heatmap-legend-color" style="background:#7a0f17"></div> &gt;80%</div>
      <div class="heatmap-legend-row"><div class="heatmap-legend-color" style="background:#b41821"></div> 60–80%</div>
      <div class="heatmap-legend-row"><div class="heatmap-legend-color" style="background:#e96a3a"></div> 40–60%</div>
      <div class="heatmap-legend-row"><div class="heatmap-legend-color" style="background:#f6b65b"></div> 20–40%</div>
      <div class="heatmap-legend-row"><div class="heatmap-legend-color" style="background:#f7d77a"></div> 10–20%</div>
      <div class="heatmap-legend-row"><div class="heatmap-legend-color" style="background:#fce9b2"></div> &lt;10%</div>
    `;
    legend.classList.remove("hidden");
    return;
  }

  legend.classList.add("hidden");
}

async loadErhebung(erhID, jahr, nummer) {
  console.log("🚀 loadErhebung gestartet:", erhID, jahr, nummer);

  // 1) UI blockieren + Animation starten
  this.showLoadingOverlay();
  this.fadeOutMapElements();
  this.closeNLTable?.();

  // 2) BW-Query (einzige Query!)
  const rawData = await this.queryErhebungFromBW(erhID, jahr, nummer);
  this._activeFilter = { erhID, jahr, nummer };
  this.filteredData = rawData;

  // 3) Pre-Aggregation (alles clientseitig)
  this.prepareMapData(rawData);
  this.prepareUmsatzPLZWerte();
  this.computeWKKennwerte();
  this.computeStreuverlust();

  // 4) Marker + Radius + GeoLayer
  this.createAllMarkers();

  const radius = Number(this._shadowRoot.getElementById("radius-slider")?.value ?? 0);
  this.applyRadiusFilter(radius);

  this.updateGeoLayer();

  // 5) Erhebungsinfo vorbereiten (für NL-Übersicht)
  this.prepareErhebungsInfo();

  // 6) Zoom auf relevante PLZ
  this.zoomToFilteredPLZ();

  // 7) Tabelle aktualisieren
  this.renderDataTable(this.filteredKennwerte);

  // 8) Heatmap + Marker Reveal Animation
  // await this.animateRevealSequence();

  console.log("✅ loadErhebung abgeschlossen");
}



showLoadingOverlay() {
  const overlay = this._shadowRoot.getElementById("loading-spinner");
  if (!overlay) return;

  overlay.classList.remove("hidden");
  overlay.style.opacity = "1";
}

hideLoadingOverlay() {
  const overlay = this._shadowRoot.getElementById("loading-spinner");
  if (!overlay) return;

  overlay.style.transition = "opacity 0.25s ease";
  overlay.style.opacity = "0";

  setTimeout(() => {
    overlay.classList.add("hidden");
  }, 250);
}


fadeOutMapElements() {
  const mapPane = this._shadowRoot.querySelector("#map");
  if (!mapPane) return;

  mapPane.style.transition = "opacity 0.25s ease";
  mapPane.style.opacity = "0";

  this.filteredGroup?.eachLayer(m => m.setOpacity?.(0));
  this.neighbourGroup?.eachLayer(m => m.setOpacity?.(0));
}

async animateRevealSequence() {
  return new Promise(resolve => {

    // 0) Karte bleibt sichtbar (grau), nur Heatmap wird animiert
    const mapPane = this._shadowRoot.querySelector("#map");
    if (mapPane) {
      mapPane.style.opacity = "1"; // Karte bleibt sichtbar
    }

    // 1) Marker-Drop sofort starten
    this.dropMarkersAnimation();

    // 2) Heatmap-Reveal vorbereiten (Mask 0%)
    const paths = this._shadowRoot.querySelectorAll(".heatmap-reveal");
    paths.forEach(p => {
      p.style.transition = "mask-image 3s ease, -webkit-mask-image 3s ease";
      p.style.maskImage = "linear-gradient(to right, black 0%, black 0%, transparent 0%)";
      p.style.webkitMaskImage = "linear-gradient(to right, black 0%, black 0%, transparent 0%)";
    });

    // 3) Heatmap-Reveal starten (Mask 100%)
    requestAnimationFrame(() => {
      paths.forEach(p => {
        p.style.maskImage = "linear-gradient(to right, black 0%, black 100%, black 100%)";
        p.style.webkitMaskImage = "linear-gradient(to right, black 0%, black 100%, black 100%)";
      });
    });

    // 4) Overlay ausblenden (parallel)
    this.hideLoadingOverlay();

    // 5) Nach 3 Sekunden Heatmap-Reveal + 1 Sekunde Pause → Zoom
    setTimeout(() => {
      this.zoomToFilteredPLZ();

      // 6) Animation abgeschlossen
      resolve();

    }, 4000); // 3s Reveal + 1s Pause
  });
}


dropMarkersAnimation() {
  if (!this.allMarkers) return;

  this.allMarkers.forEach((m, i) => {
    const el = m.getElement();
    if (!el) return;

    el.style.transition = "transform 0.25s ease, opacity 0.25s ease";
    el.style.transform = "translateY(20px)";
    el.style.opacity = "0";

    setTimeout(() => {
      el.style.transform = "translateY(0)";
      el.style.opacity = "1";
    }, 50 + i * 20);
  });
}


async queryErhebungFromBW(erhID, jahr, nummer) {
  // Aktuell: lokale Datenquelle
  const raw = this._myDataSource?.data || [];

  return raw.filter(row =>
    row["dimension_erhebung_0"]?.id == erhID &&
    row["dimension_jahr_0"]?.id == jahr &&
    row["dimension_erhebungsnummer_0"]?.id == nummer
  );
}



      showNotesOnMap() {
        if (!this._geoLayer) return;

        const zoomLevel = this.map.getZoom();
        const bounds = this.map.getBounds();

        this._geoLayer.eachLayer(layer => {
          const note = layer.feature?.properties?.note;
          const center = layer.getBounds?.().getCenter?.();

          if (zoomLevel >= 12 && note && center && bounds.contains(center)) {
            if (!layer.getTooltip()) {
              layer.bindTooltip(note, {
                permanent: true,
                direction: 'center',
                className: 'note-label'
              }).openTooltip();
            } else {
              layer.openTooltip();
            }
          } else {
            if (layer.getTooltip()) {
              layer.closeTooltip();
            }
          }
        });
      }
    }

    if (!customElements.get('geo-map-widget')) {
      customElements.define('geo-map-widget', GeoMapWidget);
    }
  })();
