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
    }

    connectedCallback() {
      if (!window.L) {
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

      const getColor = value => {
        return value > 10000 ? "#08306b" :
               value > 5000  ? "#2171b5" :
               value > 1000  ? "#6baed6" :
               value > 100   ? "#c6dbef" :
                               "#f7fbff";
      };

      // 🔄 Erst PLZ-Werte laden, dann GeoJSON
      Promise.all([
        fetch('https://benne2000.github.io/CustomGeoMap/plzWerte.json').then(res => res.json()),
        fetch('https://raw.githubusercontent.com/Benne2000/CustomGeoMap/main/BaWue.geojson').then(res => res.json())
      ]).then(([plzWerte, geoData]) => {
        const layer = L.geoJSON(geoData, {
          style: feature => {
            const plz = (feature.properties.plz || "").trim();
            const value = plzWerte[plz] || 0;
            return {
              fillColor: getColor(value),
              color: "white",
              weight: 1,
              fillOpacity: 0.8
            };
          },
          onEachFeature: (feature, layer) => {
            const plz = (feature.properties.plz || "").trim();
            const value = plzWerte[plz] || "Keine Daten";
            layer.bindPopup(`PLZ: ${plz}<br>Wert: ${value}`);
          }
        }).addTo(this.map);

        this.map.fitBounds(layer.getBounds());

        const marker = L.circleMarker([49.4067, 8.6585], {
          radius: 6,
          color: "red",
          fillColor: "red",
          fillOpacity: 0.9
        }).addTo(this.map);
        marker.bindPopup("BAUHAUS Heidelberg");

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

      const resizeObserver = new ResizeObserver(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      });
      resizeObserver.observe(this._shadowRoot.host);
    }
  }

if (!customElements.get('geo-map-widget')) {
  customElements.define('geo-map-widget', GeoMapWidget);
}
})();
