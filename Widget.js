if (!customElements.get("geo-map-widget")) {
  class GeoMapWidget extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._container = document.createElement("div");
      this._container.style.width = "100%";
      this._container.style.height = "100%";
      this._shadowRoot.appendChild(this._container);

      this._map = null;
    }

    async onCustomWidgetAfterUpdate() {
      await this.render();
    }

   async render() {
  // Nur einmal initialisieren
  if (!this._mapContainer) {
    this._mapContainer = document.createElement("div");
    this._mapContainer.id = "map";
    this._mapContainer.style.width = "100%";
    this._mapContainer.style.height = "100%";
    this._container.innerHTML = `<h3>PLZ-Karte</h3>`;
    this._container.appendChild(this._mapContainer);
  }

  await this.loadLeaflet();

  // Nur einmal die Karte erzeugen
  if (!this._map) {
    this._map = L.map(this._mapContainer).setView([51.1657, 10.4515], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(this._map);
  }

  // Optional: vorherige Layer entfernen
  if (this._geoLayer) {
    this._map.removeLayer(this._geoLayer);
  }

  // GeoJSON laden
  const geojsonUrl = "https://benne2000.github.io/PLZAnalyse/PLZ.geojson";
  try {
    const response = await fetch(geojsonUrl);
    const geojson = await response.json();
    this._geoLayer = L.geoJSON(geojson, {
      style: () => ({ color: "#3388ff", weight: 1, fillOpacity: 0.4 })
    }).addTo(this._map);
  } catch (e) {
    console.warn("GeoJSON konnte nicht geladen werden:", e);
  }

  // Marker aus Datenquelle setzen (wie zuvor)
}

      // 📊 Daten aus SAC-Datenquelle
      const ds = this.dataBindings.getDataSource("myDataSource");
      if (ds) {
        const result = await ds.getData();
        const latIndex = result.metadata.fields.findIndex(f => f.id === "Latitude");
        const lngIndex = result.metadata.fields.findIndex(f => f.id === "Longitude");
        const labelIndex = result.metadata.fields.findIndex(f => f.id === "Label");

        result.data.forEach(row => {
          const lat = row[latIndex]?.raw;
          const lng = row[lngIndex]?.raw;
          const label = row[labelIndex]?.displayValue || "Ort";

          if (lat && lng) {
            L.marker([lat, lng])
              .addTo(this._map)
              .bindPopup(label);
          }
        });
      } else {
        console.warn("Keine Datenquelle gefunden");
      }
    }

    async loadLeaflet() {
      if (window.L) return;
      await Promise.all([
        this.loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"),
        this.loadStyle("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css")
      ]);
    }

    loadScript(src) {
      return new Promise(resolve => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    loadStyle(href) {
      return new Promise(resolve => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.onload = resolve;
        document.head.appendChild(link);
      });
    }
  }

  customElements.define("geo-map-widget", GeoMapWidget);
}



