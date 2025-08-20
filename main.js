(function () {
  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      #map {
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
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
      #showNotesButton {
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 1001;
        padding: 6px 12px;
        font-size: 12px;
        background: #2171b5;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .note-label {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid #999;
        padding: 2px 6px;
        font-size: 11px;
        color: #333;
        border-radius: 4px;
      }
    </style>
    <div id="map"></div>
    <div class="legend" id="legend">
      <strong>Wert (PLZ)</strong><br>
      <i style="background:#08306b"></i> > 10.000<br>
      <i style="background:#2171b5"></i> > 5.000<br>
      <i style="background:#6baed6"></i> > 1.000<br>
      <i style="background:#c6dbef"></i> > 100<br>
      <i style="background:#f7fbff"></i> ≤ 100
    </div>
    <button id="showNotesButton">Notizen anzeigen</button>
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
      this._renderTimeout = null;
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

      this._shadowRoot.getElementById('showNotesButton')
        .addEventListener('click', () => this.showNotesOnMap());
    }

    initializeMapBase() {
      const mapContainer = this._shadowRoot.getElementById('map');
      this.map = L.map(mapContainer).setView([49.4, 8.7], 10);
      if (!this._resizeObserver) {
        this._resizeObserver = new ResizeObserver(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        });
        this._resizeObserver.observe(this._shadowRoot.host);
      }
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

    set myDataSource(dataBinding) {
      this._myDataSource = dataBinding;
      clearTimeout(this._renderTimeout);
      this._renderTimeout = setTimeout(() => this.render(), 100);
    }

    async render() {
      if (!this.map || !this._myDataSource || this._myDataSource.state !== "success") return;
      const data = this._myDataSource.data;
      if (!data) return;

      const plzWerte = {};
      data.forEach((row, index) => {
        const dim = row["dimensions_0"];
        const meas = row["measures_0"];
        const wert = typeof meas?.raw === "number" ? meas.raw : 0;
        const plz = dim?.id?.trim();
        if (plz) {
          plzWerte[plz] = wert;
        }
      });

      if (!this._geoData) {
        try {
          this._geoData = await fetch('https://raw.githubusercontent.com/Benne2000/PLZAnalyse/main/PLZ.geojson')
            .then(res => res.json());
        } catch (err) {
          console.error("❌ Fehler beim Laden der GeoJSON-Daten:", err);
          return;
        }
      }

      const getColor = value => {
        return value > 10000 ? "#08306b" :
               value > 5000 ? "#2171b5" :
               value > 1000 ? "#6baed6" :
               value > 100 ? "#c6dbef" : "#f7fbff";
      };

      if (this._geoLayer) {
        this.map.removeLayer(this._geoLayer);
      }

      this._geoLayer = L.geoJSON(this._geoData, {
        style: feature => {
          const plz = (feature.properties.plz || "").trim();
          const value = plzWerte[plz] || 0;
          return {
            fillColor: getColor(value),
            color: "white",
            weight: 1,
            fillOpacity: 0.4
          };
        },
        onEachFeature: (feature, layer) => {
          const plz = (feature.properties.plz || "").trim();
          const value = plzWerte[plz] || "Keine Daten";
          const note = feature.properties.note || "Keine Beschreibung";
          layer.bindPopup(`PLZ: ${plz}<br>Wert: ${value}<br>Note: ${note}`);
        }
      }).addTo(this.map);

      this.map.fitBounds(this._geoLayer.getBounds());
    }

    showNotesOnMap() {
      if (!this._geoLayer) return;
      this._geoLayer.eachLayer(layer => {
        const note = layer.feature?.properties?.note;
        if (note) {
          layer.bindTooltip(note, {
            permanent: true,
            direction: 'center',
            className: 'note-label'
          }).openTooltip();
        }
      });
    }
  }

  if (!customElements.get('geo-map-widget')) {
    customElements.define('geo-map-widget', GeoMapWidget);
  }
})();
