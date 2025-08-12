(function () {
  let template = document.createElement('template');
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
    </style>
    <div id="map"></div>
    <div class="legend" id="legend"></div>
  `;

  class GeoMapWidget extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: 'open' });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
      this.map = null;
      this._plzWerte = {};
    }

    connectedCallback() {
      if (!window.L) {
        this._shadowRoot.host.style.display = "block";
        this._shadowRoot.host.style.height = "400px";

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => this.initializeMap();

        this._shadowRoot.appendChild(link);
        this._shadowRoot.appendChild(script);
      } else {
        this.initializeMap();
      }
    }

    initializeMap() {
      const mapContainer = this._shadowRoot.getElementById('map');
      this.map = L.map(mapContainer).setView([49.4, 8.7], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(this.map);

      const resizeObserver = new ResizeObserver(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      });
      resizeObserver.observe(this._shadowRoot.host);
    }

setData() {
  // Manuelle Testdaten
  this._plzWerte = {
    "68159": 14,
    "69115": 500,
    "70173": 12000
  };

  console.log("Manuelle Testdaten gesetzt:", this._plzWerte);
  this.updateMapWithSACData();
}


    updateMapWithSACData() {
      if (!this.map || !this._plzWerte) return;

      fetch('https://raw.githubusercontent.com/Benne2000/PLZAnalyse/main/PLZ.geojson')
        .then(res => res.json())
        .then(geoData => {
          const getColor = value => {
            return value > 10000 ? "#08306b" :
                   value > 5000  ? "#2171b5" :
                   value > 1000  ? "#6baed6" :
                   value > 100   ? "#c6dbef" :
                                   "#f7fbff";
          };

          const layer = L.geoJSON(geoData, {
            style: feature => {
              const plz = feature.properties.plz?.trim();
              const value = this._plzWerte[plz] || 0;
              return {
                fillColor: getColor(value),
                color: "white",
                weight: 1,
                fillOpacity: 0.8
              };
            },
            onEachFeature: (feature, layer) => {
              const plz = feature.properties.plz?.trim();
              const value = this._plzWerte[plz] ?? "Keine Daten";
              layer.bindPopup(`PLZ: ${plz}<br>Wert: ${value}`);
            }
          }).addTo(this.map);

          this.map.fitBounds(layer.getBounds());

          const legendContainer = this._shadowRoot.getElementById('legend');
          legendContainer.innerHTML = `
            <strong>Wert (PLZ)</strong><br>
            <i style="background:#08306b"></i> > 10.000<br>
            <i style="background:#2171b5"></i> > 5.000<br>
            <i style="background:#6baed6"></i> > 1.000<br>
            <i style="background:#c6dbef"></i> > 100<br>
            <i style="background:#f7fbff"></i> ≤ 100
          `;
        });
    }
  }

  if (!customElements.get('geo-map-widget')) {
    customElements.define('geo-map-widget', GeoMapWidget);
  }
})();

