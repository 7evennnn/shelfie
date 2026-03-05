// AuthorMap.jsx
// Drop this file into your src/ folder
// First run: npm install react-simple-maps

import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

// Full country list for fuzzy matching
const ALL_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Angola", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bangladesh", "Belarus", "Belgium",
  "Bolivia", "Bosnia and Herzegovina", "Brazil", "Bulgaria", "Cambodia",
  "Cameroon", "Canada", "Chile", "China", "Colombia", "Croatia", "Cuba",
  "Czech Republic", "Denmark", "Ecuador", "Egypt", "Estonia", "Ethiopia",
  "Finland", "France", "Georgia", "Germany", "Ghana", "Greece", "Guatemala",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
  "Kosovo", "Latvia", "Lebanon", "Lithuania", "Malaysia", "Mexico", "Moldova",
  "Mongolia", "Morocco", "Mozambique", "Myanmar", "Nepal", "Netherlands",
  "New Zealand", "Nigeria", "North Korea", "Norway", "Pakistan", "Palestine",
  "Panama", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Romania", "Russia", "Rwanda", "Saudi Arabia", "Senegal", "Serbia",
  "Singapore", "Slovakia", "Slovenia", "Somalia", "South Africa",
  "South Korea", "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tanzania", "Thailand", "Tunisia", "Turkey", "Uganda",
  "Ukraine", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Venezuela", "Vietnam", "Yemen", "Zimbabwe",
];

// Country name aliases — common alternates that map to canonical names
const ALIASES = {
  "usa": "United States", "us": "United States", "america": "United States",
  "uk": "United Kingdom", "england": "United Kingdom", "britain": "United Kingdom",
  "great britain": "United Kingdom", "scotland": "United Kingdom", "wales": "United Kingdom",
  "uae": "United Arab Emirates", "korea": "South Korea", "s. korea": "South Korea",
  "n. korea": "North Korea", "czech": "Czech Republic", "czechia": "Czech Republic",
  "russia": "Russia", "ussr": "Russia", "iran": "Iran", "persia": "Iran",
  "holland": "Netherlands", "the netherlands": "Netherlands",
  "burma": "Myanmar", "siam": "Thailand", "rhodesia": "Zimbabwe",
};

// Country centroids [longitude, latitude] for marker placement
const COUNTRY_CENTROIDS = {
  "Afghanistan": [67.7, 33.9], "Albania": [20.2, 41.2], "Algeria": [2.6, 28.0],
  "Angola": [17.9, -11.2], "Argentina": [-63.6, -38.4], "Armenia": [45.0, 40.1],
  "Australia": [133.8, -25.3], "Austria": [14.6, 47.5], "Azerbaijan": [47.6, 40.1],
  "Bangladesh": [90.4, 23.7], "Belarus": [27.9, 53.7], "Belgium": [4.5, 50.5],
  "Bolivia": [-64.7, -16.3], "Brazil": [-51.9, -14.2], "Bulgaria": [25.5, 42.7],
  "Cambodia": [104.9, 12.6], "Cameroon": [12.4, 3.9], "Canada": [-96.8, 60.0],
  "Chile": [-71.5, -35.7], "China": [104.2, 35.9], "Colombia": [-74.3, 4.6],
  "Croatia": [15.2, 45.1], "Cuba": [-79.5, 21.5], "Czech Republic": [15.5, 49.8],
  "Denmark": [9.5, 56.3], "Ecuador": [-78.2, -1.8], "Egypt": [30.8, 26.8],
  "Ethiopia": [40.5, 9.1], "Finland": [25.7, 64.0], "France": [2.2, 46.2],
  "Germany": [10.5, 51.2], "Ghana": [-1.0, 7.9], "Greece": [21.8, 39.1],
  "Hungary": [19.5, 47.2], "Iceland": [-18.1, 65.0], "India": [78.9, 20.6],
  "Indonesia": [113.9, -0.8], "Iran": [53.7, 32.4], "Iraq": [43.7, 33.2],
  "Ireland": [-8.2, 53.4], "Israel": [34.9, 31.0], "Italy": [12.6, 41.9],
  "Jamaica": [-77.3, 18.1], "Japan": [138.3, 36.2], "Jordan": [37.0, 30.6],
  "Kazakhstan": [66.9, 48.0], "Kenya": [37.9, 0.0], "Latvia": [24.6, 57.0],
  "Lebanon": [35.9, 33.9], "Lithuania": [23.9, 55.2], "Malaysia": [109.7, 4.2],
  "Mexico": [-102.6, 23.6], "Morocco": [-7.1, 31.8], "Myanmar": [95.9, 21.9],
  "Nepal": [84.1, 28.4], "Netherlands": [5.3, 52.1], "New Zealand": [172.0, -40.9],
  "Nigeria": [8.7, 9.1], "Norway": [8.5, 60.5], "Pakistan": [69.3, 30.4],
  "Peru": [-75.0, -9.2], "Philippines": [121.8, 12.9], "Poland": [19.1, 52.1],
  "Portugal": [-8.2, 39.4], "Romania": [25.0, 45.9], "Russia": [105.3, 61.5],
  "Saudi Arabia": [45.1, 23.9], "Senegal": [-14.5, 14.5], "Serbia": [21.0, 44.0],
  "Singapore": [103.8, 1.4], "South Africa": [25.1, -29.0], "South Korea": [127.8, 36.5],
  "Spain": [-3.7, 40.2], "Sri Lanka": [80.7, 7.9], "Sweden": [18.6, 60.1],
  "Switzerland": [8.2, 46.8], "Syria": [38.3, 34.8], "Taiwan": [120.9, 23.7],
  "Tanzania": [34.9, -6.4], "Thailand": [100.9, 15.9], "Tunisia": [9.5, 33.9],
  "Turkey": [35.2, 38.9], "Uganda": [32.3, 1.4], "Ukraine": [31.2, 48.4],
  "United Kingdom": [-1.2, 52.4], "United States": [-95.7, 37.1],
  "Uruguay": [-55.8, -32.5], "Venezuela": [-66.6, 8.0], "Vietnam": [108.3, 14.1],
  "Zimbabwe": [29.9, -19.0],
};

// Fuzzy match: returns top 4 suggestions for a typed string
function getSuggestions(input) {
  if (!input || input.trim().length < 2) return [];
  const normalized = input.trim().toLowerCase();

  // Check aliases first
  if (ALIASES[normalized]) return [ALIASES[normalized]];

  // Score each country by how well it matches
  const scored = ALL_COUNTRIES.map((country) => {
    const lower = country.toLowerCase();
    let score = 0;
    if (lower === normalized) score = 100;
    else if (lower.startsWith(normalized)) score = 80;
    else if (lower.includes(normalized)) score = 60;
    else {
      // Character overlap scoring
      let matches = 0;
      for (let i = 0; i < normalized.length; i++) {
        if (lower.includes(normalized[i])) matches++;
      }
      score = Math.round((matches / normalized.length) * 40);
    }
    return { country, score };
  });

  return scored
    .filter((s) => s.score > 25)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => s.country);
}

// GeoJSON world map from a public CDN
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function AuthorMap({ books, onUpdateCountry }) {
  const [editingId, setEditingId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Group books by confirmed country
  const countryGroups = useMemo(() => {
    const groups = {};
    books.forEach((book) => {
      const c = book.authorCountry;
      if (c && c !== "Unknown" && c !== "" && COUNTRY_CENTROIDS[c]) {
        if (!groups[c]) groups[c] = [];
        groups[c].push(book);
      }
    });
    return groups;
  }, [books]);

  function handleInput(e, bookId) {
    const val = e.target.value;
    setInputValue(val);
    setSuggestions(getSuggestions(val));
  }

  function confirmCountry(bookId, country) {
    onUpdateCountry(bookId, country);
    setEditingId(null);
    setInputValue("");
    setSuggestions([]);
  }

  const booksNeedingCountry = books.filter(
    (b) => !b.authorCountry || b.authorCountry === ""
  );
  const booksWithUnknown = books.filter((b) => b.authorCountry === "Unknown");

  return (
    <div>
      {/* Map */}
      <div style={{
        background: "#080d1a",
        border: "1px solid rgba(100,160,255,0.2)",
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
      }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 130, center: [10, 20] }}
          style={{ width: "100%", height: "auto" }}
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#0f1f3d"
                    stroke="#1a3060"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#162848", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {Object.entries(countryGroups).map(([country, bks]) => {
              const coords = COUNTRY_CENTROIDS[country];
              if (!coords) return null;
              const size = 4 + bks.length * 2;
              return (
                <Marker key={country} coordinates={coords}>
                  {/* Outer glow ring */}
                  <circle r={size + 8} fill="rgba(100,223,223,0.08)" />
                  <circle r={size + 4} fill="rgba(100,223,223,0.15)" />
                  {/* Main dot */}
                  <circle r={size} fill="#64DFDF" opacity={0.9} />
                  {/* Count label */}
                  {bks.length > 1 && (
                    <text
                      textAnchor="middle"
                      y={4}
                      style={{
                        fontFamily: "monospace",
                        fontSize: 8,
                        fontWeight: "bold",
                        fill: "#0d0d0d",
                        pointerEvents: "none",
                      }}
                    >
                      {bks.length}
                    </text>
                  )}
                  {/* Country tooltip on hover via title */}
                  <title>{country}: {bks.map(b => b.author).join(", ")}</title>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Legend */}
        {Object.keys(countryGroups).length > 0 && (
          <div style={{
            position: "absolute", bottom: 12, left: 12,
            background: "rgba(8,13,26,0.85)",
            border: "1px solid rgba(100,160,255,0.2)",
            padding: "8px 12px",
            backdropFilter: "blur(4px)",
          }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "rgba(100,223,223,0.6)", letterSpacing: "0.1em", marginBottom: 6 }}>
              MAPPED AUTHORS
            </p>
            {Object.entries(countryGroups).map(([country, bks]) => (
              <div key={country} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#64DFDF", flexShrink: 0 }} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#64DFDF" }}>
                  {country} · {bks.length}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Country entry for books missing it */}
      {(booksNeedingCountry.length > 0 || booksWithUnknown.length > 0) && (
        <div style={{ marginTop: 24 }}>
          <p style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: "rgba(240,234,214,0.4)", letterSpacing: "0.1em", marginBottom: 14,
          }}>
            ADD AUTHOR COUNTRIES — {booksNeedingCountry.length} MISSING
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 280, overflowY: "auto" }}>
            {[...booksNeedingCountry, ...booksWithUnknown].map((book) => (
              <div key={book.id} style={{ position: "relative" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 3, height: 32, background: book.spineColor || "#555", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {book.author}
                    </p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "rgba(240,234,214,0.35)", marginTop: 1 }}>
                      {book.title}
                    </p>
                  </div>

                  {editingId === book.id ? (
                    <div style={{ display: "flex", gap: 6, flex: 1 }}>
                      <input
                        autoFocus
                        value={inputValue}
                        onChange={(e) => handleInput(e, book.id)}
                        placeholder="Type country..."
                        style={{
                          flex: 1, padding: "6px 10px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(100,223,223,0.4)",
                          color: "#f0ead6",
                          fontFamily: "'DM Mono', monospace", fontSize: 12,
                          outline: "none",
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && suggestions.length > 0) confirmCountry(book.id, suggestions[0]);
                          if (e.key === "Escape") { setEditingId(null); setSuggestions([]); }
                        }}
                      />
                      <button
                        onClick={() => confirmCountry(book.id, "Unknown")}
                        style={{
                          background: "none", border: "1px solid rgba(240,234,214,0.2)",
                          color: "rgba(240,234,214,0.4)", padding: "6px 10px",
                          fontFamily: "'DM Mono', monospace", fontSize: 10, cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        skip
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(book.id); setInputValue(""); setSuggestions([]); }}
                      style={{
                        background: "none", border: "1px solid rgba(100,223,223,0.3)",
                        color: "#64DFDF", padding: "6px 14px",
                        fontFamily: "'DM Mono', monospace", fontSize: 10, cursor: "pointer",
                        whiteSpace: "nowrap", flexShrink: 0,
                      }}
                    >
                      + add country
                    </button>
                  )}
                </div>

                {/* Suggestions dropdown */}
                {editingId === book.id && suggestions.length > 0 && (
                  <div style={{
                    position: "absolute", right: 0, top: "100%", zIndex: 10,
                    background: "#111827",
                    border: "1px solid rgba(100,223,223,0.3)",
                    minWidth: 200, marginTop: 2,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  }}>
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion}
                        onClick={() => confirmCountry(book.id, suggestion)}
                        style={{
                          padding: "9px 14px", cursor: "pointer",
                          fontFamily: "'DM Mono', monospace", fontSize: 12,
                          color: "#f0ead6",
                          borderBottom: "1px solid rgba(240,234,214,0.06)",
                          transition: "background 0.1s",
                          display: "flex", alignItems: "center", gap: 8,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(100,223,223,0.08)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <span style={{ color: "#64DFDF", fontSize: 10 }}>✓</span>
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All confirmed */}
      {booksNeedingCountry.length === 0 && Object.keys(countryGroups).length > 0 && (
        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Object.entries(countryGroups).map(([country, bks]) => (
            <div key={country} style={{
              padding: "4px 12px",
              border: "1px solid rgba(100,223,223,0.3)",
              fontFamily: "'DM Mono', monospace", fontSize: 11,
              color: "#64DFDF", background: "rgba(100,223,223,0.05)",
            }}>
              {country} · {bks.length}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
