import React, { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────
//  TherapistFinder
//  Leaflet map + Nominatim geocoding + Overpass with fallbacks
//  No API key needed. Completely free.
// ─────────────────────────────────────────────────────────────

// Multiple Overpass endpoints — tries each one if previous fails
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

const buildOverpassQuery = (lat, lon, radiusM = 15000) => `
[out:json][timeout:25];
(
  node["healthcare"="psychologist"](around:${radiusM},${lat},${lon});
  node["healthcare"="psychiatrist"](around:${radiusM},${lat},${lon});
  node["healthcare"="therapist"](around:${radiusM},${lat},${lon});
  node["amenity"="doctors"]["healthcare"](around:${radiusM},${lat},${lon});
  node["amenity"="clinic"](around:${radiusM},${lat},${lon});
  node["amenity"="hospital"](around:${radiusM},${lat},${lon});
  way["healthcare"="psychologist"](around:${radiusM},${lat},${lon});
  way["amenity"="clinic"](around:${radiusM},${lat},${lon});
);
out center 40;
`;

// Try each Overpass mirror until one succeeds
const fetchOverpass = async (query) => {
  let lastErr;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout per endpoint
      const res = await fetch(endpoint, {
        method: "POST",
        body: query,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      console.warn(`Overpass endpoint failed: ${endpoint}`, err.message);
    }
  }
  throw lastErr;
};

const TherapistFinder = () => {
  const [query, setQuery]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [results, setResults]     = useState([]);
  const [selected, setSelected]   = useState(null);
  const [mapReady, setMapReady]   = useState(false);
  const [searched, setSearched]   = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const mapRef       = useRef(null);
  const leafletMap   = useRef(null);
  const markersLayer = useRef(null);

  // ── Load Leaflet dynamically ──────────────────────────────
  useEffect(() => {
    if (window.L) { setMapReady(true); return; }

    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setMapReady(true);
    script.onerror = () => setError("Failed to load map library. Please refresh the page.");
    document.head.appendChild(script);
  }, []);

  // ── Init map ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current || leafletMap.current) return;
    const L   = window.L;
    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    markersLayer.current = L.layerGroup().addTo(map);
    leafletMap.current   = map;
  }, [mapReady]);

  const getIcon = (active = false) => window.L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${active ? "#7b61ff" : "#c58f89"};
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize:   [28, 28],
    iconAnchor: [14, 28],
    popupAnchor:[0, -30],
  });

  const handleSearch = async () => {
    if (!query.trim()) { setError("Please enter a city or area name."); return; }
    if (!leafletMap.current) { setError("Map is still loading, please wait a moment."); return; }

    setLoading(true);
    setError("");
    setResults([]);
    setSelected(null);
    setSearched(true);
    markersLayer.current.clearLayers();

    try {
      // ── Step 1: Geocode ─────────────────────────────────
      setStatusMsg("Finding location…");
      const geoController = new AbortController();
      const geoTimeout = setTimeout(() => geoController.abort(), 8000);

      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        {
          headers: { "Accept-Language": "en", "User-Agent": "SoulSpace/1.0" },
          signal: geoController.signal,
        }
      );
      clearTimeout(geoTimeout);

      if (!geoRes.ok) throw new Error("Geocoding service returned an error.");
      const geoData = await geoRes.json();

      if (!geoData.length) {
        setError(`Location "${query}" not found. Try adding your country, e.g. "Chennai, India".`);
        setLoading(false);
        setStatusMsg("");
        return;
      }

      const { lat, lon, display_name } = geoData[0];
      const latF = parseFloat(lat);
      const lonF = parseFloat(lon);

      leafletMap.current.setView([latF, lonF], 13);

      // ── Step 2: Fetch nearby providers via Overpass ────
      setStatusMsg("Searching for therapists nearby…");
      const overpassData = await fetchOverpass(buildOverpassQuery(latF, lonF));
      const elements     = overpassData.elements || [];

      // ── Step 3: Parse and deduplicate ─────────────────
      const seen   = new Set();
      const places = elements
        .map((el) => {
          const elLat = el.lat ?? el.center?.lat;
          const elLon = el.lon ?? el.center?.lon;
          if (!elLat || !elLon) return null;

          const name  = el.tags?.name || el.tags?.["name:en"] || "Mental Health Clinic";
          const addr  = [
            el.tags?.["addr:housenumber"],
            el.tags?.["addr:street"],
            el.tags?.["addr:city"] || display_name.split(",")[0],
          ].filter(Boolean).join(", ") || "Address not listed";
          const phone = el.tags?.phone || el.tags?.["contact:phone"] || null;
          const web   = el.tags?.website || el.tags?.["contact:website"] || null;
          const type  = (el.tags?.healthcare || el.tags?.amenity || "healthcare")
            .replace(/_/g, " ");

          const key = name + addr;
          if (seen.has(key)) return null;
          seen.add(key);

          return { id: el.id, name, addr, phone, web, type, lat: elLat, lon: elLon };
        })
        .filter(Boolean)
        .slice(0, 30);

      setResults(places);

      // ── Step 4: Drop pins ─────────────────────────────
      places.forEach((place, i) => {
        const marker = window.L
          .marker([place.lat, place.lon], { icon: getIcon(false) })
          .addTo(markersLayer.current)
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:190px;line-height:1.5">
              <strong style="color:#6b4f4f;font-size:14px">${place.name}</strong><br/>
              <span style="font-size:11px;color:#c58f89;font-weight:600;text-transform:capitalize">${place.type}</span><br/>
              <span style="font-size:12px;color:#888">${place.addr}</span><br/>
              ${place.phone ? `📞 <a href="tel:${place.phone}" style="font-size:12px">${place.phone}</a><br/>` : ""}
              ${place.web   ? `🌐 <a href="${place.web}" target="_blank" style="font-size:12px">Website</a><br/>` : ""}
              <a href="https://www.openstreetmap.org/directions?to=${place.lat},${place.lon}"
                target="_blank"
                style="font-size:12px;color:#7b61ff;font-weight:700;display:inline-block;margin-top:4px">
                🗺 Get Directions →
              </a>
            </div>
          `);
        marker.on("click", () => {
          setSelected(i);
          leafletMap.current.setView([place.lat, place.lon], 15);
        });
      });

      if (places.length === 0) {
        setError(
          `No mental health providers found within 15km of ${display_name.split(",")[0]}. ` +
          "Try searching for a nearby larger city."
        );
      }
    } catch (err) {
      console.error("TherapistFinder error:", err);
      if (err.name === "AbortError") {
        setError("Request timed out. The search service may be slow — please try again in a moment.");
      } else {
        setError("Search failed. Please check your internet connection and try again.");
      }
    }

    setStatusMsg("");
    setLoading(false);
  };

  const focusResult = (i) => {
    const place = results[i];
    setSelected(i);
    if (!leafletMap.current) return;
    leafletMap.current.setView([place.lat, place.lon], 16);
    markersLayer.current.eachLayer((layer) => {
      const pos = layer.getLatLng();
      if (Math.abs(pos.lat - place.lat) < 0.0001 && Math.abs(pos.lng - place.lon) < 0.0001) {
        layer.openPopup();
      }
    });
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSearch(); };

  return (
    <div className="therapist-page">
      <div className="therapist-header">
        <h2>🗺 Find a Therapist Near You</h2>
        <p>Search for mental health professionals in your area. Free — no sign up, no API key.</p>
      </div>

      {/* Search */}
      <div className="therapist-search-bar">
        <div className="therapist-search-inner">
          <span className="therapist-search-icon">📍</span>
          <input
            className="therapist-search-input"
            type="text"
            placeholder="Enter your city, e.g. Kochi, Kerala or Bangalore, India"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            className="btn-primary therapist-search-btn"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? statusMsg || "Searching…" : "Search"}
          </button>
        </div>
        {error && <p className="therapist-error">⚠️ {error}</p>}
      </div>

      {/* Map + Sidebar */}
      <div className="therapist-layout">
        <div className="therapist-map-wrap">
          <div ref={mapRef} className="therapist-map" />
          {!mapReady && (
            <div className="therapist-map-overlay">
              <div className="loading-spinner">Loading map…</div>
            </div>
          )}
        </div>

        <div className="therapist-sidebar">
          {!searched && !loading && (
            <div className="therapist-sidebar-empty">
              <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
              <p>Enter a location above to find therapists near you.</p>
              <p style={{ fontSize: 12, color: "#b8a0a0", marginTop: 10 }}>
                Powered by OpenStreetMap &amp; Overpass API — 100% free
              </p>
            </div>
          )}

          {loading && (
            <div className="therapist-sidebar-empty">
              <div className="loading-spinner" style={{ marginBottom: 10 }} />
              <p style={{ fontSize: 13 }}>{statusMsg}</p>
            </div>
          )}

          {searched && !loading && results.length === 0 && !error && (
            <div className="therapist-sidebar-empty">
              <p>No results found. Try a nearby larger city.</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <p className="therapist-result-count">
                Found <strong>{results.length}</strong> provider{results.length !== 1 ? "s" : ""} nearby
              </p>
              <div className="therapist-results-list">
                {results.map((place, i) => (
                  <div
                    key={place.id}
                    className={`therapist-result-card ${selected === i ? "active" : ""}`}
                    onClick={() => focusResult(i)}
                  >
                    <div className="therapist-result-top">
                      <span className="therapist-result-pin">📍</span>
                      <div>
                        <p className="therapist-result-name">{place.name}</p>
                        <p className="therapist-result-type">{place.type}</p>
                      </div>
                    </div>
                    <p className="therapist-result-addr">{place.addr}</p>
                    <div className="therapist-result-links">
                      {place.phone && (
                        <a href={`tel:${place.phone}`} className="therapist-link-btn">📞 Call</a>
                      )}
                      {place.web && (
                        <a href={place.web} target="_blank" rel="noopener noreferrer" className="therapist-link-btn">🌐 Website</a>
                      )}
                      <a
                        href={`https://www.openstreetmap.org/directions?to=${place.lat},${place.lon}`}
                        target="_blank" rel="noopener noreferrer"
                        className="therapist-link-btn therapist-directions-btn"
                      >
                        🗺 Directions
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <p className="therapist-disclaimer">
        Results are sourced from OpenStreetMap contributors and may be incomplete.
        Always call ahead to confirm availability and specialisation.
      </p>
    </div>
  );
};

export default TherapistFinder;
