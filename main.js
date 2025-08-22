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
  color: #333;
  font-weight: bold;
  padding: 6px;
  text-align: left;
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
  font-weight: bold;
  background-color: #f0f0f0;
  text-align: center;
  padding: 6px;
  font-size: 0.9rem;
}

#side-popup td:last-child {
  font-weight: bold;
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
/* Werte rechtsbündig */
#side-popup .value-cell {
  width: 30%;
  text-align: right;
  font-weight: normal;
}
    /* Beschreibungszelle: 70% Breite */
#side-popup .label-cell {
  width: 70%;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#side-popup .extra-table {
  display: table;
  visibility: visible;
  table-layout: fixed;
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  border: 1px solid #b41821;
  font-size: 0.85rem;
}

#side-popup .extra-table th {
  border: 1px solid #b41821;
  font-size: 0.85rem;
  padding: 4px 8px;
  color: black;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#side-popup .extra-table td {
  border: 1px solid #ccc;
  padding: 6px;
  text-align: left;
}

  </style>

<div class="layout">
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

      const marker = L.circleMarker([49.4067, 8.6585], {
        radius: 6,
        color: "red",
        fillColor: "red",
        fillOpacity: 0.9
      }).addTo(this.map);
      marker.bindPopup("BAUHAUS Heidelberg");
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



    async render() {

      if (!this.map || !this._myDataSource || this._myDataSource.state !== "success") return;

      const data = this._myDataSource.data;
      const plzWerte = {};
      const hzFlags = {};
const kennzahlenIDs = [
  "value_hr_n_umsatz_0",
  "value_umsatz_p_hh_0",
  "value_wk_in_percent_0",
  "value_werbeverweigerer_0",
  "value_haushalte_0",
  "value_kaufkraft_0",
  "value_ums_erhebung_0",
  "value_kd_erhebung_0",
  "value_bon_erhebung_0",
  "value_auflage_0"
];


      
const kennwerte = {};

data.forEach(row => {
  // 👉 Hier einfügen:


  const plz = row["dimension_plz_0"]?.id?.trim();
  const hzFlag = row["dimension_hzflag_0"]?.id?.trim();

  if (plz) {
kennwerte[plz] = kennzahlenIDs.map(id => {
  const raw = row[id]?.raw;
  return typeof raw === "number" ? raw : "–";
});
    
    hzFlags[plz] = hzFlag === "X";
    plzWerte[plz] = row["value_hr_n_umsatz_0"]?.raw || 0;
    console.log("🧪 plzWerte[plz]:", plzWerte[plz]);
console.log("🧪 hzFlags[plz]:", hzFlags[plz]);

    console.log("📍 PLZ:", plz);
console.log("📊 Kennwerte:", kennwerte[plz]);



  }
});


      if (!this._geoData) {
        try {
          const res = await fetch('https://raw.githubusercontent.com/Benne2000/PLZAnalyse/main/PLZ.geojson');
          this._geoData = await res.json();
        } catch (err) {
          console.error("❌ Fehler beim Laden der GeoJSON-Daten:", err);
          return;
        }
      }

const getColor = (value, isHZ) => {
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;

  if (isHZ) {
    return safeValue > 10000 ? "#00441b" :
           safeValue > 5000  ? "#238b45" :
           safeValue > 1000  ? "#66c2a4" :
           safeValue > 100   ? "#ccece6" : "#cfd4da";
  } else {
    return safeValue > 10000 ? "#08306b" :
           safeValue > 5000  ? "#2171b5" :
           safeValue > 1000  ? "#6baed6" :
           safeValue > 100   ? "#c6dbef" : "#cfd4da";
  }
};

      if (this._geoLayer) {
        this.map.removeLayer(this._geoLayer);
      }

this._geoLayer = L.geoJSON(this._geoData, {
  style: feature => {
    const plz = feature.properties?.plz;
    const value = plzWerte[plz] || 0;
    const isHZ = hzFlags[plz] || false;

    return {
      fillColor: getColor(value, isHZ),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  },
onEachFeature: (feature, layer) => {
  layer.on('click', () => {
    const plz = feature.properties.plz;
    const note = feature.properties.note || "Keine Notiz";
    const kennwerteArray = kennwerte[plz] || Array(10).fill("–");

    // Neue Beschreibungen für die Kennzahlen
    const beschreibungen = {
      value_hr_n_umsatz_0: "Netto-Umsatz (Jahr)",
      value_umsatz_p_hh_0: "Umsatz p. HH",
      value_wk_in_percent_0: "Werbekosten (%)",
      value_werbeverweigerer_0: "HZ-Werbekosten",
      value_haushalte_0: "Haushalte)",
      value_kaufkraft_0: "BM-Kaufkraft-Idx",
      value_ums_erhebung_0: "Umsatz",
      value_kd_erhebung_0: "Anzahl Kunden",
      value_bon_erhebung_0: "Ø-Bon",
      value_auflage_0: "Auflage"
    };

let rows = "";

kennwerteArray.forEach((wert, index) => {
  const id = kennzahlenIDs[index];
  const label = beschreibungen[id] || id.replace("value_", "").replace(/_/g, " ").toUpperCase();

  // Nach der 6. Kennzahl eine Titelzeile einfügen
  if (index === 6) {
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
          <tr>
            <th colspan="2" class="title-cell" title="${note}">${note}</th>
          </tr>
          <tr>
            <th colspan="2" class="subtitle-cell">Hochrechnung Jahr</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
// Bedingung: Kein HZ-Flag und Wert vorhanden
console.log("🔍 Prüfung für Extra-Tabelle:", plz, hzFlags[plz], plzWerte[plz]);

if (!hzFlags[plz] && plzWerte[plz] > 0) {
  const extraTable = `
    <table class="extra-table">
      <thead>
        <tr><th colspan="2">Potentielle Bestreuung (100% HH-Abdeckung)</th></tr>
      </thead>
      <tbody>
        <tr><td>PLZ-Wert</td><td>${plzWerte[plz]}</td></tr>
        <tr><td>Status</td><td>Kein HZ</td></tr>
      </tbody>
    </table>
  `;

sidePopup.insertAdjacentHTML('beforeend', extraTable);

}

    // Reflow für Animation
    void sidePopup.offsetWidth;
    setTimeout(() => {
      sidePopup.classList.add('show');
    }, 10);

    // Close-Button aktivieren
    const closeBtn = sidePopup.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
      sidePopup.classList.remove('show');
    });
  });
}


});


      this._geoLayer.addTo(this.map);
      this._geoLayerVisible = true;

      const geoBounds = this._geoLayer.getBounds();
      this.map.fitBounds(geoBounds);
        const mapContainer = document.getElementById('map');
  if (mapContainer && !hasTriggeredClick) {
    hasTriggeredClick = true;

    setTimeout(() => {
      mapContainer.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
    }, 300);
  }
      this.hideSpinner();

    }

    showNotesOnMap() {
      if (!this._geoLayer) return;

      const zoomLevel = this.map.getZoom();
      const bounds = this.map.getBounds();

      this._geoLayer.eachLayer(layer => {
        const note = layer.feature?.properties?.note;
        const center = layer.getBounds?.().getCenter?.();

        if (zoomLevel >= 11 && note && center && bounds.contains(center)) {
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




