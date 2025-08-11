(function () {
  let mapInstance = null;
  let mapContainerId = "leaflet-map-container";

  const loadLeaflet = () => {
    if (!window.L) {
      const leafletCSS = document.createElement("link");
      leafletCSS.rel = "stylesheet";
      leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(leafletCSS);

      const leafletJS = document.createElement("script");
      leafletJS.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      leafletJS.onload = initMap;
      document.head.appendChild(leafletJS);
    } else {
      initMap();
    }
  };

  const initMap = () => {
    const container = document.getElementById(mapContainerId);
    if (!container) {
      console.warn("❌ Container nicht gefunden");
      return;
    }

    // Feste Höhe setzen
    container.style.height = "400px";
    container.style.width = "100%";
    container.style.border = "1px solid #ccc";

    // Nur einmal initialisieren
    if (!mapInstance) {
      console.log("🗺️ Initialisiere Leaflet-Karte");
      mapInstance = L.map(container).setView([51.1657, 10.4515], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
      }).addTo(mapInstance);

      // Resize-Observer für dynamisches Layout
      const resizeObserver = new ResizeObserver(() => {
        console.log("🔄 Containergröße geändert – Leaflet neu berechnen");
        mapInstance.invalidateSize();
      });
      resizeObserver.observe(container);

      // Zusätzlicher Timeout-Fix
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 500);
    }
  };

  sap.ui.define(["sap/designstudio/sdk/component"], function (Component) {
    return Component.extend("custom.leafletwidget.LeafletWidget", {
      initDesignStudio: function () {
        if (!document.getElementById(mapContainerId)) {
          const container = document.createElement("div");
          container.id = mapContainerId;
          this.$().append(container);
        }

        loadLeaflet();
      }
    });
  });
})();
