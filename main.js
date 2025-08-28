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
      width: 75%;
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
  width: 25%;
  padding: 10px;
  box-sizing: border-box;
  font-family: sans-serif;
  background: #f9f9f9;
  border-right: 2px solid #b41821;
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


  </style>



<div class="layout">
  <div class="filter-container">
    <label for="erhebung-select">ErhebungsID:</label>
    <select id="erhebung-select"></select>

    <label for="jahr-select">Jahr:</label>
    <select id="jahr-select" disabled></select>

    <label for="nummer-select">Erhebungsnummer:</label>
    <select id="nummer-select" disabled></select>

    <button id="filter-button">Anzeigen</button>
  </div>
  <div class="map-container">
    <div id="loading-spinner" class="spinner"></div> <!-- Spinner hier einfügen -->
    <div id="map"></div>
    <div class="legend" id="legend">
      <strong>Wert (PLZ)</strong><br>
      <i style="background:#08306b"></i> > 10.000<br>
      <i style="background:#2171b5"></i> > 5.000<br>
      <i style="background:#6baed6"></i> > 1.000<br>
      <i style="background:#c6dbef"></i> > 100<br>
      <i style="background:#f7fbff"></i> ≤ 100
    </div>
  </div>

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
    if (!erhID || !jahr || !nummer) return;

    struktur[erhID] = struktur[erhID] || {};
    struktur[erhID][jahr] = struktur[erhID][jahr] || new Set();
    struktur[erhID][jahr].add(nummer);
  });
  return struktur;
}

    
async loadGeoJson() {
  if (this._geoLayer) return; // Layer existiert schon

  try {
    const response = await fetch('https://raw.githubusercontent.com/Benne2000/PLZAnalyse/main/PLZ.geojson');
    this._geoData = await response.json();

    const filteredData = this.getFilteredData();
    const plzWerte = this.extractPLZWerte(filteredData);

    this._geoLayer = L.geoJSON(this._geoData, {
      style: feature => {
        const plz = feature.properties?.plz;
        const value = plzWerte[plz] || 0;
        const isHZ = this.hzFlags[plz] || false;

        return {
          fillColor: this.getColor(value, isHZ),
          weight: 1,
          opacity: 1,
          color: "white",
          fillOpacity: 0.7
        };
      },
onEachFeature: (feature, layer) => {

  layer.on('click', () => this.showPopup(feature));
}

    }).addTo(this.map);
  } catch (error) {
    console.error("❌ Fehler beim Laden der GeoJSON-Daten:", error);
  }
}



    initializeMapBase() {
      const mapContainer = this._shadowRoot.getElementById('map');
      this.map = L.map(mapContainer).setView([49.4, 8.7], 7);

      this.map.on('zoomend', () => this.showNotesOnMap());
      this.map.on('moveend', () => this.showNotesOnMap());

      if (!this._resizeObserver) {
        this._resizeObserver = new ResizeObserver(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        });
        this._resizeObserver.observe(this._shadowRoot.host);
      }

      this.render();
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
  if (this.neighbours === true) {
    this.markerListeExtra.forEach(marker => {
      marker.addTo(this.map);
    });
    this.neighbours = false;
  } else {
    this.markerListeExtra.forEach(marker => {
      this.map.removeLayer(marker);
    });
    this.neighbours = true;
  }
}
createMarkerIcon(nl) {
  const markerHtml = `
    <div style="width:30px;height:30px;background-color:#ed1f34;border-radius:50% 50% 50% 0;box-shadow:-1px 1px 4px rgba(0,0,0,.5);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;color:white;font-family:sans-serif;">
      <div style="transform:rotate(45deg);">${nl}</div>
    </div>
  `;
  return L.divIcon({
    html: markerHtml,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
  });
}

showPopup(feature) {
  const plz = feature.properties?.plz;
  const note = feature.properties?.note || "Keine Notiz";
  const kennwerteArray = this.kennwerte[plz] || Array(12).fill("–"); // 12 = Anzahl der Kennzahlen

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
  Object.keys(beschreibungen).forEach((id, index) => {
    const label = beschreibungen[id];
    const wert = kennwerteArray[index] ?? "–";

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

  // ➕ Zusatztabelle bei Nicht-HZ mit Umsatz
  if (!this.hzFlags[plz] && this.plzWerte[plz] > 0) {
    const wkPotentiell = this.plzKennwerte[plz]?.value_wk_potentiell_0 ?? "–";
    const hzPotentiell = this.plzKennwerte[plz]?.value_hz_potentiell_0 ?? "–";

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

  // 🎬 Popup anzeigen
  void sidePopup.offsetWidth;
  setTimeout(() => sidePopup.classList.add('show'), 10);

  // ❌ Schließen-Button aktivieren
  const closeBtn = sidePopup.querySelector('.close-btn');
  closeBtn.addEventListener('click', () => {
    sidePopup.classList.remove('show');
  });
}


applyFilter(erhID, jahr, nummer) {
  this._activeFilter = { erhID, jahr, nummer };
  this.updateGeoLayer(); // Nur Layer aktualisieren
  this.updateMarkers();  // Marker ggf. neu setzen
}
    extractPLZWerte(data) {
  const plzWerte = {};

  data.forEach(row => {
    const plz = row["dimension_plz_0"]?.id?.trim();
    const value = row["value_hr_n_umsatz_0"]?.raw;

    if (!plz || plz === "@NullMember") return;

    plzWerte[plz] = typeof value === "number" ? value : 0;
  });

  return plzWerte;
}


getFilteredData() {
  if (!this._myDataSource || this._myDataSource.state !== "success") return [];

  const data = this._myDataSource.data;
  const { erhID, jahr, nummer } = this._activeFilter || {};

  return data.filter(row => {
    const id = row["dimension_erhebung_0"]?.id?.trim() || "@NullMember";
    const y = row["dimension_jahr_0"]?.id?.trim() || "@NullMember";
    const num = row["dimension_erhebungsnummer_0"]?.id?.trim() || "@NullMember";

    return (
      (id === erhID || id === "@NullMember") &&
      (y === jahr || y === "@NullMember") &&
      (num === nummer || num === "@NullMember")
    );
  });
}

getColor(value, isHZ) {
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;

  if (isHZ) {
    return safeValue > 10000 ? "#006837" :   // Dunkelgrün
           safeValue > 5000  ? "#78c679" :   // Mittelgrün
           safeValue > 2500  ? "#ffffb2" :   // Gelb
           safeValue > 1000  ? "#fd8d3c" :   // Orange
           safeValue > 100   ? "#e31a1c" :   // Rot
                               "#cfd4da";    // Grau
  } else {
    return safeValue > 10000 ? "#08306b" :   // Dunkelblau
           safeValue > 5000  ? "#2171b5" :   // Mittelblau
           safeValue > 2500  ? "#6baed6" :   // Hellblau
           safeValue > 1000  ? "#c6dbef" :   // Blassblau
           safeValue > 100   ? "#eff3ff" :   // Sehr hell
                               "#cfd4da";    // Grau
  }
}


updateGeoLayer() {
  if (!this._geoLayer) return;

  const filteredData = this.getFilteredData();
  const plzWerte = this.extractPLZWerte(filteredData);

  this._geoLayer.eachLayer(layer => {
    const plz = layer.feature?.properties?.plz;
    const value = plzWerte[plz] || 0;
    const isHZ = this.hzFlags[plz] || false;

    layer.setStyle({
      fillColor: this.getColor(value, isHZ),
      fillOpacity: 0.7
    });

    const note = layer.feature?.properties?.note;
    if (note) {
      layer.setTooltipContent?.(note); // Optional chaining für Sicherheit
    }
  });
}


updateMarkers() {
  const gesetzteNLs = new Set();
  this.markerListeExtra = [];

  Object.keys(this.Niederlassung).forEach(plz => {
    const nl = this.Niederlassung[plz];
    if (!nl || gesetzteNLs.has(nl)) return;

    const koordinaten = this.nlKoordinaten[nl];
    if (!koordinaten) return;

    const lat = parseFloat(koordinaten.lat);
    const lon = parseFloat(koordinaten.lon);

    const icon = this.createMarkerIcon(nl);
    L.marker([lat, lon], { icon }).addTo(this.map);
    gesetzteNLs.add(nl);
  });

  this.extraNLs.forEach(({ nl, lat, lon }) => {
    const icon = this.createMarkerIcon(nl);
    const marker = L.marker([lat, lon], {
      icon,
      title: nl
    });

    this.markerListeExtra.push(marker); // Nur speichern
    gesetzteNLs.add(nl);
  });
}







setupFilterDropdowns() {
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

  // 🧩 ErhebungsIDs einfügen
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

prepareMapData(data) {
  this.plzWerte = {};
  this.hzFlags = {};
  this.Niederlassung = {};
  this.nlKoordinaten = {};
  this.kennwerte = {};
  this.plzKennwerte = {};
  this.extraNLs = [];

  const kennzahlenIDs = [
    "value_hr_n_umsatz_0", "value_umsatz_p_hh_0", "value_wk_in_percent_0",
    "value_wk_nachbar_0", "value_hz_kosten_0", "value_werbeverweigerer_0",
    "value_haushalte_0", "value_kaufkraft_0", "value_ums_erhebung_0",
    "value_kd_erhebung_0", "value_bon_erhebung_0", "value_auflage_0"
  ];

  data.forEach(row => {
    const plz = row["dimension_plz_0"]?.id?.trim();
    const nl = row["dimension_niederlassung_0"]?.id?.trim();
    const lat = row["dimension_Lat_0"]?.id?.trim();
    const lon = row["dimension_lon_0"]?.id?.trim();
    if (!lat || !lon) return;

    if (!plz || plz === "@NullMember") {
      this.extraNLs.push({ nl: nl || "Unbekannt", lat: parseFloat(lat), lon: parseFloat(lon) });
      return;
    }

    this.Niederlassung[plz] = nl;
    this.nlKoordinaten[nl] = this.nlKoordinaten[nl] || { lat, lon };
    this.hzFlags[plz] = row["dimension_hzflag_0"]?.id?.trim() === "X";

    this.kennwerte[plz] = kennzahlenIDs.map(id => {
      const raw = row[id]?.raw;
      return typeof raw === "number" ? raw : "–";
    });

    this.plzKennwerte[plz] = {
      value_hr_n_umsatz_0: row["value_hr_n_umsatz_0"]?.raw || 0,
      value_wk_potentiell_0: row["value_wk_potentiell_0"]?.raw,
      value_hz_potentiell_0: row["value_hz_potentiell_0"]?.raw
    };

    this.plzWerte[plz] = this.plzKennwerte[plz].value_hr_n_umsatz_0;
  });
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
  console.log("🔄 Spinner angezeigt");

  const rawData = this._myDataSource.data;
  console.log("📥 Rohdaten geladen:", rawData);

  this._erhData = this.buildErhebungsStruktur(rawData);
  console.log("🧩 Erhebungsstruktur erstellt");

  this.setupFilterDropdowns();
  console.log("📊 Filter-Dropdowns aktualisiert");

  const filteredData = this._activeFilter ? this.getFilteredData() : rawData;
  console.log("🔍 Daten gefiltert:", filteredData);

  this.prepareMapData(filteredData);
  console.log("📦 Kartendaten vorbereitet");

  await this.loadGeoJson();
  console.log("🌍 GeoJSON geladen");

  this.updateGeoLayer();
  console.log("🗺️ GeoLayer aktualisiert");

  this.updateMarkers();
  console.log("📍 Marker aktualisiert");

  this.hideSpinner();
  console.log("✅ Spinner ausgeblendet – Render abgeschlossen");
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





