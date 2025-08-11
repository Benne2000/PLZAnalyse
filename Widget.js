class GeoMapWidget extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._container = document.createElement("div");
    this._container.style.width = "100%";
    this._container.style.height = "100%";
    this._shadowRoot.appendChild(this._container);

    this._map = null;
    this._props = {}; // Hier speichern wir die Properties
  }

  // Lifecycle-Methode von SAC
  onCustomWidgetBeforeUpdate(changedProps) {
    this._props = changedProps;
  }

  onCustomWidgetAfterUpdate(changedProps, previousProps) {
    this._props = changedProps;
    this.render();
  }

  async render() {
    const caption = this._props.caption || "Meine Karte";
    const geojsonUrl = this._props.geojsonUrl;
    const pointDataRaw = this._props.pointData || "[]";

    this._container.innerHTML = `<h3>${caption}</h3><div id="map" style="width:100%; height:90%;"></div>`;

    await this.loadLeaflet();

    if (!this._map) {
      this._map = L.map(this._shadowRoot.querySelector("#map")).setView([51.1657, 10.4515], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
      }).addTo(this._map);
    }

    if (geojsonUrl) {
      const response = await fetch(geojsonUrl);
      const geojson = await response.json();

      L.geoJSON(geojson, {
        style: () => ({ color: "#3388ff", weight: 1, fillOpacity: 0.4 })
      }).addTo(this._map);
    }

    try {
      const points = JSON.parse(pointDataRaw);
      points.forEach(p => {
        if (p.lat && p.lng) {
          L.marker([p.lat, p.lng])
            .addTo(this._map)
            .bindPopup(p.label || "Punkt");
        }
      });
    } catch (e) {
      console.warn("Ungültiges pointData-Format");
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
