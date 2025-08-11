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

    // 🧼 Container prüfen
    if (!container) {
      console.warn("Map container not found.");
      return;
    }

    // 🧱 Feste Höhe setzen, falls nicht vorhanden
    if (!container.style.height) {
      container.style.height = "400px";
    }

    // 🗺️ Karte initialisieren
    if (!mapInstance) {
      mapInstance = L.map(container).setView([51.1657, 10.4515], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
      }).addTo(mapInstance);

      // 🧽 Leaflet zwingen, die Größe neu zu berechnen
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 0);
    }
  };

  // 📦 Widget-Initialisierung
  sap.ui.define(["sap/designstudio/sdk/component"], function (Component) {
    return Component.extend("custom.leafletwidget.LeafletWidget", {
      initDesignStudio: function () {
        // 🧱 Container erzeugen
        if (!document.getElementById(mapContainerId)) {
          const container = document.createElement("div");
          container.id = mapContainerId;
          container.style.width = "100%";
          container.style.height = "400px"; // 🧱 Feste Höhe
          container.style.border = "1px solid #ccc";
          this.$().append(container);
        }

        // 🚀 Leaflet laden
        loadLeaflet();
      }
    });
  });
})();
