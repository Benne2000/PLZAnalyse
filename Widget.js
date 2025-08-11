class GeoMapWidget extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._mapContainer = document.createElement("div");
    this._mapContainer.style.width = "100%";
    this._mapContainer.style.height = "100%";
    this._shadowRoot.appendChild(this._mapContainer);
    this._map = null;
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    if (!this._map) {
      await this.loadLeaflet();
      this._map = L.map(this._mapContainer).setView([51.1657, 10.4515], 6); // Deutschland-Zentrum
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
      }).addTo(this._map);
    }

    await this.loadGeoJson();
    this.renderPoints();
  }

  async loadLeaflet() {
    if (window.L) return;

    await Promise.all([
      this.loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"),
      this.loadStyle("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css")
    ]);
  }

  async loadGeoJson() {
    const url = this.properties.geojsonUrl;
    if (!url) return;

    const response = await fetch(url);
    const geojson = await response.json();

    const data = this.dataBindings.getDataBinding("myDataSource").getData();
    const plzValues = {};
    data.forEach(row => {
      const plz = row["dimensions"][0].id;
      const value = row["measures"][0].rawValue;
      plzValues[plz] = value;
    });

    L.geoJSON(geojson, {
      style: feature => {
        const plz = feature.properties.plz;
        const value = plzValues[plz];
        const color = value ? this.getColor(value) : "#ccc";
        return { color, weight: 1, fillOpacity: 0.6 };
      },
      onEachFeature: (feature, layer) => {
        const plz = feature.properties.plz;
        const value = plzValues[plz];
        layer.bindPopup(`PLZ: ${plz}<br>Wert: ${value ?? "Keine Daten"}`);
      }
    }).addTo(this._map);
  }

  renderPoints() {
    let points = [];
    try {
      points = JSON.parse(this.properties.pointData || "[]");
    } catch (e) {
      console.warn("Ungültiges pointData-Format");
    }

    points.forEach(p => {
      if (p.lat && p.lng) {
        L.marker([p.lat, p.lng])
          .addTo(this._map)
          .bindPopup(p.label || "Punkt");
      }
    });
  }

  getColor(value) {
    // Beispielhafte Farbskala
    if (value > 1000) return "#800026";
    if (value > 500) return "#BD0026";
    if (value > 200) return "#E31A1C";
    if (value > 100) return "#FC4E2A";
    if (value > 50) return "#FD8D3C";
    if (value > 20) return "#FEB24C";
    if (value > 10) return "#FED976";
    return "#FFEDA0";
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
