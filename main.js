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

  // 🔥 Nur PLZs anzeigen, die im Radius liegen
  if (this.plzImRadius && this.plzImRadius.size > 0) {
    entries = entries.filter(([plz]) => this.plzImRadius.has(plz));
  }

  // Default: beim ersten Laden nach PLZ sortieren
  if (!this._sortState || this._sortState.column == null) {
    entries = entries.sort(([plzA], [plzB]) => plzA.localeCompare(plzB));
  }

  this.renderDataTableFromEntries(entries);
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

  if (!entries || entries.length === 0) {
    container.textContent = 'Keine Daten verfügbar.';
    return;
  }

  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.height = '100%';

  const scrollWrapper = document.createElement('div');
  scrollWrapper.style.flex = '1';
  scrollWrapper.style.overflowY = 'auto';
  scrollWrapper.style.border = '1px solid #b41821';
  scrollWrapper.style.borderRadius = '6px';

  const table = document.createElement('table');
  table.setAttribute('role', 'table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.fontFamily = 'sans-serif';
  table.style.tableLayout = 'fixed';
  table.style.border = '1px solid #b41821';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const headers = [
    { label: 'PLZ', width: '40px' },
    { label: 'Gemeinde', width: '90px' },
    { label: 'HZ', width: '20px' },
    { label: 'Netto-Umsatz\n(Jahr)', width: '50px' },
    { label: 'WK (%)\nincl. Nachb.', width: '50px' }
  ];

  headers.forEach(({ label, width }, i) => {
    const th = document.createElement('th');
    th.innerHTML = `${label} <span class="sort-icon"></span>`;
    th.style.backgroundColor = '#b41821';
    th.style.color = 'white';
    th.style.padding = '8px';
    th.style.textAlign = 'left';
    th.style.position = 'sticky';
    th.style.top = '0';
    th.style.zIndex = '1';
    th.style.whiteSpace = 'pre-line';
    th.style.width = width;
    th.style.borderBottom = '1px solid #b41821';
    th.style.borderRight = '1px solid #b41821';
    th.style.cursor = 'pointer';

    th.addEventListener('click', () => {
      this.sortTableByColumn(i);
    });

    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  const fragment = document.createDocumentFragment();

entries.forEach(([plz, kennwerte]) => {
  const tr = document.createElement('tr');

  // Tabellenzeile klickbar machen
  tr.style.cursor = "pointer";
// Tabellenklick-Handler
tr.addEventListener("click", () => {
  this.highlightMapArea(plz);
  this.openPopupFromTable(plz);
  this.highlightTableRow(tr);
});


  let note = this.geoNotes?.[plz] || "Keine PLZ-Bezeichnung";
  note = note.replace(/^\d{4,5}\s*[-–]?\s*/, "").trim();

  const hzFlag = this.hzFlags[plz] ? '🟢' : '🔴';

  const umsatzRaw = kennwerte["value_hr_n_umsatz_0"];
  const umsatz = typeof umsatzRaw?.raw === "number"
    ? umsatzRaw.raw.toLocaleString('de-DE')
    : umsatzRaw === "–"
      ? '–'
      : 'Keine Angabe';

  const wkRaw = kennwerte["value_wk_nachbar_0"];
  const wk = typeof wkRaw?.raw === "number"
    ? wkRaw.raw.toFixed(1)
    : wkRaw === "–"
      ? '–'
      : 'Keine Angabe';

  const rowValues = [plz, note, hzFlag, umsatz, wk];

  rowValues.forEach((text, i) => {
    const td = document.createElement('td');
    td.textContent = text.replace(/\n/g, ' ');
    td.title = text;
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


// 🔥 WICHTIG: Fragment in das tbody einfügen
tbody.appendChild(fragment);


  tbody.appendChild(fragment);
  table.appendChild(tbody);
  scrollWrapper.appendChild(table);
  container.appendChild(scrollWrapper);

  // Sort-Icons aktualisieren
  if (this._sortState && this._sortState.column != null) {
    this.updateSortIcons(this._sortState.column);
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
  if (!this._geoLayer || !this.filteredKennwerte) return;

  const plzList = Object.keys(this.filteredKennwerte);
  if (plzList.length === 0) return;

  const bounds = L.latLngBounds([]);

  this._geoLayer.eachLayer(layer => {
    const plz = layer.feature?.properties?.plz;
    if (plzList.includes(plz)) {
      bounds.extend(layer.getBounds());
    }
  });

  if (bounds.isValid()) {
    this.map.fitBounds(bounds, {
      padding: [20, 20],
      maxZoom: 13
    });
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
  // Alte Marker entfernen
  this.filteredGroup.clearLayers();
  this.allMarkers = [];

  // 🔥 NL-Marker-Liste für Radius-Filter neu anlegen
  this.nlMarkers = [];

  if (!this.Niederlassung || typeof this.Niederlassung !== "object") {
    console.warn("⚠️ Niederlassung ist nicht definiert oder kein Objekt:", this.Niederlassung);
    return;
  }

  if (!this.nlKoordinaten || typeof this.nlKoordinaten !== "object") {
    console.warn("⚠️ nlKoordinaten ist nicht definiert oder kein Objekt:", this.nlKoordinaten);
    return;
  }

  const seen = new Set(); // verhindert doppelte Marker pro NL

  // 🔵 Haupt-Niederlassungen erzeugen
  Object.entries(this.Niederlassung).forEach(([nlKey, nlName]) => {
    const coords = this.nlKoordinaten[nlKey];
    if (!coords) {
      console.warn("⚠️ Keine Koordinaten für NL:", nlKey, nlName);
      return;
    }

    if (!seen.has(nlKey)) {
      const icon = this.createMarkerIcon(nlName);

      const marker = L.marker([coords.lat, coords.lon], {
        icon,
        title: nlName,
        plzs: [nlKey] // wichtig für Filterung
      });

      // In globale Marker-Liste
      this.allMarkers.push(marker);

      // In gefilterte Gruppe (Standard: alle sichtbar)
      this.filteredGroup.addLayer(marker);

      // NL als verarbeitet markieren
      seen.add(nlKey);

      // 🔥 NL-Marker für Radius-Filter speichern
      this.nlMarkers.push({
        lat: coords.lat,
        lng: coords.lon,
        marker
      });
    }
  });

  // 🔵 Extra-Niederlassungen hinzufügen (falls vorhanden)
  if (Array.isArray(this.extraNLs)) {
    this.extraNLs.forEach(({ nl, lat, lon }) => {
      const icon = this.createMarkerIcon(nl);

      const marker = L.marker([lat, lon], {
        icon,
        title: nl,
        plzs: [nl]
      });

      this.allMarkers.push(marker);
      this.filteredGroup.addLayer(marker);

      // 🔥 Extra-NL ebenfalls für Radius-Filter speichern
      this.nlMarkers.push({
        lat,
        lng: lon,
        marker
      });
    });
  }

  console.log("📌 NL-Marker geladen:", this.nlMarkers.length);
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

  showPopup(feature, daten = {}) {
    const plz = feature.properties?.plz?.trim();
    const note = feature.properties?.note || "Keine Notiz";


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

    const beschreibungenSide = {
      value_wk_potentiell_0: "WK in %",
      value_hz_potentiell_0: "HZ-Werbekosten"
    };

    let rows = "";

    Object.entries(beschreibungen).forEach(([id, label], index) => {
      const rawValue = daten?.[id]?.raw;
      const wert = typeof rawValue === "number"
        ? rawValue.toLocaleString("de-DE")
        : "–";

      if (wert === "–") {
        console.warn(`⚠️ Kennzahl fehlt: ${id} (${label}) für PLZ ${plz}`);
      }

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

    const sidePopup = this._shadowRoot.getElementById('side-popup');
    sidePopup.innerHTML = `
      <button class="close-btn">×</button>
      <table>
        <thead>
          <tr><th colspan="2" class="title-cell" title="${note}">${note}</th></tr>
          <tr><th colspan="2" class="subtitle-cell">Hochrechnung Jahr</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    // Zusatztabelle bei Nicht-HZ mit Umsatz
    const isHZ = this.hzFlags?.[plz] === false;
    const zusatzKennwerte = this.filteredKennwerte?.[plz] || {};
    const umsatz = zusatzKennwerte.value_hr_n_umsatz_0?.raw;




    
    if (isHZ && typeof umsatz === "number" && umsatz > 0) {
      const wkPotentiellRaw = zusatzKennwerte.value_wk_potentiell_0?.raw;
      const hzPotentiellRaw = zusatzKennwerte.value_hz_potentiell_0?.raw;

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

    void sidePopup.offsetWidth;
    setTimeout(() => sidePopup.classList.add('show'), 10);

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
  this._activeFilter = { erhID, jahr, nummer };

  // 1) Daten filtern (Erhebung)
  const filteredData = this.getFilteredData();

  // 2) PLZ-Liste extrahieren
  const filteredPLZs = filteredData
    .map(row => row["dimension_plz_0"]?.id?.trim())
    .filter(plz => plz && plz !== "@NullMember");

  // 3) Karte einfärben
  this.updateGeoLayer();

  // 4) NL-Marker filtern
  this.updateMarkers(filteredPLZs);

  // 5) Radiusfilter anwenden → setzt this.plzImRadius
  const radius = Number(this._shadowRoot.getElementById("radius-slider").value);
  this.applyRadiusFilter(radius);

  // 6) Tabelle NACH Radiusfilter rendern
  this.renderDataTable(this.filteredKennwerte);

  // 7) Zoom auf sichtbare PLZ
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
    console.warn("⛔ getFilteredData: Keine gültige Datenquelle.");
    return [];
  }

  const data = this._myDataSource.data;
  const { erhID, jahr, nummer } = this._activeFilter || {};

  console.group("🔍 Filtervorgang gestartet");
  console.log("➡️ ErhebungsID:", erhID);
  console.log("➡️ Jahr:", jahr);
  console.log("➡️ Nummer:", nummer);

  // 🔥 WICHTIG: beide Strukturen initialisieren
  const filteredKennwerte = {};   // komplette Zeilen → Tabelle & Popup
  const filteredPLZWerte = {};    // extrahierte Werte → Farben

  const filtered = data.filter(row => {
    const id = row["dimension_erhebung_0"]?.id?.trim();
    const y = row["dimension_jahr_0"]?.id?.trim();
    const num = row["dimension_erhebungsnummer_0"]?.id?.trim();
    const plz = row["dimension_plz_0"]?.id?.trim();

    const match = id === erhID && y === jahr && num === nummer;

    if (match && plz && plz !== "@NullMember") {

      // 🔵 1) komplette Datenzeile speichern (Popup + Tabelle)
      filteredKennwerte[plz] = row;

      // 🔵 2) extrahierte Werte für Farben speichern
      filteredPLZWerte[plz] = {
        wk: row["value_wk_in_percent_0"]?.raw ?? 0,
        wkPot: row["value_wk_potentiell_0"]?.raw ?? 0,
        hz: row["dimension_hzflag_0"]?.id?.trim() === "X"
      };

      console.log(
        `✔️ Match: PLZ ${plz} | WK=${filteredPLZWerte[plz].wk} | WKPot=${filteredPLZWerte[plz].wkPot} | HZ=${filteredPLZWerte[plz].hz}`
      );
    }

    return match;
  });

  // 🔥 Beide Strukturen global speichern
  this.filteredKennwerte = filteredKennwerte;
  this.filteredPLZWerte = filteredPLZWerte;

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

  const filteredData = this.getFilteredData();

  // Alle NLs, die im Filter vorkommen
  const filteredNLs = new Set(
    filteredData
      .map(row => row["dimension_niederlassung_0"]?.id?.trim())
      .filter(nl => nl)
  );

  const visibleMarkers = [];

  // Marker durchgehen
  this.allMarkers.forEach(marker => {
    const markerNLs = marker.options.plzs || [];

    // Marker gehört zur Erhebung, wenn mindestens eine NL übereinstimmt
    const belongs = markerNLs.some(nl => filteredNLs.has(nl));

    if (belongs) {
      this.filteredGroup.addLayer(marker);
      visibleMarkers.push(marker);
    }
  });

  // 🔥 NL-Marker für Radius-Filter neu berechnen
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

      applyRadiusFilter(radiusKm) {
  if (!this._geoLayer || !this.nlMarkers || this.nlMarkers.length === 0) return;

  const allowedPLZs = new Set(Object.keys(this.filteredPLZWerte));
  const plzImRadius = new Set();   // 🔥 NEU

  this._geoLayer.eachLayer(layer => {
    const plz = layer.feature?.properties?.plz;
    if (!plz) return;

    // PLZ gehört nicht zur Erhebung → ausblenden
    if (!allowedPLZs.has(plz)) {
      layer.setStyle({ fillColor: "#ffffff", fillOpacity: 0, opacity: 0 });
      layer.options.interactive = false;
      return;
    }

    layer.options.interactive = true;

    // Entfernung berechnen
    const center = this.getPolygonCenter(layer);
    const minDist = Math.min(
      ...this.nlMarkers.map(nl =>
        this.getDistanceKm(center.lat, center.lng, nl.lat, nl.lng)
      )
    );

    if (minDist <= radiusKm) {
      // 🔥 PLZ ist im Radius → merken
      plzImRadius.add(plz);

      const color = this.getColorForPLZ(plz);
      layer.setStyle({ fillColor: color, fillOpacity: 0.7, opacity: 1 });
    } else {
      layer.setStyle({ fillColor: "#cfd4da", fillOpacity: 0.2, opacity: 0.4 });
    }
  });

  // 🔥 global speichern
  this.plzImRadius = plzImRadius;
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
