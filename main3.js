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

/* ---------------------- MAP ---------------------- */

.map-container {
  width: 70%;
  position: relative;
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

/* ---------------------- POPUP (60%) ---------------------- */

#side-popup {
  width: 100%;
  height: 60%;
  background: white;
  border-left: 2px solid #b41821;
  padding: 10px;
  font-family: sans-serif;
  color: #b41821;
  box-sizing: border-box;
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  overflow-y: auto;
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

#side-popup table {
  width: 100%;
  table-layout: fixed;
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

#side-popup th.subtitle-cell {
  background-color: #f3f3f3;
  color: black;
  font-weight: bold;
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

/* ---------------------- VIEW SELECTOR (40%) ---------------------- */

#view-selector-container {
  width: 100%;
  height: 40%;
  background: white;
  border-left: 2px solid #b41821;
  border-top: 1px solid #ddd;
  padding: 10px;
  box-sizing: border-box;
  font-family: sans-serif;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

/* ---------------------- FILTERBEREICH ---------------------- */

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

/* ---------------------- TABELLE ---------------------- */

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

.table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
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

#streuverlust-box {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 10px;
  border-top: 2px solid #b41821;
  z-index: 10;
}

/* ---------------------- RADIUS SLIDER ---------------------- */

#radius-slider-container {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  z-index: 9999;
  font-size: 14px;
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

<!-- ⬇️ HIER kommt der Toggle‑Button hin -->
<button id="toggle-table-btn"
  style="
    margin-top:10px;
    width:100%;
    padding:8px;
    background:#ffffff;
    color:#b41821;
    border:2px solid #b41821;
    cursor:pointer;
    border-radius:4px;
    font-weight:bold;
  ">
  NL‑Tabelle anzeigen
</button>


    <div class="table-container">
      <div class="table-wrapper" id="table-container">
        <!-- Tabelle + Sticky-Footer werden dynamisch eingefügt -->
      </div>

      <!-- 🔥 Sticky-Footer-Box -->
      <div id="streuverlust-box"></div>
    </div>
  </div> <!-- ✔ korrekt geschlossen -->


  <!-- 🗺️ Kartenbereich -->
  <div class="map-container">
    <div id="loading-spinner" class="spinner"></div>

    <div id="radius-slider-container">
      <label>Radius: <span id="radius-value">40</span> km</label>
      <input type="range" id="radius-slider" min="10" max="100" value="40" step="5">
    </div>

    <div id="map"></div>
    <div class="legend" id="legend">...</div>
  </div>


  <!-- 📌 Popup + View-Selector rechts -->
  <div style="width:25%; display:flex; flex-direction:column;">

    <!-- 🔥 Popup (60% Höhe) -->
    <div id="side-popup" style="height:60%; overflow-y:auto;"></div>

    <!-- 🔥 Immer sichtbarer View-Selector (40% Höhe) -->
    <div id="view-selector-container" style="height:40%;"></div>

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
        this.activeViews = new Set(["werbung"]); 

      }

connectedCallback() {
  if (this._isConnected) return;
  this._isConnected = true;

  // UI5 erstellt bereits ein Shadow‑Root → wir holen es nur ab
  this._shadowRoot = this.shadowRoot;

  // Template nur einfügen, wenn es noch nicht existiert
  if (!this._shadowRoot.querySelector(".layout")) {
    this._shadowRoot.appendChild(template.content.cloneNode(true));
  }

  this.showSpinner();

  // ----------------------------------------
  // 1) Leaflet laden (deine Logik)
  // ----------------------------------------
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

  // ----------------------------------------
  // 2) UI‑Events registrieren
  // ----------------------------------------

  this._shadowRoot.getElementById("filter-button")
    ?.addEventListener("click", () => this.applyFilter());

  this._shadowRoot.getElementById("toggle-table-btn")
    ?.addEventListener("click", () => {
      if (this.tableMode === "plz") {
        this.setTableMode("nl");
      } else {
        this.setTableMode("plz");
      }
    });

  this._shadowRoot.getElementById("radius-slider")
    ?.addEventListener("input", (e) => {
      const km = Number(e.target.value);
      this._shadowRoot.getElementById("radius-value").textContent = km;
      this.applyRadiusFilter(km);
    });

  this._shadowRoot.getElementById("erhebung-select")
    ?.addEventListener("change", () => this.updateJahrDropdown());

  this._shadowRoot.getElementById("jahr-select")
    ?.addEventListener("change", () => this.updateNummerDropdown());

  this._shadowRoot.getElementById("nummer-select")
    ?.addEventListener("change", () => this.updateActiveFilter());

  // ----------------------------------------
  // 3) Datenquelle überwachen
  // ----------------------------------------
  this._dataSourceObserver = setInterval(() => {
    if (this._myDataSource && this._myDataSource.state === "success") {
      clearInterval(this._dataSourceObserver);
      this.render();
    }
  }, 200);
}


  showSpinner() {
    const spinner = this._shadowRoot.getElementById('loading-spinner');
    if (spinner) spinner.classList.remove('hidden');
  }

  hideSpinner() {
    const spinner = this._shadowRoot.getElementById('loading-spinner');
    if (spinner) spinner.classList.add('hidden');
  }
// --- Robuste Getter für Dimensions- und Kennzahlenfelder ---
setTableMode(mode) {
  this.tableMode = mode;

  const btn = this._shadowRoot.getElementById("toggle-table-btn");

  if (mode === "nl") {
    btn.textContent = "PLZ‑Tabelle anzeigen";
    this.buildNlSummary();
    this.renderNlTable();
  } else {
    btn.textContent = "NL‑Tabelle anzeigen";
    this.renderDataTable(this.filteredKennwerte);
  }
}


getDim(row, id) {
  const dim = row[id];
  if (!dim) return null;
  return dim.id?.trim?.() || dim.label?.trim?.() || null;
}

getVal(row, id) {
  const val = row[id];
  if (!val) return null;
  return typeof val.raw === "number" ? val.raw : null;
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

// onEachFeature(feature, layer)
onEachFeature: (feature, layer) => {
  layer.on("click", (e) => {
    const plz = e.target.feature.properties.plz?.toString().trim();
    const kennwerte = this.filteredKennwerte[plz];

    // Gebiet highlighten
    this.highlightMapArea(plz);

    // Popup öffnen
    this.showPopup(e.target.feature, kennwerte);

    // Tabellenzeile highlighten
    this.highlightTableRowByPLZ(plz);
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

getColorForMetric(metric, value) {
  if (value == null || isNaN(value)) return "#cfd4da";

  switch (metric) {
    case "werbung":
      return this.getColor(value, false);

    case "umsatz":
      return value > 50000 ? "#08306b" :
             value > 20000 ? "#2171b5" :
             value > 10000 ? "#6baed6" :
             value > 5000  ? "#bdd7e7" :
                             "#eff3ff";

    case "gross":
      return value > 20000 ? "#4a1486" :
             value > 10000 ? "#6a51a3" :
             value > 5000  ? "#9e9ac8" :
                             "#dadaeb";

    case "ra":
      return value > 20000 ? "#00441b" :
             value > 10000 ? "#006d2c" :
             value > 5000  ? "#31a354" :
                             "#c7e9c0";

    case "online":
      return value > 20000 ? "#7f0000" :
             value > 10000 ? "#b30000" :
             value > 5000  ? "#ef3b2c" :
                             "#fee0d2";

    default:
      return "#cfd4da";
  }
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
    const mapContainer = this._shadowRoot.getElementById('map');
    this.map = L.map(mapContainer).setView([49.4, 8.7], 7);

    // 🧭 Events für Marker-Notizen
    this.map.on('zoomend', () => this.showNotesOnMap());
    this.map.on('moveend', () => this.showNotesOnMap());

    // 🧱 Initialisiere Marker-Gruppen und Marker
    this.filteredGroup = L.layerGroup().addTo(this.map);
    this.neighbourGroup = L.layerGroup();


    // 📐 Resize-Handling
    if (!this._resizeObserver) {
      this._resizeObserver = new ResizeObserver(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      });
      this._resizeObserver.observe(this._shadowRoot.host);
    }

    // 🔄 Starte das Rendering
    this.render();
    
    this.initRadiusSlider();
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
  console.log("📌 createAllMarkers() gestartet");

  // Sicherstellen, dass _selectedNLs existiert
  if (!this._selectedNLs) this._selectedNLs = new Set();

  // Alte Marker entfernen
  this.filteredGroup.clearLayers();
  this.allMarkers = [];
  this.nlMarkers = [];

  if (!this.Niederlassung || typeof this.Niederlassung !== "object") {
    console.warn("⚠️ Niederlassung ist nicht definiert oder kein Objekt:", this.Niederlassung);
    return;
  }

  if (!this.nlKoordinaten || typeof this.nlKoordinaten !== "object") {
    console.warn("⚠️ nlKoordinaten ist nicht definiert oder kein Objekt:", this.nlKoordinaten);
    return;
  }

  const seen = new Set();

  // 🔵 Haupt-Niederlassungen erzeugen
  Object.entries(this.Niederlassung).forEach(([nlKey, nlName]) => {
    const coords = this.nlKoordinaten[nlKey];
    if (!coords) return;

    if (seen.has(nlKey)) return;

    const icon = this.createMarkerIcon(nlName);

    const marker = L.marker([coords.lat, coords.lon], {
      icon,
      title: nlName,
      plzs: [nlKey]
    });

    marker.setZIndexOffset(1000);

    marker.on("click", () => {
      console.log("🟡 NL-Klick:", nlKey);

      if (!this._selectedNLs) this._selectedNLs = new Set();

      if (this._selectedNLs.has(nlKey)) {
        this._selectedNLs.delete(nlKey);
      } else {
        this._selectedNLs.add(nlKey);
      }

      this.applyNLFilter([...this._selectedNLs]);
    });

marker.on("mouseover", () => {
  const nl = marker.options.plzs?.[0];
  const hasNLFilter = this._selectedNLs && this._selectedNLs.size > 0;
  const isSelected = !hasNLFilter || this._selectedNLs.has(nl);

  // Phantom-NL nicht highlighten
  if (!isSelected) return;

  const el = marker.getElement();
  if (el) {
    el.style.filter = "brightness(1.35)";
    el.style.boxShadow = "0 0 10px rgba(0,0,0,0.7)";
  }
});

marker.on("mouseout", () => {
  const nl = marker.options.plzs?.[0];
  const hasNLFilter = this._selectedNLs && this._selectedNLs.size > 0;
  const isSelected = !hasNLFilter || this._selectedNLs.has(nl);

  if (!isSelected) return;

  const el = marker.getElement();
  if (el) {
    el.style.filter = "brightness(1)";
    el.style.boxShadow = "-1px 1px 4px rgba(0,0,0,.5)";
  }
});


    this.allMarkers.push(marker);
    this.filteredGroup.addLayer(marker);

    this.nlMarkers.push({
      lat: coords.lat,
      lng: coords.lon,
      marker
    });

    seen.add(nlKey);
  });

  // 🔵 Extra-Niederlassungen (falls vorhanden)
  if (Array.isArray(this.extraNLs)) {
    this.extraNLs.forEach(({ nl, lat, lon }) => {
      const icon = this.createMarkerIcon(nl);

      const marker = L.marker([lat, lon], {
        icon,
        title: nl,
        plzs: [nl]
      });

      marker.setZIndexOffset(1000);

      marker.on("click", () => {
        console.log("🟡 NL-Klick:", nl);

        if (!this._selectedNLs) this._selectedNLs = new Set();

        if (this._selectedNLs.has(nl)) {
          this._selectedNLs.delete(nl);
        } else {
          this._selectedNLs.add(nl);
        }

        this.applyNLFilter([...this._selectedNLs]);
      });

      this.allMarkers.push(marker);
      this.filteredGroup.addLayer(marker);

      this.nlMarkers.push({
        lat,
        lng: lon,
        marker
      });
    });
  }

  console.log("📌 NL-Marker geladen:", this.nlMarkers.length);
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

  if (plz === "00000") return;

  const daten = this.filteredKennwerte?.[plz] || {};
  const note = feature.properties?.note || "Keine Notiz";

  let symbol = "🔴";
  if (daten.isCritical) symbol = "⚠️";
  else if (daten.isHZ) symbol = "🟢";

  const beschreibungen = {
    value_hr_n_umsatz: "Netto-Umsatz (Jahr)",
    value_umsatz_p_hh: "Umsatz p. HH",
    value_wk_in_percent: "Werbekosten (%)",
    value_wk_nachbar: "WK (%) incl. Nachb.",
    value_hz_kosten: "HZ-Werbekosten",
    value_werbeverweigerer: "Werbeverweigerer (%)",
    value_haushalte: "Haushalte",
    value_kaufkraft: "BM-Kaufkraft-Idx",
    value_ums_erhebung: "Umsatz",
    value_kd_erhebung: "Anzahl Kunden",
    value_bon_erhebung: "Ø-Bon",
    value_auflage: "Auflage"
  };

  let rows = "";
  Object.entries(beschreibungen).forEach(([id, label]) => {
    const raw = daten[id]?.raw;
    const wert = typeof raw === "number"
      ? raw.toLocaleString("de-DE")
      : "–";

    rows += `
      <tr class="kennzahl-row">
        <td class="label-cell">${label}</td>
        <td class="value-cell">${wert}</td>
      </tr>
    `;
  });

  const sidePopup = this._shadowRoot.getElementById("side-popup");

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

  void sidePopup.offsetWidth;
  setTimeout(() => sidePopup.classList.add("show"), 10);

  sidePopup.querySelector(".close-btn").addEventListener("click", () => {
    sidePopup.classList.remove("show");
  });
}


  updateNeighbours(filteredData) {
    const filteredMarkers = filteredData.map(entry => createMarker(entry));
    this.neighbours = computeNeighbours(filteredMarkers);
  }



applyFilter(erhID, jahr, nummer) {
  this._activeFilter = { erhID, jahr, nummer };

  // 🔄 NL-Auswahl zurücksetzen
  if (!this._selectedNLs) {
    this._selectedNLs = new Set();
  } else {
    this._selectedNLs.clear();
  }
  // 1) Daten filtern (Erhebung)
  const filteredData = this.getFilteredData();

  // 🔥 WICHTIG: global merken, damit applyNLFilter() darauf arbeiten kann
  this.filteredData = filteredData;

  // HZ-Flags neu berechnen
  this.hzFlags = {};
  filteredData.forEach(row => {
    const plz = row["dimension_plz_0"]?.id?.trim();
    const hz = row["dimension_hzflag_0"]?.id?.trim(); // X oder leer
    if (plz) {
      this.hzFlags[plz] = hz === "X";
    }
  });

  // 2) PLZ-Liste extrahieren
  this.filteredPLZs = filteredData
    .map(row => row["dimension_plz_0"]?.id?.trim())
    .filter(plz => plz && plz !== "@NullMember");

  // 3) Karte einfärben
  this.updateGeoLayer();

  // 4) NL-Marker filtern
  this.updateMarkers();

  // 5) Radius merken + anwenden
  const radius = Number(this._shadowRoot.getElementById("radius-slider").value);
  this.currentRadius = radius;
  this.applyRadiusFilter(radius);

  // 6) Tabelle nach Radiusfilter
  this.renderDataTable(this.filteredKennwerte);

  // 7) Zoom
  this.zoomToFilteredPLZ();
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
    return [];
  }

  const data = this._myDataSource.data;
  const { erhID, jahr, nummer } = this._activeFilter || {};

  const filtered = data.filter(row => {
    return (
      this.getDim(row, "dimension_erhebung") === erhID &&
      this.getDim(row, "dimension_jahr") === jahr &&
      this.getDim(row, "dimension_erhebungsnummer") === nummer
    );
  });

  this.erhebungData = filtered; // wichtig für NL-Summary

  return filtered;
}
renderNlTable() {
  const container = this._shadowRoot.getElementById("table-container");
  if (!container) return;

  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.style.padding = "10px";
  wrapper.style.fontFamily = "sans-serif";

  wrapper.innerHTML = `
    <h3 style="margin-top:0;color:#b41821;">Erhebungsübersicht</h3>

    <table style="
      width:100%;
      border-collapse:collapse;
      font-size:0.75rem;
      table-layout:fixed;
    ">
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
        ${Object.values(this.nlSummary).map(info => `
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
  `;

  container.appendChild(wrapper);

  // 🔥 NL-Klick → Marker toggeln
  wrapper.querySelectorAll(".nl-row").forEach(row => {
    row.addEventListener("click", () => {
      const nl = row.dataset.nl;

      if (!this._selectedNLs) this._selectedNLs = new Set();

      if (this._selectedNLs.has(nl)) {
        this._selectedNLs.delete(nl);
      } else {
        this._selectedNLs.add(nl);
      }

      this.applyNLFilter([...this._selectedNLs]);
    });
  });
}

setTableMode(mode) {
  this.tableMode = mode;

  if (mode === "nl") {
    this.buildNlSummary();
    this.renderNlTable();
  } else {
    this.renderDataTable(this.filteredKennwerte);
  }
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

  const plzWerte = this.filteredPLZWerte || {};
  const active = this.activeViews;

  this._geoLayer.eachLayer(layer => {
    const plz = String(layer.feature?.properties?.plz ?? "").padStart(5, "0");

    if (plz === "00000") {
      layer.setStyle({
        fillColor: "#cfd4da",
        fillOpacity: 0,
        weight: 0
      });
      layer.options.interactive = false;
      return;
    }

    const data = plzWerte[plz];
    if (!data) {
      layer.setStyle({
        fillColor: "#cfd4da",
        fillOpacity: 0.3,
        weight: 1,
        color: "#ffffff"
      });
      return;
    }

    const colors = [];

    if (active.has("werbung")) colors.push(this.getColorForMetric("werbung", data.wk));
    if (active.has("umsatz")) colors.push(this.getColorForMetric("umsatz", data.umsatz));
    if (active.has("gross")) colors.push(this.getColorForMetric("gross", data.umsatzGross));
    if (active.has("ra")) colors.push(this.getColorForMetric("ra", data.umsatzRA));
    if (active.has("online")) colors.push(this.getColorForMetric("online", data.umsatzOnline));

    const finalColor = colors.length === 1
      ? colors[0]
      : colors[colors.length - 1];

    layer.setStyle({
      fillColor: finalColor,
      fillOpacity: 0.7,
      color: "#ffffff",
      weight: 1
    });
  });
}

updatePersistentViewButtons() {
  const container = this._shadowRoot.getElementById("view-selector-container");
  if (!container) return;

  container.querySelectorAll(".view-btn").forEach(btn => {
    const view = btn.dataset.view;
    const active = this.activeViews.has(view);

    btn.style.background = active ? "#b41821" : "white";
    btn.style.color = active ? "white" : "#b41821";
  });
}



toggleView(view) {
  if (this.activeViews.has(view)) {
    this.activeViews.delete(view);
  } else {
    this.activeViews.add(view);
  }

  this.updateGeoLayer();
}

renderPersistentViewSelector() {
  const container = this._shadowRoot.getElementById("view-selector-container");
  if (!container) return;

  container.innerHTML = `
    <div style="font-weight:bold; margin-bottom:6px; color:#b41821;">
      Ansichten
    </div>

    ${this.renderViewButtonHTML("werbung", "Werbung")}
    ${this.renderViewButtonHTML("umsatz", "Umsatz")}
    ${this.renderViewButtonHTML("gross", "Großkunden")}
    ${this.renderViewButtonHTML("ra", "R&A")}
    ${this.renderViewButtonHTML("online", "Online")}
  `;

  container.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      this.toggleView(view);
      this.updatePersistentViewButtons();
    });
  });

  this.updatePersistentViewButtons();
}

renderViewButtonHTML(view, label) {
  const active = this.activeViews.has(view);
  return `
    <button 
      class="view-btn"
      data-view="${view}"
      style="
        padding:6px 10px;
        border-radius:4px;
        border:1px solid #b41821;
        background:${active ? '#b41821' : 'white'};
        color:${active ? 'white' : '#b41821'};
        cursor:pointer;
        font-size:0.8rem;
        text-align:left;
      "
    >${label}</button>
  `;
}


updateMarkers() {
  this.filteredGroup.clearLayers();

  const filteredData = this.filteredData || [];
  if (!filteredData.length) return;

  const erhNLs = new Set(
    filteredData
      .map(row => row["dimension_niederlassung_0"]?.id?.trim())
      .filter(nl => nl)
  );

  const hasNLFilter = this._selectedNLs && this._selectedNLs.size > 0;

  const activeMarkers = [];

  this.allMarkers.forEach(marker => {
    const nl = marker.options.plzs?.[0];
    const inErhebung = nl && erhNLs.has(nl);

    if (!inErhebung) return;

    this.filteredGroup.addLayer(marker);

    const isSelected = !hasNLFilter || this._selectedNLs.has(nl);

    // 🔥 Icon setzen
    marker.setIcon(this.createMarkerIcon(nl, !isSelected));

    // 🔥 Hover-Effekt für beide Marker-Typen
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

    // 🔥 Z‑Index
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

    // 🏷️ Platzhalter einfügen
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
    "value_hr_n_umsatz",
    "value_umsatz_p_hh",
    "value_wk_in_percent",
    "value_wk_nachbar",
    "value_hz_kosten",
    "value_werbeverweigerer",
    "value_haushalte",
    "value_kaufkraft",
    "value_ums_erhebung",
    "value_kd_erhebung",
    "value_bon_erhebung",
    "value_auflage",
    "value_hz_potentiell"
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
    const plz = this.getDim(row, "dimension_plz");
    const nlKey = this.getDim(row, "dimension_niederlassung");
    const hzFlag = this.getDim(row, "dimension_hzflag") === "X";

    const lat = parseFloat(this.getDim(row, "dimension_Lat"));
    const lon = parseFloat(this.getDim(row, "dimension_lon"));

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
        const raw = this.getVal(row, id);
        this.filteredKennwerte[plz][id] = typeof raw === "number" ? raw : "–";
      });

      this.filteredKennwerte[plz]["note"] = {
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

  // Umsätze pro PLZ (ungefiltert) für WK-Nachbarn
  const unfilteredUmsatzByPLZ = {};
  this.filteredData.forEach(row => {
    const plz = this.getDim(row, "dimension_plz")?.padStart(5, "0");
    const umsatz = this.getVal(row, "value_hr_n_umsatz") || 0;
    if (!plz) return;
    unfilteredUmsatzByPLZ[plz] = (unfilteredUmsatzByPLZ[plz] || 0) + umsatz;
  });

  let totalErhebungUmsatz = 0;
  const streuverlust = { umsatz: 0, anteil: 0 };

  this.filteredData.forEach(row => {
    const plz = this.getDim(row, "dimension_plz")?.padStart(5, "0");
    if (!plz) return;

    const isInRadius = this.plzImRadius.has(plz);

    const umsatzNetto = this.getVal(row, "value_hr_n_umsatz") || 0;
    const hzKosten = this.getVal(row, "value_hz_kosten") || 0;

    const umsatzErhebung = this.getVal(row, "value_ums_erhebung") || 0;
    const kdErhebung = this.getVal(row, "value_kd_erhebung") || 0;
    const auflage = this.getVal(row, "value_auflage") || 0;

    const umsatzGross = this.getVal(row, "value_umsatz_grosskunden") || 0;
    const umsatzRA = this.getVal(row, "value_umsatz_ra") || 0;
    const umsatzOnline = this.getVal(row, "value_umsatz_online") || 0;

    totalErhebungUmsatz += umsatzNetto;

    // Streuverlust (außerhalb Radius)
    if (!isInRadius) {
      streuverlust.umsatz += umsatzNetto;
      return;
    }

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
          umsatzGross: 0,
          umsatzRA: 0,
          umsatzOnline: 0
        }
      };
    }

    const entry = aggregated[plz];

    // HZ-Flag
    const hz = this.getDim(row, "dimension_hzflag") === "X";
    if (hz) entry.hzCount++;

    // Summen
    entry.sum.umsatzNetto += umsatzNetto;
    entry.sum.hzKosten += hzKosten;
    entry.sum.umsatzErhebung += umsatzErhebung;
    entry.sum.kdErhebung += kdErhebung;
    entry.sum.auflage += auflage;

    entry.sum.umsatzGross += umsatzGross;
    entry.sum.umsatzRA += umsatzRA;
    entry.sum.umsatzOnline += umsatzOnline;
  });

  // Ergebnisstrukturen zurücksetzen
  this.filteredPLZWerte = {};

  Object.entries(aggregated).forEach(([plz, entry]) => {
    const sum = entry.sum;

    const wkPercent =
      sum.umsatzNetto > 0
        ? Number(((sum.hzKosten / sum.umsatzNetto) * 100).toFixed(1))
        : 0;

    const unfilteredUmsatz = unfilteredUmsatzByPLZ[plz] || 0;
    const wkNachbarn =
      unfilteredUmsatz > 0
        ? Number(((sum.hzKosten / unfilteredUmsatz) * 100).toFixed(1))
        : 0;

    const potHzPercent =
      sum.umsatzNetto > 0
        ? Number(((sum.hzKosten / sum.umsatzNetto) * 100).toFixed(1))
        : 0;

    const isHZ = entry.hzCount > 0;
    const isCritical = entry.hzCount > 1;

    this.filteredPLZWerte[plz] = {
      hz: isHZ,
      isCritical,
      wk: wkPercent,
      wkNachbarn,
      wkPot: potHzPercent,

      umsatz: sum.umsatzNetto,
      umsatzGross: sum.umsatzGross,
      umsatzRA: sum.umsatzRA,
      umsatzOnline: sum.umsatzOnline
    };
  });

  // Streuverlust berechnen
  this.streuverlust = {
    umsatz: streuverlust.umsatz,
    anteil:
      totalErhebungUmsatz > 0
        ? streuverlust.umsatz / totalErhebungUmsatz
        : 0
  };

  return result;
}



buildNlSummary() {
  this.nlSummary = {};

  const data = this.erhebungData || [];
  if (!Array.isArray(data) || data.length === 0) return;

  const jahresumsatz = {};
  const erfasst_total = {};
  const erfasst_valid = {};

  data.forEach(row => {
    const nl = this.getDim(row, "dimension_niederlassung");
    if (!nl) return;

    const plz = this.getDim(row, "dimension_plz")?.padStart(5, "0") || "";
    const umsatzJahr = this.getVal(row, "value_hr_n_umsatz") || 0;
    const umsatzErhebung = this.getVal(row, "value_ums_erhebung") || 0;

    if (!jahresumsatz[nl]) jahresumsatz[nl] = 0;
    if (!erfasst_total[nl]) erfasst_total[nl] = 0;
    if (!erfasst_valid[nl]) erfasst_valid[nl] = 0;

    // Erfasst (inkl. 00000)
    erfasst_total[nl] += umsatzErhebung;

    // Jahresumsatz (ohne 00000)
    if (plz !== "00000") jahresumsatz[nl] += umsatzJahr;

    // Valide Erhebung (ohne 00000)
    if (plz !== "00000") erfasst_valid[nl] += umsatzErhebung;
  });

  Object.keys(erfasst_total).forEach(nl => {
    const jahr = jahresumsatz[nl] || 0;
    const total = erfasst_total[nl] || 0;
    const valid = erfasst_valid[nl] || 0;

    this.nlSummary[nl] = {
      nl,
      jahresumsatz: jahr,
      erfasst_total: total,
      erfasst_valid: valid,
      pct_erfassung: jahr > 0 ? total / jahr : 0,
      pct_valid: total > 0 ? valid / total : 0,
      pct_hochrechnung: jahr > 0 ? valid / jahr : 0
    };
  });
}


updateJahrDropdown() {
  const erhSelect = this._shadowRoot.getElementById("erhebung-select");
  const jahrSelect = this._shadowRoot.getElementById("jahr-select");

  const erhID = erhSelect.value;
  jahrSelect.innerHTML = "";

  if (!this._erhData[erhID]) return;

  const jahre = Object.keys(this._erhData[erhID]).sort();

  jahre.forEach(j => {
    const opt = document.createElement("option");
    opt.value = j;
    opt.textContent = j;
    jahrSelect.appendChild(opt);
  });

  jahrSelect.disabled = false;
  this.updateNummerDropdown();
}
updateNummerDropdown() {
  const erhSelect = this._shadowRoot.getElementById("erhebung-select");
  const jahrSelect = this._shadowRoot.getElementById("jahr-select");
  const nummerSelect = this._shadowRoot.getElementById("nummer-select");

  const erhID = erhSelect.value;
  const jahr = jahrSelect.value;

  nummerSelect.innerHTML = "";

  if (!this._erhData[erhID] || !this._erhData[erhID][jahr]) return;

  const nummern = Object.keys(this._erhData[erhID][jahr]).sort();

  nummern.forEach(n => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    nummerSelect.appendChild(opt);
  });

  nummerSelect.disabled = false;
  this.updateActiveFilter();
}
updateActiveFilter() {
  const erhID = this._shadowRoot.getElementById("erhebung-select").value;
  const jahr = this._shadowRoot.getElementById("jahr-select").value;
  const nummer = this._shadowRoot.getElementById("nummer-select").value;

  this._activeFilter = { erhID, jahr, nummer };
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
  // 🔒 Voraussetzungen prüfen
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

  // 📦 Daten vorbereiten (NL, PLZ, Kennwerte, Geo-Notes)
  this.prepareMapData(filteredData);

  // 🌍 GeoJSON laden
  await this.loadGeoJson();

  // 🗺️ Karte einfärben (Werbung / Umsatz / etc.)
  this.updateGeoLayer();

  // 📍 Marker erzeugen
  this.createAllMarkers();

  // 📍 Marker filtern (nach NL)
  const filteredPLZs = isFiltered
    ? filteredData
        .map(row => this.getDim(row, "dimension_plz"))
        .filter(plz => plz && plz !== "@NullMember")
    : Object.keys(this.allMarkers);

  this.updateMarkers(filteredPLZs);

  // 📊 Tabelle aktualisieren (PLZ-Tabelle oder NL-Tabelle)
  if (this.tableMode === "nl") {
    this.buildNlSummary();
    this.renderNlTable();
  } else {
    this.renderDataTable(this.filteredKennwerte);
  }

  // 🎛️ View-Selector (immer sichtbar)
  this.renderPersistentViewSelector();

  this.hideSpinner();
  if (!this.tableMode) this.tableMode = "plz";
this.setTableMode(this.tableMode);

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
