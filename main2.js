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
        width: 25%;
        background: white;
        border-left: 2px solid #b41821;
        padding: 10px;
        font-family: sans-serif;
        color: #b41821;
        box-sizing: border-box;
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

  .filter-container {
    width: 30%;
    padding: 10px;
    box-sizing: border-box;
    font-family: sans-serif;
    background: f2f4f7;
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

  .table-container {
    margin-top: 1rem;
    padding: 1rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    font-family: sans-serif;
    overflow-x: auto;
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

.table-row-selected {
  background-color: #fff8c4 !important;
}


  .table-container th {
    background-color: #f5f5f5;
    font-weight: 600;
    color: #333;
  }

  .table-container tr:hover {
    background-color: #f0f8ff;
  }
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

      <!-- 📊 Tabelle jetzt innerhalb der Filtermaske -->
      <div class="table-container" id="table-container">
        <!-- Die Tabelle wird hier dynamisch eingefügt -->
      </div>
    </div>

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

    <!-- 📌 Popup für Details -->
    <div id="side-popup"></div>
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
  layer.on("click", () => {
    const plz = String(feature.properties.plz).padStart(5, "0");
    const agg = this.aggregatedPLZ[plz];

    this.highlightMapArea(plz);
    this.openPopupFromTable(plz);
    this.renderDataTableFromEntries([[plz, agg]]);
  });
}






    });

this._geoLayer.addTo(this.map);

// 🔥 Radius-Filter direkt nach dem Laden anwenden
const radius = Number(this._shadowRoot.getElementById("radius-slider").value);

// ❗ Nur anwenden, wenn Karte bereit
if (this._currentCenter) {
  this.applyRadiusFilter(radius);
}


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
  const container = this._shadowRoot.getElementById("table-container");
  if (!container) return;

  container.innerHTML = "";

  // -------------------------
  // 1) Daten in Entry-Format bringen
  // -------------------------
  // Aggregat: { "01234": {umsatz, wk, hz, ...}, ... }
  // Detail:   { "01234": [ {nl, umsatz, wk, hz}, ... ] }

  let entries = [];

  Object.entries(data).forEach(([plz, value]) => {
    const normPLZ = String(plz).padStart(5, "0");

    if (Array.isArray(value)) {
      // DETAILANSICHT (mehrere NL pro PLZ)
      value.forEach(row => {
        entries.push([normPLZ, row]);
      });
    } else {
      // AGGREGAT (eine Zeile pro PLZ)
      entries.push([normPLZ, value]);
    }
  });

  // -------------------------
  // 2) Radiusfilter anwenden (falls aktiv)
  // -------------------------
  if (this.plzImRadius && this.plzImRadius.size > 0) {
    entries = entries.filter(([plz]) => this.plzImRadius.has(plz));
  }

  // -------------------------
  // 3) Sortierung anwenden (falls gesetzt)
  // -------------------------
  if (this.currentSortColumn) {
    const col = this.currentSortColumn;
    const dir = this.currentSortDirection === "asc" ? 1 : -1;

    entries.sort((a, b) => {
      const rowA = a[1];
      const rowB = b[1];

      let valA = rowA[col];
      let valB = rowB[col];

      // numerische Sortierung, wenn möglich
      if (typeof valA === "number" && typeof valB === "number") {
        return (valA - valB) * dir;
      }

      // fallback: string
      return String(valA).localeCompare(String(valB)) * dir;
    });
  }

  // -------------------------
  // 4) Tabelle erzeugen
  // -------------------------
  const table = document.createElement("table");
  table.classList.add("plz-table");

  // Header
  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th data-col="plz">PLZ</th>
      <th data-col="nl">NL</th>
      <th data-col="umsatz">Umsatz</th>
      <th data-col="wk">WK</th>
      <th data-col="hz">HZ</th>
    </tr>
  `;
  table.appendChild(thead);

  // Body
  const tbody = document.createElement("tbody");

  entries.forEach(([plz, row]) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${plz}</td>
      <td>${row.nl ?? "–"}</td>
      <td>${row.umsatz?.toLocaleString("de-DE") ?? "–"}</td>
      <td>${typeof row.wk === "number" ? row.wk.toFixed(1) : "–"}</td>
      <td>${row.hz ? "🟢" : "🔴"}</td>
    `;

    // -------------------------
    // 5) Tabellenklick → Map + Popup
    // -------------------------
    tr.addEventListener("click", () => {
      this.highlightMapArea(plz);

      if (row.nl) {
        this.openPopupFromTable(plz, row.nl);
      } else {
        this.openPopupFromTable(plz);
      }
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}



sortTableByColumn(index) {
  if (!this._sortState) {
    this._sortState = { column: null, direction: "asc" };
  }

  // -------------------------
  // 1) Sortierrichtung bestimmen
  // -------------------------
  if (this._sortState.column === index) {
    // Richtung umdrehen
    this._sortState.direction =
      this._sortState.direction === "asc" ? "desc" : "asc";
  } else {
    // Neue Spalte → Richtung zurücksetzen
    this._sortState.column = index;
    this._sortState.direction = "asc";
  }

  const dir = this._sortState.direction === "asc" ? 1 : -1;

  // -------------------------
  // 2) Datenquelle bestimmen
  // -------------------------
  // Aggregat-Modus → filteredKennwerte = aggregatedPLZ
  // NL-Detail-Modus → filteredKennwerte = detailedPLZ[plz]
  let entries = [];

  Object.entries(this.filteredKennwerte).forEach(([plz, value]) => {
    const normPLZ = String(plz).padStart(5, "0");

    if (Array.isArray(value)) {
      // NL-Detail
      value.forEach(row => entries.push([normPLZ, row]));
    } else {
      // Aggregat
      entries.push([normPLZ, value]);
    }
  });

  // -------------------------
  // 3) Radiusfilter anwenden
  // -------------------------
  if (this.plzImRadius && this.plzImRadius.size > 0) {
    entries = entries.filter(([plz]) => this.plzImRadius.has(plz));
  }

  // -------------------------
  // 4) Sortierung anwenden
  // -------------------------
  entries.sort((a, b) => {
    const rowA = a[1];
    const rowB = b[1];

    let valA;
    let valB;

    switch (index) {
      case 0: // PLZ
        valA = a[0];
        valB = b[0];
        return valA.localeCompare(valB) * dir;

      case 1: // NL
        valA = rowA.nl ?? "";
        valB = rowB.nl ?? "";
        return valA.localeCompare(valB) * dir;

      case 2: // Gemeinde
        valA = this.geoNotes?.[a[0]] ?? "";
        valB = this.geoNotes?.[b[0]] ?? "";
        return valA.localeCompare(valB) * dir;

      case 3: // HZ
        valA = rowA.hz ? 1 : 0;
        valB = rowB.hz ? 1 : 0;
        return (valA - valB) * dir;

      case 4: // Umsatz
        valA = typeof rowA.umsatz === "number" ? rowA.umsatz : -Infinity;
        valB = typeof rowB.umsatz === "number" ? rowB.umsatz : -Infinity;
        return (valA - valB) * dir;

      case 5: // WK
        valA = typeof rowA.wk === "number" ? rowA.wk : -Infinity;
        valB = typeof rowB.wk === "number" ? rowB.wk : -Infinity;
        return (valA - valB) * dir;

      default:
        return 0;
    }
  });

  // -------------------------
  // 5) Tabelle neu rendern
  // -------------------------
  this.renderDataTableFromEntries(entries);

  // -------------------------
  // 6) Sort-Icons aktualisieren
  // -------------------------
  this.updateSortIcons(index);
}
renderDataTableFromEntries(entries) {
  const container = this._shadowRoot.getElementById('table-container');
  container.innerHTML = '';

  // Radiusfilter
  if (this.plzImRadius instanceof Set && this.plzImRadius.size > 0) {
    entries = entries.filter(([plz]) => this.plzImRadius.has(plz));
  }

  if (!entries || entries.length === 0) {
    container.textContent = 'Keine Daten verfügbar.';
    return;
  }

  // Prüfen: Aggregat oder Detail?
  const isDetail = entries.length > 0 && entries[0][1].nl !== undefined;

  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.height = '100%';

  const scrollWrapper = document.createElement('div');
  scrollWrapper.style.flex = '1';
  scrollWrapper.style.overflowY = 'auto';
  scrollWrapper.style.border = '1px solid #b41821';
  scrollWrapper.style.borderRadius = '6px';

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.fontFamily = 'sans-serif';
  table.style.tableLayout = 'fixed';
  table.style.border = '1px solid #b41821';

  // HEADER
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const headers = isDetail
    ? [
        { label: 'PLZ', width: '60px' },
        { label: 'NL', width: '60px' },
        { label: 'Gemeinde', width: '120px' },
        { label: 'HZ', width: '40px' },
        { label: 'Netto-Umsatz', width: '80px' },
        { label: 'WK (%)', width: '60px' }
      ]
    : [
        { label: 'PLZ', width: '60px' },
        { label: 'Gemeinde', width: '120px' },
        { label: 'HZ', width: '40px' },
        { label: 'Netto-Umsatz', width: '80px' },
        { label: 'WK (%)', width: '60px' }
      ];

  headers.forEach(({ label, width }) => {
    const th = document.createElement('th');
    th.textContent = label;
    th.style.backgroundColor = '#b41821';
    th.style.color = 'white';
    th.style.padding = '8px';
    th.style.textAlign = 'left';
    th.style.position = 'sticky';
    th.style.top = '0';
    th.style.zIndex = '1';
    th.style.width = width;
    th.style.borderBottom = '1px solid #b41821';
    th.style.borderRight = '1px solid #b41821';
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // BODY
  const tbody = document.createElement('tbody');
  const fragment = document.createDocumentFragment();

  entries.forEach(([plz, row]) => {
    const tr = document.createElement('tr');
    tr.style.cursor = "pointer";

    tr.addEventListener("click", () => {
      this.highlightMapArea(plz);
      if (isDetail) this.openPopupFromTable(plz, row.nl);
      else this.openPopupFromTable(plz);
      this.highlightTableRow(tr);
    });

    let note = this.geoNotes?.[plz] || "Keine PLZ-Bezeichnung";
    note = note.replace(/^\d{4,5}\s*[-–]?\s*/, "").trim();

    const hzFlag = row.hz ? '🟢' : '🔴';
    const umsatz = typeof row.umsatz === "number" ? row.umsatz.toLocaleString('de-DE') : '–';
    const wk = typeof row.wk === "number" ? row.wk.toFixed(1) : '–';

    const rowValues = isDetail
      ? [plz, row.nl, note, hzFlag, umsatz, wk]
      : [plz, note, hzFlag, umsatz, wk];

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

    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);
  table.appendChild(tbody);
  scrollWrapper.appendChild(table);
  container.appendChild(scrollWrapper);
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
openPopupFromTable(plz, nl = null) {
  if (!this._geoLayer) return;

  const normPLZ = String(plz).padStart(5, "0");

  // 1) GeoJSON-Feature finden
  let targetFeature = null;
  this._geoLayer.eachLayer(layer => {
    const layerPLZ = String(layer.feature?.properties?.plz ?? "").padStart(5, "0");
    if (layerPLZ === normPLZ) {
      targetFeature = layer.feature;
    }
  });

  if (!targetFeature) {
    console.warn("⚠️ Kein GeoJSON-Feature für PLZ:", normPLZ);
    return;
  }

  // 2) Datenquelle bestimmen
  let daten;

  if (nl) {
    // -------------------------
    // NL-DETAILANSICHT
    // -------------------------
    const rows = this.detailedPLZ[normPLZ] || [];
    daten = rows.find(r => r.nl === nl);

    if (!daten) {
      console.warn("⚠️ Keine NL-Daten für Popup:", normPLZ, nl);
      return;
    }
  } else {
    // -------------------------
    // STANDARD: AGGREGIERTE PLZ
    // -------------------------
    daten = this.aggregatedPLZ[normPLZ];

    if (!daten) {
      console.warn("⚠️ Keine aggregierten Daten für Popup:", normPLZ);
      return;
    }
  }

  // 3) Popup anzeigen
  this.showPopup(targetFeature, daten, nl);
}


      
highlightMapArea(plz) {
  if (!this._geoLayer) return;

  const normPLZ = String(plz).padStart(5, "0");

  // -------------------------
  // 1) Vorheriges Highlight entfernen
  // -------------------------
  if (this._lastHighlightedLayer) {
    this._lastHighlightedLayer.setStyle({
      weight: 1,
      color: "#666",
      fillOpacity: 0.4
    });
    this._lastHighlightedLayer = null;
  }

  // -------------------------
  // 2) Layer mit passender PLZ finden
  // -------------------------
  let targetLayer = null;

  this._geoLayer.eachLayer(layer => {
    const layerPLZ = String(layer.feature?.properties?.plz ?? "").padStart(5, "0");
    if (layerPLZ === normPLZ) {
      targetLayer = layer;
    }
  });

  if (!targetLayer) {
    console.warn("⚠️ Kein GeoJSON-Layer für PLZ:", normPLZ);
    return;
  }

  // -------------------------
  // 3) Highlight setzen
  // -------------------------
  targetLayer.setStyle({
    weight: 3,
    color: "#b41821",
    fillOpacity: 0.6
  });

  this._lastHighlightedLayer = targetLayer;

  // -------------------------
  // 4) Karte auf die PLZ zoomen
  // -------------------------
  const bounds = targetLayer.getBounds?.();
  if (bounds && this.map) {
    this.map.fitBounds(bounds, {
      padding: [20, 20],
      maxZoom: 13
    });
  }
}

      
updateSortIcons(activeIndex) {
  const container = this._shadowRoot.getElementById("table-container");
  if (!container) return;

  const table = container.querySelector("table");
  if (!table) return;

  const headers = table.querySelectorAll("th");

  headers.forEach((th, i) => {
    const icon = th.querySelector(".sort-icon");
    if (!icon) return;

    // Reset all icons
    if (i !== activeIndex) {
      icon.textContent = "";
      return;
    }

    // Active column → set icon
    if (this._sortState.direction === "asc") {
      icon.textContent = "▲";
    } else {
      icon.textContent = "▼";
    }
  });
}


zoomToFilteredPLZ() {
  if (!this._geoLayer || !this.map) return;

  let plzList = [];

  // -------------------------
  // 1) Datenquelle bestimmen
  // -------------------------
  // Aggregat-Modus → filteredKennwerte = aggregatedPLZ
  // NL-Detail-Modus → filteredKennwerte = detailedPLZ[plz]
  Object.keys(this.filteredKennwerte).forEach(plz => {
    const norm = String(plz).padStart(5, "0");
    plzList.push(norm);
  });

  // -------------------------
  // 2) Radiusfilter anwenden
  // -------------------------
  if (this.plzImRadius && this.plzImRadius.size > 0) {
    plzList = plzList.filter(plz => this.plzImRadius.has(plz));
  }

  if (plzList.length === 0) {
    console.warn("⚠️ Keine PLZs zum Zoomen gefunden.");
    return;
  }

  // -------------------------
  // 3) Alle passenden GeoJSON-Layer sammeln
  // -------------------------
  const boundsList = [];

  this._geoLayer.eachLayer(layer => {
    const layerPLZ = String(layer.feature?.properties?.plz ?? "").padStart(5, "0");

    if (plzList.includes(layerPLZ)) {
      const b = layer.getBounds?.();
      if (b) boundsList.push(b);
    }
  });

  if (boundsList.length === 0) {
    console.warn("⚠️ Keine GeoJSON-Bounds für die gefilterten PLZs gefunden.");
    return;
  }

  // -------------------------
  // 4) Gesamten Bereich berechnen
  // -------------------------
  let combined = boundsList[0];

  for (let i = 1; i < boundsList.length; i++) {
    combined = combined.extend(boundsList[i]);
  }

  // -------------------------
  // 5) Karte auf Bereich zoomen
  // -------------------------
  this.map.fitBounds(combined, {
    padding: [30, 30],
    maxZoom: 12
  });
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
  if (!this.aggregatedPLZ || Object.keys(this.aggregatedPLZ).length === 0) {
    console.log("⏳ Noch keine Erhebung geladen → keine Marker anzeigen");
    this.filteredGroup.clearLayers();
    this.allMarkers = [];
    this.nlMarkers = [];
    return;
  }

  this.filteredGroup.clearLayers();
  this.allMarkers = [];
  this.nlMarkers = [];

  const seen = new Set();

  Object.entries(this.Niederlassung).forEach(([nlKey, nlName]) => {
    const coords = this.nlKoordinaten[nlKey];
    if (!coords) return;

    if (!seen.has(nlKey)) {
      const icon = this.createMarkerIcon(nlName);

      const marker = L.marker([coords.lat, coords.lon], {
        icon,
        title: nlName,
        nl: nlKey
      });

      marker.on("click", () => {
        this.filterByNL(null, nlKey);
        this.updateMarkers();
        this.zoomToFilteredPLZ();
      });

      this.allMarkers.push(marker);
      this.filteredGroup.addLayer(marker);

      this.nlMarkers.push({
        lat: coords.lat,
        lng: coords.lon,
        marker
      });

      seen.add(nlKey);
    }
  });
}


  createMarkerIcon(nl) {
    if (!this.iconCache) this.iconCache = {};

    if (!this.iconCache[nl]) {
      const markerHtml = `
        <div style="width:30px;height:30px;background-color:#ed1f34;border-radius:50% 50% 50% 0;box-shadow:-1px 1px 4px rgba(0,0,0,.5);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;color:white;font-family:sans-serif;">
          <div style="transform:rotate(45deg);">${nl}</div>
        </div>
      `;

      this.iconCache[nl] = L.divIcon({
        html: markerHtml,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });
    }

    return this.iconCache[nl];
  }
showPopup(feature, daten, nl = null) {
  if (!feature || !daten) return;

  const plz = String(feature.properties?.plz ?? "")
    .padStart(5, "0")
    .trim();

  // Gemeinde-Name
  let note = this.geoNotes?.[plz] || "Keine PLZ-Bezeichnung";
  note = note.replace(/^\d{4,5}\s*[-–]?\s*/, "").trim();

  // Umsatz
  const umsatz = typeof daten.umsatz === "number"
    ? daten.umsatz.toLocaleString("de-DE")
    : "–";

  // WK
  const wk = typeof daten.wk === "number"
    ? daten.wk.toFixed(1)
    : "–";

  // HZ
  const hz = daten.hz ? "🟢 Ja" : "🔴 Nein";

  // NL-Anzeige
  const nlText = nl ? `NL: ${nl}` : "Aggregierte Erhebung";

  // -------------------------
  // Popup-HTML erzeugen
  // -------------------------
  const sidePopup = this._shadowRoot.getElementById("side-popup");

  sidePopup.innerHTML = `
    <button class="close-btn">×</button>

    <table>
      <thead>
        <tr>
          <th colspan="2" class="title-cell" title="${note}">
            PLZ ${plz} – ${note}
          </th>
        </tr>
        <tr>
          <th colspan="2" class="subtitle-cell">${nlText}</th>
        </tr>
      </thead>

      <tbody>
        <tr class="kennzahl-row">
          <td class="label-cell">HZ</td>
          <td class="value-cell">${hz}</td>
        </tr>

        <tr class="kennzahl-row">
          <td class="label-cell">Netto-Umsatz (Jahr)</td>
          <td class="value-cell">${umsatz}</td>
        </tr>

        <tr class="kennzahl-row">
          <td class="label-cell">WK (%) inkl. Nachb.</td>
          <td class="value-cell">${wk}</td>
        </tr>
      </tbody>
    </table>
  `;

  // -------------------------
  // Zusatzwerte (nur Aggregat)
  // -------------------------
  if (!nl) {
    const wkPot = typeof daten.wkPot === "number"
      ? daten.wkPot.toLocaleString("de-DE")
      : "–";

    const hzPot = typeof daten.hzPot === "number"
      ? daten.hzPot.toLocaleString("de-DE")
      : "–";

    const extraTable = `
      <table class="extra-table">
        <thead>
          <tr><th colspan="2">Potentielle Bestreuung (100% HH-Abdeckung)</th></tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-cell">WK in %</td>
            <td class="value-cell">${wkPot}</td>
          </tr>
          <tr>
            <td class="label-cell">HZ-Werbekosten</td>
            <td class="value-cell">${hzPot}</td>
          </tr>
        </tbody>
      </table>
    `;

    sidePopup.insertAdjacentHTML("beforeend", extraTable);
  }

  // -------------------------
  // Popup anzeigen
  // -------------------------
  void sidePopup.offsetWidth;
  setTimeout(() => sidePopup.classList.add("show"), 10);

  // Schließen
  const closeBtn = sidePopup.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    sidePopup.classList.remove("show");
  });
}


  updateNeighbours(filteredData) {
    const filteredMarkers = filteredData.map(entry => createMarker(entry));
    this.neighbours = computeNeighbours(filteredMarkers);
  }
filterByNL(plz, nl) {
  console.log("▶ filterByNL:", plz, nl);

  this._activeNLFilter = nl;

  const entries = [];

  Object.entries(this.detailedPLZ).forEach(([plzKey, rows]) => {
    rows.forEach(r => {
      if (r.nl === nl) {
        entries.push([plzKey, r]);
      }
    });
  });

  this.renderDataTableFromEntries(entries);
}
applyFilter(erhID, jahr, nummer) {
  console.log("▶ applyFilter gestartet", erhID, jahr, nummer);

  // ❗ 1) Initial Load blockieren
  if (this._isInitialLoad) {
    console.log("⏳ Initial Load → applyFilter übersprungen");
    return;
  }

  // ❗ 2) Datenquelle bereit?
  if (!this._myDataSource || this._myDataSource.state !== "success") {
    console.warn("⏳ applyFilter abgebrochen: Datenquelle noch nicht bereit.");
    return;
  }

  // ❗ 3) Filterparameter setzen – aber NICHT überschreiben, wenn undefined
  if (erhID && jahr && nummer) {
    this._activeFilter = { erhID, jahr, nummer };
  }

  const { erhID: fID, jahr: fJahr, nummer: fNum } = this._activeFilter || {};

  if (!fID || !fJahr || !fNum) {
    console.warn("⚠️ applyFilter: Keine gültigen Filterparameter vorhanden → abbrechen");
    return;
  }

  erhID = fID;
  jahr = fJahr;
  nummer = fNum;

  // ❗ 4) Daten filtern
  const data = this._myDataSource.data;
  const filteredData = data.filter(row => {
    const id = row["dimension_erhebung_0"]?.id?.trim();
    const y = row["dimension_jahr_0"]?.id?.trim();
    const num = row["dimension_erhebungsnummer_0"]?.id?.trim();
    return id === erhID && y === jahr && num === nummer;
  });

  if (filteredData.length === 0) {
    console.warn("⚠️ Keine Daten für Erhebung gefunden.");
    this.aggregatedPLZ = {};
    this.detailedPLZ = {};
    this.filteredKennwerte = {};
    this.renderDataTableFromEntries([]);
    this.filteredGroup.clearLayers();
    return;
  }

  // ❗ 5) Aggregation neu aufbauen
  this.aggregatedPLZ = {};
  this.detailedPLZ = {};
  this._activeNLFilter = null;

  filteredData.forEach(row => {
    const plz = String(row["dimension_plz_0"]?.id ?? "").padStart(5, "0");
    const nl  = row["dimension_niederlassung_0"]?.id ?? "UNBEKANNT";

    const umsatz = row["value_hr_n_umsatz_0"]?.raw ?? 0;
    const wk     = row["value_wk_nachbar_0"]?.raw ?? 0;
    const hz     = row["dimension_hzflag_0"]?.id === "X";

    if (!this.detailedPLZ[plz]) this.detailedPLZ[plz] = [];
    this.detailedPLZ[plz].push({ nl, umsatz, wk, hz });

    if (!this.aggregatedPLZ[plz]) {
      this.aggregatedPLZ[plz] = { umsatz: 0, wk: 0, hz: false };
    }

    this.aggregatedPLZ[plz].umsatz += umsatz;
    this.aggregatedPLZ[plz].wk += wk;
    this.aggregatedPLZ[plz].hz = this.aggregatedPLZ[plz].hz || hz;
  });

  this.filteredKennwerte = this.aggregatedPLZ;

  // ❗ 6) Tabelle
  this.renderDataTableFromEntries(Object.entries(this.filteredKennwerte));

  // ❗ 7) Karte
  this.updateGeoLayer();

  // ❗ 8) Marker
  this.createAllMarkers();
  this.updateMarkers();

  // ❗ 9) Radiusfilter
  const radius = Number(this._shadowRoot.getElementById("radius-slider").value);
  this.applyRadiusFilter(radius);

  // ❗ 10) Tabelle nach Radiusfilter
  this.renderDataTableFromEntries(Object.entries(this.filteredKennwerte));

  // ❗ 11) Zoom
  this.zoomToFilteredPLZ();

  console.log("▶ applyFilter abgeschlossen");
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
  if (!this._activeFilter || !this._activeFilter.erhID) {
    console.warn("⏳ getFilteredData abgebrochen: Kein aktiver Filter.");
    return [];
  }

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

  const filtered = data.filter(row => {
    const id = row["dimension_erhebung_0"]?.id?.trim();
    const y = row["dimension_jahr_0"]?.id?.trim();
    const num = row["dimension_erhebungsnummer_0"]?.id?.trim();
    return id === erhID && y === jahr && num === nummer;
  });

  console.log("📦 Gefilterte PLZs:", filtered.map(r => r["dimension_plz_0"]?.id));
  console.groupEnd();

  // ❗ WICHTIG: NICHTS mehr global überschreiben!
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

  // Hole gefilterte Daten
  const filteredData = this.getFilteredData();

  // Extrahiere WK, WKPot und HZ-Flag aus den gefilterten Daten
  const plzWerte = {};
  filteredData.forEach(row => {
    const plz = row["dimension_plz_0"]?.id?.trim();
    if (!plz || plz === "@NullMember") return;

    const wk = row["value_wk_in_percent_0"]?.raw;
    const wkPot = row["value_wk_potentiell_0"]?.raw;
    const hzFlag = row["dimension_hzflag_0"]?.id?.trim() === "X";

    plzWerte[plz] = {
      wk: typeof wk === "number" ? wk : 0,
      wkPot: typeof wkPot === "number" ? wkPot : 0,
      hz: hzFlag
    };
  });

  // Layer aktualisieren
  this._geoLayer.eachLayer(layer => {
    const plz = layer.feature?.properties?.plz?.trim();

    // Werte aus gefilterten Daten holen
    const values = plzWerte[plz] || { wk: 0, wkPot: 0, hz: false };

    // HZ → WK in %, Nicht-HZ → WK potentiell
    const value = values.hz ? values.wk : values.wkPot;

    layer.setStyle({
      fillColor: this.getColor(value, values.hz),
      fillOpacity: 0.5
    });

    // Tooltip aktualisieren (falls vorhanden)
    const note = layer.feature?.properties?.note;
    if (note && layer.setTooltipContent) {
      layer.setTooltipContent(note);
    }
  });
}

updateMarkers() {
  this.filteredGroup.clearLayers();

  // ❗ Keine Erhebung → keine Marker
  if (!this.aggregatedPLZ || Object.keys(this.aggregatedPLZ).length === 0) {
    console.log("⏳ updateMarkers: Keine Erhebung geladen → keine Marker");
    this.nlMarkers = [];
    return;
  }

  // ❗ Kein NL-Filter → alle Marker anzeigen
  if (!this._activeNLFilter) {
    this.allMarkers.forEach(marker => {
      this.filteredGroup.addLayer(marker);
    });

    this.nlMarkers = this.allMarkers.map(marker => ({
      lat: marker.getLatLng().lat,
      lng: marker.getLatLng().lng,
      marker
    }));

    console.log("🔥 Radius-relevante NL-Marker:", this.nlMarkers.length);
    return;
  }

  // ❗ NL-Filter aktiv → nur Marker dieser NL
  const nl = this._activeNLFilter;
  const visibleMarkers = [];

  this.allMarkers.forEach(marker => {
    if (marker.options.nl === nl) {
      this.filteredGroup.addLayer(marker);
      visibleMarkers.push(marker);
    }
  });

  this.nlMarkers = visibleMarkers.map(marker => ({
    lat: marker.getLatLng().lat,
    lng: marker.getLatLng().lng,
    marker
  }));

  console.log("🔥 Radius-relevante NL-Marker:", this.nlMarkers.length);
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

applyRadiusFilter(radius) {
  if (!this._currentCenter) {
    console.warn("⏳ applyRadiusFilter abgebrochen: Kein Kartenmittelpunkt.");
    this.plzImRadius = new Set(); // NICHT löschen!
    return;
  }

  // ❗ Schutz: Keine Kennwerte vorhanden
  if (!this.filteredKennwerte || typeof this.filteredKennwerte !== "object") {
    console.warn("⏳ applyRadiusFilter: Keine Kennwerte vorhanden.");
    this.plzImRadius = new Set();
    return;
  }

  const center = this._currentCenter;
  if (!center) {
    console.warn("⏳ applyRadiusFilter: Kein Kartenmittelpunkt.");
    this.plzImRadius = new Set();
    return;
  }

  const result = new Set();

  Object.keys(this.filteredKennwerte).forEach(plz => {
    const coords = this.plzKoordinaten[plz];
    if (!coords) return;

    const dist = this._distance(center.lat, center.lng, coords.lat, coords.lon);
    if (dist <= radius) result.add(plz);
  });

  this.plzImRadius = result;
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
