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

  // 🔁 Wiederholte Größenprüfung
  const ensureMapReady = () => {
    let attempts = 0;
    const maxAttempts = 10;

    const checkAndFix = () => {
      if (mapInstance && mapInstance._size && mapInstance._size.x > 0 && mapInstance._size.y > 0) {
        console.log("✅ Leaflet-Größe korrekt:", mapInstance._size);
        mapInstance.invalidateSize();
      } else {
        console.warn("⏳ Leaflet-Größe noch nicht korrekt, versuche erneut...");
        mapInstance.invalidateSize();
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkAndFix, 300);
        } else {
          console.error("❌ Leaflet konnte nicht korrekt initialisiert werden.");
        }
      }
    };

    checkAndFix();
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
      console.log("🗺️ Initialisiere Leaflet-Karte");
      mapInstance = L.map(container).setView([51.1657, 10.4515], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
      }).addTo(mapInstance);

      // 🔁 Wiederholte Größenprüfung
      setTimeout(() => {
        ensureMapReady();
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
