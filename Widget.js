(function () {
  let mapInstance = null;
  const mapContainerId = "leaflet-map-container";

  // 📦 Leaflet laden
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

  // 🗺️ Karte initialisieren
  const initMap = () => {
    const container = document.getElementById(mapContainerId);
    if (!container) {
      console.warn("❌ Container nicht gefunden");
      return;
    }

    // 🧱 Container sichtbar und mit fester Größe
    container.style.display = "block";
    container.style.visibility = "visible";
    container.style.height = "400px";
    container.style.width = "100%";
    container.style.border = "1px solid #ccc";

    // 📏 Logging zur Analyse
    console.log("📏 Containergröße:", container.offsetWidth, container.offsetHeight);

    // 🧼 Nur einmal initialisieren
    if (!mapInstance) {
      console.log("🗺️ Initialisiere Leaflet-Karte mit Esri-Satellitenbildern");
      mapInstance = L.map(container).setView([51.1657, 10.4515], 6);

      // 🛰️ Esri World Imagery als Hintergrundkarte
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
      }).addTo(mapInstance);

      // ⏳ Leaflet zwingen, Größe neu zu berechnen
      setTimeout(() => {
        mapInstance.invalidateSize();
        console.log("✅ Karte bereit");
      }, 500);
    }
  };

  // 🚀 Widget-Initialisierung
  sap.ui.define(["sap/designstudio/sdk/component"], function (Component) {
    return Component.extend("custom.leafletwidget.LeafletWidget", {
      initDesignStudio: function () {
        // 🧱 Container erzeugen, falls nicht vorhanden
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
