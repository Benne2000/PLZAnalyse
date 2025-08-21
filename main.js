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
      width: 80%;
      position: relative;
    }

    #map {
      height: 100%;
      width: 100%;
      background: white;
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
      width: 20%;
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
  </style>

  <div class="layout">
    <div class="map-container">
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

      data.forEach(row => {


const plz = row["dimensions_0"]?.id?.trim();
const hzFlag = row["dimensions_1_0"]?.id?.trim();
const wert = typeof row["measures_0"]?.raw === "number" ? row["measures_0"].raw : 0;


        if (plz) {
          plzWerte[plz] = wert;
          hzFlags[plz] = hzFlag === "X";
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
        if (isHZ) {
          return value > 10000 ? "#00441b" :
                 value > 5000 ? "#238b45" :
                 value > 1000 ? "#66c2a4" :
                 value > 100 ? "#ccece6" : "#cfd4da";
        } else {
          return value > 10000 ? "#08306b" :
                 value > 5000 ? "#2171b5" :
                 value > 1000 ? "#6baed6" :
                 value > 100 ? "#c6dbef" : "#cfd4da";
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
  const value = plzWerte[plz] || "–";
  const hzFlag = hzFlags[plz] ? "Ja" : "Nein";

const sidePopup = this._shadowRoot.getElementById('side-popup');

// ✨ Animation zurücksetzen
sidePopup.classList.remove('show');

// 🛠️ Inhalt zuerst setzen
sidePopup.innerHTML = `
  <button class="close-btn">×</button>
  <table>
    <thead>
      <tr><th colspan="2">${note}</th></tr>
    </thead>
    <tbody>
      <tr><td>PLZ</td><td>${plz}</td></tr>
      <tr><td>Wert</td><td>${value}</td></tr>
      <tr><td>HZ-Flag</td><td>${hzFlag}</td></tr>
    </tbody>
  </table>
`;

// 🧠 Reflow erzwingen, um Animation neu zu starten
void sidePopup.offsetWidth;

// ✨ Klasse wieder hinzufügen
sidePopup.classList.add('show');

// 🧹 Event-Listener neu setzen
const closeBtn = sidePopup.querySelector('.close-btn');
closeBtn.addEventListener('click', () => {
  sidePopup.classList.remove('show');
});

});

}});


      this._geoLayer.addTo(this.map);
      this._geoLayerVisible = true;

      const geoBounds = this._geoLayer.getBounds();
      this.map.fitBounds(geoBounds);
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





