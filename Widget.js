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
      this._container.innerHTML = `<h3>PLZ-Karte</h3><div id="map" style="width:100%; height:90%;"></div>`;
      await this.loadLeaflet();

      if (!this._map) {
        this._map = L.map(this._shadowRoot.querySelector("#map")).setView([51.1657, 10.4515], 6);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors"
        }).addTo(this._map);
      }

      // 🔗 Feste GeoJSON-URL
      const geojsonUrl = "https://example.com/plz.geojson";
      try {
        const response = await fetch(geojsonUrl);
        const geojson = await response.json();
        L.geoJSON(geojson, {
          style: () => ({ color: "#3388ff", weight: 1, fillOpacity: 0.4 })
        }).addTo(this._map);
      } catch (e) {
        console.warn("GeoJSON konnte nicht geladen werden:", e);
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
