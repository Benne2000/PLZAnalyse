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
  position: relative;
  z-index: 1;
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


      .legend {
        position: absolute;
        bottom: 20px;
        left: 20px;
        z-index: 1000;
        background: white;
        padding: 10px;
        border: 1px solid #999;
        font-family: sans-serif;
        font-size: 12px;
        line-height: 18px;
        color: #333;
      }

      .legend i {
        width: 18px;
        height: 18px;
        float: left;
        margin-right: 8px;
        opacity: 0.8;
      }

      .note-label {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid #999;
        padding: 2px 6px;
        font-size: 11px;
        color: #333;
        border-radius: 4px;
      }

#side-popup {
  position: absolute;
  right: 0;
  top: 0;
  width: 25%;
  height: 70%; /* nur obere 70% */
  background: white;
  border-left: 2px solid #b41821;
  padding: 10px;
  font-family: sans-serif;
  color: #b41821;
  box-sizing: border-box;
  overflow-y: auto;
  z-index: 99999;
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

  #side-popup table {
    width: 100%;
    table-layout: fixed; /* verhindert Breitenverschiebung */
    border-collapse: collapse;
    border: 1px solid #b41821;
    margin-top: 30px;

  }

  #side-popup th {
    background-color: #b41821;
    color: white;
    font-weight: bold;
    padding: 6px;
    text-align: left;
    border: 1px solid #b41821;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  #side-popup th.title-cell {
    max-width: 100%;
  }

  #side-popup th.subtitle-cell {
    background-color: #f3f3f3;
    color: black;
    font-weight: bold;
    padding: 6px;
    text-align: left;
    font-size: 0.85rem;
    padding: 4px 8px;
    
  }

  #side-popup td {
    border: 1px solid #b41821;
    font-size: 0.85rem;
    padding: 4px 8px;
    color: black;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  #side-popup td:first-child {
    width: 40%;
  }
  /* Entfernt Rahmen für Kennzahlen-Zeilen */
  #side-popup tr.kennzahl-row td {
    border: none;
  }

  #side-popup .section-title {
    background-color: #f3f3f3;
    color: black;
    font-weight: bold;
    padding: 6px;
    text-align: left;
  }

  #side-popup td:last-child {
    font-weight: bold;
  }
  #side-popup td.label-cell {
    text-align: left;
    width: 75%;
  }

  #side-popup td.value-cell {
    text-align: right;
    width: 25%;
    font-weight: normal;
  }

      #side-popup.show {
        opacity: 1;
        transform: translateX(0);
      }

      #side-popup .close-btn {
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


  #side-popup .extra-table {
    display: table;
    visibility: visible;
    table-layout: fixed;
    width: 100%;
    margin-top: 20px;
    border-collapse: collapse;
    border: 1px solid #b41821; /* Außenrahmen */
    font-size: 0.85rem;
    
  }

  /* Kopfzeile mit Rahmen */
  #side-popup .extra-table th {
    border: 1px solid #b41821;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    background-color: #f3f3f3;
    color: black;
    font-weight: bold;
    padding: 6px;
    text-align: left;
  }

  /* Zellen ohne Innenrahmen */
  #side-popup .extra-table td {
    padding: 6px;
    text-align: right;
    border: none; /* keine Zellrahmen */
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  #side-popup .extra-table td.label-cell {
    text-align: left;
    width: 75%;
  }

  #side-popup .extra-table td.value-cell {
    text-align: right;
    width: 25%;
    font-weight: normal;
  }

/* ------------------------------------------------------ */
/* Umsatz-Popup Layout (gleicher Stil wie WK-Popup)       */
/* ------------------------------------------------------ */

#side-popup .umsatz-total-row {
  background-color: #f3f3f3;
  color: black;
  font-weight: bold;
  padding: 6px 8px;
  text-align: left;
  border: 1px solid #b41821;
  font-size: 0.9rem;
}

#side-popup .umsatz-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 12px;
}

#side-popup .umsatz-box {
  border: 1px solid #b41821;
  border-radius: 4px;
  padding: 8px;
  background: #fff;
}

#side-popup .umsatz-box-title {
  font-weight: bold;
  color: #b41821;
  margin-bottom: 4px;
  font-size: 0.85rem;
}

#side-popup .umsatz-box-value {
  font-size: 0.95rem;
  font-weight: bold;
  color: black;
  text-align: right;
}
.umsatz-share-bar {
  margin-top: 16px;
  height: 18px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #b41821;
  display: flex;
}

.share-segment {
  height: 100%;
}

.share-stationaer { background: #b41821; }
.share-pluscard   { background: #d9483b; }
.share-ra         { background: #f0803c; }
.share-online     { background: #f6b65b; }


#map-control-panel {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 25%;
  height: 12%; /* WK-Modus */
  background: #f7f7f7;
  border-left: 2px solid #b41821;
  border-top: 2px solid #b41821;
  padding: 10px;
  box-sizing: border-box;
  font-family: sans-serif;
  z-index: 99998;
  overflow: hidden;
  transition: height 0.35s ease;
}

#map-control-panel.expanded {
  height: 30%; /* Umsatz-Modus */
}

#map-control-panel::-webkit-scrollbar {
  width: 6px;
}

#map-control-panel::-webkit-scrollbar-thumb {
  background: #b41821;
  border-radius: 4px;
}
#map-control-panel h4 {
  margin: 0 0 6px 0;
  color: #b41821;
  font-size: 0.9rem;
}

#map-control-panel button {
  padding: 6px;
  border: 1px solid #b41821;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #b41821;
}

#map-control-panel button:hover {
  background: #fff3f3;
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
  z-index: 10;
  transition: transform 0.35s ease;
}

/* --------------------------------------------- */
/* NL-TABELLE (UNTERE TABELLE) */
/* --------------------------------------------- */
/* ------------------------------------------------------ */
/* NL-INFO-CONTAINER (fährt von unten hoch und runter)    */
/* ------------------------------------------------------ */

#nl-info-container {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  overflow: hidden;

  /* Startposition: komplett unten */
  transform: translateY(100%);
  opacity: 0;

  transition:
    transform 0.35s ease,
    opacity 0.35s ease;
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
  transform: translateY(-260px);
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



.umsatz-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 10px;
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
/* Gesamter Umschalter */
.mode-selector {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 110px; /* Texte weiter außen */
  padding: 14px 20px;
  margin-top: 16px;
  user-select: none;
  cursor: pointer;

  background: white;
  border: 2px solid #b41821;
  border-radius: 12px;
}

/* Labels */
.mode-left,
.mode-right {
  font-size: 1rem;
  font-weight: 700;
  min-width: 100px;
  text-align: center;
  z-index: 2; /* Punkt überlappt sie nicht */
  pointer-events: none;
}

/* Die Schiene, in der der Punkt fährt */
.mode-track {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90px;              /* Breite der Schiene */
  height: 26px;             /* Höhe der Schiene */
  transform: translate(-50%, -50%);
  border: 2px solid #b41821;
  border-radius: 20px;
  background: white;
  z-index: 1;
}

/* Der Punkt */
.mode-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #b41821;
  transform: translate(-50%, -50%) translateX(-28px); /* Start links */
  transition: transform 0.25s ease;
}

/* Punkt wandert nach rechts */
.mode-selector.hh .mode-dot {
  transform: translate(-50%, -50%) translateX(28px);
}

/* Farben der Labels */
.mode-selector:not(.hh) .mode-left {
  color: #b41821;
}
.mode-selector:not(.hh) .mode-right {
  color: #999;
}

.mode-selector.hh .mode-left {
  color: #999;
}
.mode-selector.hh .mode-right {
  color: #b41821;
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
      <div class="table-wrapper" id="table-container"></div>

      <!-- NL-Tabelle -->
      <div id="nl-info-container"></div>

      <!-- Sticky Streuverlust -->
      <div id="streuverlust-box"></div>

    </div> <!-- END table-container -->

  </div> <!-- END filter-container -->

  <!-- 🗺️ Kartenbereich -->
  <div class="map-container">

    <div id="loading-spinner" class="spinner"></div>

    <!-- Radius-Slider -->
    <div id="radius-slider-container">
      <label>Radius: <span id="radius-value">40</span> km</label>
      <input type="range" id="radius-slider" min="10" max="100" value="40" step="5">
    </div>

    <!-- 🔥 Kartenstil-Button unten rechts -->
    <div id="map-tile-toggle-btn" title="Kartenstil wechseln"></div>

    <!-- Leaflet Map -->
    <div id="map"></div>

    <!-- Legende -->
    <div class="legend" id="legend">...</div>

  </div> <!-- END map-container -->

  <!-- 📌 Popup für Details (70%) -->
  <div id="side-popup"></div>
  <div id="popup-umsatz" class="popup-umsatz hidden">
  <button class="close-btn">×</button>

  <h2 id="popup-umsatz-total"></h2>

  <div class="popup-umsatz-list">
    <div class="popup-row">
      <span>Stationär</span>
      <span id="popup-stationaer"></span>
    </div>
    <div class="popup-row">
      <span>Pluscard</span>
      <span id="popup-pluscard"></span>
    </div>
    <div class="popup-row">
      <span>R&A</span>
      <span id="popup-ra"></span>
    </div>
    <div class="popup-row">
      <span>Onlineshop</span>
      <span id="popup-online"></span>
    </div>
  </div>

  <div class="popup-bar">
    <div id="bar-stationaer" class="bar-segment"></div>
    <div id="bar-pluscard" class="bar-segment"></div>
    <div id="bar-ra" class="bar-segment"></div>
    <div id="bar-online" class="bar-segment"></div>
  </div>
</div>

  <!-- 🎛️ Steuerzentrale für Kartenansichten (30%) -->
<div id="map-control-panel">

  <h4>Kartenansicht</h4>

  <!-- Hauptumschalter -->
  <div class="analysis-switch">
    <button id="btn-wk" class="analysis-btn active">Werbekosten</button>
    <button id="btn-umsatz" class="analysis-btn">Umsatz</button>
  </div>

  <!-- Umsatzanalyse-Bereich -->
  <div id="umsatz-panel" class="hidden">

    <!-- Globaler Switch -->
<div id="umsatz-mode-switch" class="mode-selector">
  <span class="mode-left">Absolut</span>
  <div class="mode-track">
    <div class="mode-dot"></div>
  </div>
  <span class="mode-right">pro Haushalt</span>
</div>




    <!-- 2×2 Grid -->
    <div class="umsatz-grid">
      <div class="map-toggle active" data-cat="stationaer">Stationär</div>
      <div class="map-toggle" data-cat="pluscard">Pluscard</div>
      <div class="map-toggle" data-cat="ra">R&A</div>
      <div class="map-toggle" data-cat="online">Onlineshop</div>
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
        this.umsatzMode = "abs";        // "abs" oder "hh"
        this.activeCategories = new Set(); // stationaer, pluscard, ra, online

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
    const response = await fetch('https://raw.githubusercontent.com/Benne2000/PLZAnalyse/main/PLZ.geojson');
    this._geoData = await response.json();
    this.geoNotes = {};
(this._geoData.features || []).forEach(feature => {
  const plz = feature.properties?.plz?.trim();
  const note = feature.properties?.note?.trim();
  if (plz && note) {
    this.geoNotes[plz] = note;
  }
});

    const filteredData = this.getFilteredData(); // baut filteredKennwerte
    const plzWerte = this.extractPLZWerte(filteredData);

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
}
,

onEachFeature: (feature, layer) => {
  layer.on("click", (e) => {

    // PLZ IMMER normalisieren
    const plz = String(e.target.feature.properties.plz).padStart(5, "0");

    // Highlight
    this.highlightMapArea(plz);
    this.highlightTableRowByPLZ(plz);

    // Popups referenzieren
    const wkPopup = this._shadowRoot.getElementById("side-popup");
    const umsatzPopup = this._shadowRoot.getElementById("popup-umsatz");

    // Immer beide schließen
    wkPopup.classList.remove("show");
    umsatzPopup.classList.add("hidden");

    // Umsatz-Modus
    if (this.currentMapMode === "umsatz-multi") {
      const values = this.filteredPLZWerte?.[plz];

      if (!values) {
        console.warn("❌ Keine Umsatzwerte für PLZ", plz);
        return;
      }

      this.showUmsatzPopup(plz, values);
      return;
    }

    // WK-Modus
    const kennwerte = this.filteredKennwerte?.[plz];
    this.showPopup(e.target.feature, kennwerte);
  });
}




    });

this._geoLayer.addTo(this.map);

// 🔥 Radius-Filter direkt nach dem Laden anwenden
const radius = Number(this._shadowRoot.getElementById("radius-slider").value);
this.applyRadiusFilter(radius);

// 📍 Automatisch auf die volle Ausdehnung zoomen
const bounds = this._geoLayer.getBounds();
console.log("Geojson einrahmen");
this.map.fitBounds(bounds, {
  padding: [20, 20],
  maxZoom: 14
});


  } catch (error) {
    console.error("❌ Fehler beim Laden der GeoJSON:", error);
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

   
// openPopupFromTable(plz)
openPopupFromTable(plz) {
  if (!this._geoLayer) return;

  let targetFeature = null;

  this._geoLayer.eachLayer(layer => {
    if (layer.feature?.properties?.plz === plz) {
      targetFeature = layer.feature;
    }
  });

  if (!targetFeature) return;

  const daten = this.filteredKennwerte?.[plz] || {};
  this.showPopup(targetFeature, daten);
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
  const mapContainer = this._shadowRoot.getElementById("map");
  this.map = L.map(mapContainer).setView([49.4, 8.7], 7);

  // Basiszustände
  this.currentMapMode = "wk";
  this.umsatzMode = "abs";
  this.activeCategories = new Set(["stationaer"]);

  // LayerGroups sicher anlegen
  this.filteredGroup = L.layerGroup().addTo(this.map);
  this.neighbourGroup = L.layerGroup().addTo(this.map);
  this.radiusGroup = L.layerGroup().addTo(this.map);

  // Rendering starten
  this.render();
  this.initRadiusSlider();

  // ⭐ Kartenstil-Button
  const tileBtn = this._shadowRoot.getElementById("map-tile-toggle-btn");
  if (tileBtn) {
    tileBtn.addEventListener("click", () => this.toggleMapTiles());
  }

  // ⭐ Steuerpanel (für Animation)
  const panel = this._shadowRoot.getElementById("map-control-panel");

  // ⭐ Umschalter WK ↔ Umsatz
  const btnWK = this._shadowRoot.getElementById("btn-wk");
  const btnUmsatz = this._shadowRoot.getElementById("btn-umsatz");
  const umsatzPanel = this._shadowRoot.getElementById("umsatz-panel");

  btnWK.addEventListener("click", () => {
    btnWK.classList.add("active");
    btnUmsatz.classList.remove("active");
    umsatzPanel.classList.add("hidden");

    panel.classList.remove("expanded"); // Panel klein

    this.currentMapMode = "wk";
    this.updateGeoLayer();
  });

btnUmsatz.addEventListener("click", () => {
  btnUmsatz.classList.add("active");
  btnWK.classList.remove("active");
  umsatzPanel.classList.remove("hidden");

  panel.classList.add("expanded");

  this.currentMapMode = "umsatz-multi";

  // ⭐ NEU: Umsatzwerte sicherstellen
  this.prepareUmsatzPLZWerte();

  this.updateGeoLayer();
});


  // ⭐ Neutraler Haushalte/Absolut-Switch
const modeSwitch = this._shadowRoot.getElementById("umsatz-mode-switch");

// Standardzustand: Absolut
this.umsatzMode = "abs";

modeSwitch.addEventListener("click", () => {
  const isHH = modeSwitch.classList.toggle("hh");

  this.umsatzMode = isHH ? "hh" : "abs";

  this.updateGeoLayer();
});


  // ⭐ Umsatzkategorien (2×2 Grid)
  this._shadowRoot.querySelectorAll(".map-toggle").forEach(toggle => {
    toggle.addEventListener("click", () => {
      const cat = toggle.dataset.cat;

      if (this.activeCategories.has(cat)) {
        this.activeCategories.delete(cat);
        toggle.classList.remove("active");
      } else {
        this.activeCategories.add(cat);
        toggle.classList.add("active");
      }

      this.currentMapMode = "umsatz-multi";
      this.updateGeoLayer();
    });
  });
}



getDynamicHeatColor(value, max) {
  value = Number(value);
  max = Number(max);

  // ❗ Wenn kein Wert vorhanden → Standardgrau
  if (!Number.isFinite(value) || value <= 0 || !Number.isFinite(max) || max <= 0) {
    return "#cfd4da";
  }

  const ratio = value / max;

  if (ratio > 0.9) return "#b41821";
  if (ratio > 0.7) return "#d9483b";
  if (ratio > 0.5) return "#f0803c";
  if (ratio > 0.3) return "#f6b65b";
  return "#ffe89c";
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

  // 3️⃣ Radius erneut anwenden
  const radius = Number(this._shadowRoot.getElementById("radius-slider").value);
  this.currentRadius = radius;
  this.applyRadiusFilter(radius);
  this.prepareUmsatzPLZWerte();

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
showUmsatzPopup(plz, values) {
  const popup = this._shadowRoot.getElementById("popup-umsatz");

  const modeHH = this.umsatzMode === "hh";

  const stationaer = modeHH ? values.umsatzProHaushalt : values.umsatz;
  const pluscard   = modeHH ? values.pluscardProHaushalt : values.pluscard;
  const ra         = modeHH ? values.raProHaushalt : values.ra;
  const online     = modeHH ? values.onlineshopProHaushalt : values.onlineshop;

  const total = stationaer + pluscard + ra + online;

  const fmt = x => modeHH ? x.toFixed(3) : x.toLocaleString("de-DE");

  const note = this.geoNotes?.[plz] || "Keine Notiz";

  const pct = x => total > 0 ? (x / total) * 100 : 0;

  popup.innerHTML = `
    <button class="close-btn">×</button>

    <table>
      <thead>
        <tr>
          <th colspan="2" class="title-cell">${plz} – ${note}</th>
        </tr>

        <tr>
          <th colspan="2" class="subtitle-cell">
            Gesamtumsatz: ${modeHH ? total.toFixed(3) + " pro HH" : total.toLocaleString("de-DE") + " €"}
          </th>
        </tr>
      </thead>
    </table>

    <div class="umsatz-grid">
      <div class="umsatz-box">
        <div class="umsatz-box-title">Stationär</div>
        <div class="umsatz-box-value">${fmt(stationaer)}</div>
      </div>

      <div class="umsatz-box">
        <div class="umsatz-box-title">Pluscard</div>
        <div class="umsatz-box-value">${fmt(pluscard)}</div>
      </div>

      <div class="umsatz-box">
        <div class="umsatz-box-title">R&A</div>
        <div class="umsatz-box-value">${fmt(ra)}</div>
      </div>

      <div class="umsatz-box">
        <div class="umsatz-box-title">Onlineshop</div>
        <div class="umsatz-box-value">${fmt(online)}</div>
      </div>
    </div>

    <div class="umsatz-share-bar">
      <div class="share-segment share-stationaer" style="width:${pct(stationaer)}%"></div>
      <div class="share-segment share-pluscard"   style="width:${pct(pluscard)}%"></div>
      <div class="share-segment share-ra"         style="width:${pct(ra)}%"></div>
      <div class="share-segment share-online"     style="width:${pct(online)}%"></div>
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




showPopup(feature) {
  const plz = String(feature.properties?.plz ?? "")
    .padStart(5, "0")
    .trim();

  const note = feature.properties?.note || "Keine Notiz";

  // 🔥 Daten der aktiven Erhebung holen
  const daten = this.filteredKennwerte?.[plz];

  if (!daten) {
    console.warn(`❌ Keine Erhebungsdaten für PLZ ${plz}`);
  }

  // 🔥 Symbol bestimmen (kritisch > HZ > normal)
  let symbol = "🔴";
  if (daten?.isCritical) {
    symbol = "⚠️";
  } else if (daten?.isHZ) {
    symbol = "🟢";
  }

  // Beschriftungen für Haupttabelle
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

  // Beschriftungen für Zusatzwerte
  const beschreibungenSide = {
    value_wk_potentiell_0: "WK in %",
    value_hz_potentiell_0: "HZ-Werbekosten"
  };

  // 🔥 Haupttabelle aufbauen
  let rows = "";

  Object.entries(beschreibungen).forEach(([id, label], index) => {
    const rawValue = daten?.[id]?.raw;
    const wert = typeof rawValue === "number"
      ? rawValue.toLocaleString("de-DE")
      : "–";

    // Abschnittstrenner
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

  // 🔥 Popup-Container holen
  const sidePopup = this._shadowRoot.getElementById('side-popup');

  // 🔥 Popup-Hauptinhalt setzen (inkl. Symbol + PLZ + Note)
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

  // 🔥 Zusatzwerte nur bei Nicht-HZ + Umsatz > 0
  const isHZ = daten?.isHZ === false;
  const umsatz = daten?.value_hr_n_umsatz_0?.raw;

  if (isHZ && typeof umsatz === "number" && umsatz > 0) {
    const wkPotentiellRaw = daten.value_wk_potentiell_0?.raw;
    const hzPotentiellRaw = daten.value_hz_potentiell_0?.raw;

    const wkPotentiell = typeof wkPotentiellRaw === "number"
      ? wkPotentiellRaw.toLocaleString("de-DE")
      : "–";

    const hzPotentiell = typeof hzPotentiellRaw === "number"
      ? hzPotentiellRaw.toLocaleString("de-DE")
      : "–";

    const extraTable = `
      <table class="extra-table">
        <thead>
          <tr><th colspan="2">Potentielle Bestreuung (100% HH-Abdeckung)</th></tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-cell">${beschreibungenSide.value_wk_potentiell_0}</td>
            <td class="value-cell">${wkPotentiell}</td>
          </tr>
          <tr>
            <td class="label-cell">${beschreibungenSide.value_hz_potentiell_0}</td>
            <td class="value-cell">${hzPotentiell}</td>
          </tr>
        </tbody>
      </table>
    `;
    sidePopup.insertAdjacentHTML('beforeend', extraTable);
  }

  // Animation triggern
  void sidePopup.offsetWidth;
  setTimeout(() => sidePopup.classList.add('show'), 10);

  // Close-Button
  const closeBtn = sidePopup.querySelector('.close-btn');
  closeBtn.addEventListener('click', () => {
    sidePopup.classList.remove('show');
  });
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

  // 🧹 Wenn NL-Tabelle offen ist → schließen
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

  // 1️⃣ Daten filtern (Erhebung)
  const filteredData = this.getFilteredData();
  this.filteredData = filteredData;

  // ⭐ 2️⃣ Umsatzwerte pro PLZ vorbereiten (NEU!)
  this.prepareUmsatzPLZWerte();

  // 3️⃣ HZ-Flags neu berechnen (nur WK)
  this.hzFlags = {};
  filteredData.forEach(row => {
    const plz = row["dimension_plz_0"]?.id?.trim();
    const hz = row["dimension_hzflag_0"]?.id?.trim();
    if (plz) this.hzFlags[plz] = hz === "X";
  });

  // 4️⃣ PLZ-Liste extrahieren
  this.filteredPLZs = filteredData
    .map(row => row["dimension_plz_0"]?.id?.trim())
    .filter(plz => plz && plz !== "@NullMember");

  // 5️⃣ Karte einfärben
  this.updateGeoLayer();

  // 6️⃣ NL-Marker aktualisieren
  this.updateMarkers();

  // 7️⃣ Radius anwenden (nur WK)
  const radius = Number(this._shadowRoot.getElementById("radius-slider").value);
  this.currentRadius = radius;
  this.applyRadiusFilter(radius);

  // 8️⃣ Tabelle rendern
  this.renderDataTable(this.filteredKennwerte);

  // 9️⃣ Zoom
  this.zoomToFilteredPLZ();

  // 🔟 Erhebungsinfo
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
  console.log("➡️ Modus:", this.currentMapMode, "| Haushaltmodus:", this.umsatzMode);

  const plzWerte = this.filteredPLZWerte || {};
  const hasRadius = this.plzImRadius instanceof Set && this.plzImRadius.size > 0;

  const safe = x => Number.isFinite(x) ? x : 0;

  // ---------------------------------------------------------
  // 1️⃣ MAX-WERT GLOBAL BERECHNEN
  // ---------------------------------------------------------
  let maxValue = 0;

  if (this.currentMapMode === "wk") {
    Object.values(plzWerte).forEach(v => {
      const val = safe(v.hz ? v.wk : v.wkPot);
      maxValue = Math.max(maxValue, val);
    });
  }

  if (this.currentMapMode === "umsatz-multi") {
    Object.values(plzWerte).forEach(v => {
      let sum = 0;

      if (this.activeCategories.has("stationaer"))
        sum += safe(this.umsatzMode === "hh" ? v.umsatzProHaushalt : v.umsatz);

      if (this.activeCategories.has("pluscard"))
        sum += safe(this.umsatzMode === "hh" ? v.pluscardProHaushalt : v.pluscard);

      if (this.activeCategories.has("ra"))
        sum += safe(this.umsatzMode === "hh" ? v.raProHaushalt : v.ra);

      if (this.activeCategories.has("online"))
        sum += safe(this.umsatzMode === "hh" ? v.onlineshopProHaushalt : v.onlineshop);

      maxValue = Math.max(maxValue, sum);
    });
  }

  console.log("➡️ maxValue:", maxValue);
  console.groupEnd();

  // ---------------------------------------------------------
  // 2️⃣ LAYER FÄRBEN (Radiusfilter NUR HIER anwenden)
  // ---------------------------------------------------------
  this._geoLayer.eachLayer(layer => {
    const plz = String(layer.feature?.properties?.plz ?? "").padStart(5, "0");
    const v = plzWerte[plz];
    const inRadius = !hasRadius || this.plzImRadius.has(plz);

    if (!v || !inRadius) {
      layer.setStyle({
        fillColor: "#cfd4da",
        fillOpacity: 0.45,
        color: "#ffffff",
        weight: 1
      });
      return;
    }

    let value = 0;
    let fillColor = "#cccccc";

    if (this.currentMapMode === "wk") {
      value = safe(v.hz ? v.wk : v.wkPot);
      fillColor = this.getColor(value, v.hz);
    }

    if (this.currentMapMode === "umsatz-multi") {
      let sum = 0;

      if (this.activeCategories.has("stationaer"))
        sum += safe(this.umsatzMode === "hh" ? v.umsatzProHaushalt : v.umsatz);

      if (this.activeCategories.has("pluscard"))
        sum += safe(this.umsatzMode === "hh" ? v.pluscardProHaushalt : v.pluscard);

      if (this.activeCategories.has("ra"))
        sum += safe(this.umsatzMode === "hh" ? v.raProHaushalt : v.ra);

      if (this.activeCategories.has("online"))
        sum += safe(this.umsatzMode === "hh" ? v.onlineshopProHaushalt : v.onlineshop);

      value = safe(sum);
      fillColor = this.getDynamicHeatColor(value, maxValue);
    }

    layer.setStyle({
      fillColor,
      fillOpacity: 0.7,
      color: "#ffffff",
      weight: 1
    });
  });
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
        this.applyFilter(selectedID, selectedJahr, selectedNummer);
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
    { label: 'Jahresumsatz', width: '60px', class: 'nl-col-jahr' },
    { label: 'Erfasst (Zeitraum)', width: '45px', class: 'nl-col-erf' },
    { label: '%', width: '25px', class: 'nl-col-pct1' },
    { label: 'Davon Valide', width: '50px', class: 'nl-col-val' },
    { label: '%', width: '25px', class: 'nl-col-pct2' },
    { label: 'Abdeckung', width: '50px', class: 'nl-col-abd' }
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
  (info.pct_valid * 100).toFixed(1) + "%",
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

  const safe = x => {
    const n = Number(x);
    return Number.isFinite(n) ? n : 0;
  };

  // NEU: Immer frisches Objekt erzeugen
  const plzWerte = {};

  // Nur Zeilen der aktiven Erhebung
  const rows = raw.filter(row =>
    row["dimension_erhebung_0"]?.id == erhID &&
    row["dimension_jahr_0"]?.id == jahr &&
    row["dimension_erhebungsnummer_0"]?.id == nummer
  );

  rows.forEach(row => {
    const rawPLZ = row["dimension_plz_0"]?.id ?? row["dimension_plz_0"]?.raw;
    const plz = String(rawPLZ).padStart(5, "0");

    if (!plzWerte[plz]) {
      plzWerte[plz] = {
        haushalte: 0,

        umsatz: 0,
        ra: 0,
        onlineshop: 0,
        pluscard: 0,

        umsatzProHaushalt: 0,
        raProHaushalt: 0,
        onlineshopProHaushalt: 0,
        pluscardProHaushalt: 0
      };
    }

    const v = plzWerte[plz];

    // Haushalte
    const hh = safe(row["value_haushalte_0"]?.raw);
    v.haushalte += hh;

    // Umsatzarten
    v.umsatz     += safe(row["value_hr_n_umsatz_0"]?.raw);
    v.ra         += safe(row["value_umsatz_ra_0"]?.raw);
    v.onlineshop += safe(row["value_umsatz_online_0"]?.raw);
    v.pluscard   += safe(row["value_umsatz_grosskunden_0"]?.raw);

    // Pro-Haushalt
    if (v.haushalte > 0) {
      v.umsatzProHaushalt     = v.umsatz     / v.haushalte;
      v.raProHaushalt         = v.ra         / v.haushalte;
      v.onlineshopProHaushalt = v.onlineshop / v.haushalte;
      v.pluscardProHaushalt   = v.pluscard   / v.haushalte;
    }
  });

  this.filteredPLZWerte = plzWerte;

  console.log("🧪 prepareUmsatzPLZWerte() → PLZs:", Object.keys(plzWerte).length);
  console.log("🧪 Beispiel:", Object.entries(plzWerte).slice(0, 5));
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

  this.streuverlust = null;

  console.log("🎚 applyRadiusFilter():", radiusKm);

  const plzImRadius = new Set();

  this._geoLayer.eachLayer(layer => {
    const plz = String(layer.feature?.properties?.plz ?? "")
      .padStart(5, "0")
      .trim();

    if (!plz) return;

    const center = this.getPolygonCenter(layer);

    const minDist = Math.min(
      ...this.nlMarkers.map(nl =>
        this.getDistanceKm(center.lat, center.lng, nl.lat, nl.lng)
      )
    );

    if (minDist <= radiusKm) {
      plzImRadius.add(plz);
    }
  });

  this.plzImRadius = plzImRadius;

  // 🔥 Radius-Kennzahlen neu berechnen (inkl. Streuverlust)
  this.getFilteredDataWithRadius();

  // 🔥 Karte neu einfärben
  this.updateGeoLayer();

  // 🔥 Tabelle neu rendern
  this.renderDataTable(this.filteredKennwerte);
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
          kaufkraft: []
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
    entry.sum.potHzAbs += row["value_hz_potentiell_0"]?.raw ?? 0;

    const wv2 = row["value_werbeverweigerer_0"]?.raw;
    if (typeof wv2 === "number") entry.avgArrays.werbeverweigerer.push(wv2);

    const hh2 = row["value_haushalte_0"]?.raw;
    if (typeof hh2 === "number") entry.avgArrays.haushalte.push(hh2);

    const kk2 = row["value_kaufkraft_0"]?.raw;
    if (typeof kk2 === "number") entry.avgArrays.kaufkraft.push(kk2);
  });

  // 5️⃣ Aggregation
  const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  this.filteredKennwerte = {};
  this.filteredPLZWerte = {};

  Object.entries(aggregated).forEach(([plz, entry]) => {
    const sum = entry.sum;
    const avgArr = entry.avgArrays;

    const avgWerbeverweigerer = avg(avgArr.werbeverweigerer);
    const avgHaushalte = avg(avgArr.haushalte);
    const avgKaufkraft = avg(avgArr.kaufkraft);

    const umsatzNetto = sum.umsatzNetto;
    const hzKosten = sum.hzKosten;

    // WK normal (gefiltert)
    const wkPercent = umsatzNetto > 0
      ? Number(((hzKosten / umsatzNetto) * 100).toFixed(1))
      : 0;

    // WK inkl. Nachbarn (ungefilterter Umsatz)
    const unfilteredUmsatz = unfilteredUmsatzByPLZ[plz] ?? 0;
    const wkNachbarn = unfilteredUmsatz > 0
      ? Number(((hzKosten / unfilteredUmsatz) * 100).toFixed(1))
      : 0;

    const bon = sum.kdErhebung > 0
      ? Number((sum.umsatzErhebung / sum.kdErhebung).toFixed(2))
      : 0;

    const potHzPercent = umsatzNetto > 0
      ? Number(((sum.potHzAbs / umsatzNetto) * 100).toFixed(1))
      : 0;

    const isHZ = entry.hzCount > 0;
    const isCritical = entry.hzCount > 1;

    this.filteredKennwerte[plz] = {
      isHZ,
      isCritical,
      value_hr_n_umsatz_0: { raw: umsatzNetto },
      value_umsatz_p_hh_0: { raw: avgHaushalte > 0 ? Number((umsatzNetto / avgHaushalte).toFixed(2)) : 0 },
      value_wk_in_percent_0: { raw: wkPercent },
      value_wk_nachbar_0: { raw: wkNachbarn },   // ✔ NEU
      value_hz_kosten_0: { raw: hzKosten },
      value_werbeverweigerer_0: { raw: avgWerbeverweigerer },
      value_haushalte_0: { raw: avgHaushalte },
      value_kaufkraft_0: { raw: avgKaufkraft },
      value_ums_erhebung_0: { raw: sum.umsatzErhebung },
      value_kd_erhebung_0: { raw: sum.kdErhebung },
      value_bon_erhebung_0: { raw: bon },
      value_auflage_0: { raw: sum.auflage },
      value_hz_potentiell_0: { raw: sum.potHzAbs },
      value_wk_potentiell_0: { raw: potHzPercent }
    };

    this.filteredPLZWerte[plz] = {
      wk: wkPercent,
      wkNachbarn: wkNachbarn,   // ✔ NEU
      wkPot: potHzPercent,
      hz: isHZ
    };
  });

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

        this.applyFilter(selectedID, selectedJahr, selectedNummer);
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
