"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { useData } from '@/contexts/DataContext';

// A small, simplified world topojson (no Antarctica, fewer islands)
const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Blue scale for latitude (light to dark)
const blueScale = [
  "#d1d5db", // no data (distinct grey)
  "#b6c7e3", // light muted blue
  "#7b93c8", // medium muted blue
  "#415a8b", // dark muted blue
  "#243a5e", // very dark blue
  "#0f172a"  // even deeper blue for max
];

function getColorBySpeeches(speeches: number | undefined, min: number, max: number) {
  if (speeches === undefined) return blueScale[0]; // grey for missing
  // Sqrt normalization for better low-end contrast
  const norm = Math.sqrt((speeches - min) / (max - min || 1));
  const clamped = Math.max(0, Math.min(1, norm));
  const idx = clamped * (blueScale.length - 2) + 1; // skip grey
  const lowIdx = Math.floor(idx);
  const highIdx = Math.ceil(idx);
  if (lowIdx === highIdx) return blueScale[lowIdx];
  function hexToRgb(hex: string) {
    const m = hex.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
    return m ? [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)] : [0,0,0];
  }
  function rgbToHex([r,g,b]: number[]) {
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }
  const rgbLow = hexToRgb(blueScale[lowIdx]);
  const rgbHigh = hexToRgb(blueScale[highIdx]);
  const frac = idx - lowIdx;
  const rgb = rgbLow.map((c, i) => Math.round(c + frac * (rgbHigh[i] - c)));
  return rgbToHex(rgb as [number, number, number]);
}



export default function InteractiveWorldMap() {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number, y: number } | null>(null);
  const [clickedCountry, setClickedCountry] = useState<string | null>(null);
  const [clickedCountryPos, setClickedCountryPos] = useState<{ x: number, y: number } | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Close modal when clicking outside
  useEffect(() => {
    if (!clickedCountry) return;
    function handleClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setClickedCountry(null);
        setClickedCountryPos(null);
      }
    }
    function handleScroll() {
      setClickedCountry(null);
      setClickedCountryPos(null);
    }
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [clickedCountry]);
  const { data: countryCentralBankMapping } = useData<any>("/data/central_banks/country_central_bank_mapping.json");
  const { data: centralBanksMetadata } = useData<any>("/data/central_banks/central_banks_metadata.json");

  // Country name to ISO-3 code mapping
  const countryNameToIso3: Record<string, string> = {
    "Afghanistan": "AFG","Albania": "ALB","Algeria": "DZA","Angola": "AGO","Antarctica": "ATA","Antigua and Barbuda": "ATG","Argentina": "ARG","Armenia": "ARM","Australia": "AUS","Austria": "AUT","Azerbaijan": "AZE","Bahamas": "BHS","Bangladesh": "BGD","Belarus": "BLR","Belgium": "BEL","Belize": "BLZ","Benin": "BEN","Bhutan": "BTN","Bolivia": "BOL","Bosnia and Herz.": "BIH","Botswana": "BWA","Brazil": "BRA","Brunei": "BRN","Bulgaria": "BGR","Burkina Faso": "BFA","Burundi": "BDI","Cambodia": "KHM","Cameroon": "CMR","Canada": "CAN","Central African Rep.": "CAF","Chad": "TCD","Chile": "CHL","China": "CHN","Colombia": "COL","Congo": "COG","Costa Rica": "CRI","Croatia": "HRV","Cuba": "CUB","Cyprus": "CYP","Czechia": "CZE","Côte d'Ivoire": "CIV","Dem. Rep. Congo": "COD","Denmark": "DNK","Djibouti": "DJI","Dominican Rep.": "DOM","Ecuador": "ECU","Egypt": "EGY","El Salvador": "SLV","Eq. Guinea": "GNQ","Eritrea": "ERI","Estonia": "EST","eSwatini": "SWZ","Ethiopia": "ETH","Falkland Is.": "FLK","Fiji": "FJI","Finland": "FIN","France": "FRA","Fr. S. Antarctic Lands": "ATF","Gabon": "GAB","Gambia": "GMB","Georgia": "GEO","Germany": "DEU","Ghana": "GHA","Greece": "GRC","Greenland": "GRL","Guatemala": "GTM","Guinea": "GIN","Guinea-Bissau": "GNB","Guyana": "GUY","Haiti": "HTI","Honduras": "HND","Hungary": "HUN","Iceland": "ISL","India": "IND","Indonesia": "IDN","Iran": "IRN","Iraq": "IRQ","Ireland": "IRL","Israel": "ISR","Italy": "ITA","Jamaica": "JAM","Japan": "JPN","Jordan": "JOR","Kazakhstan": "KAZ","Kenya": "KEN","Kosovo": "XKX","Kuwait": "KWT","Kyrgyzstan": "KGZ","Laos": "LAO","Latvia": "LVA","Lebanon": "LBN","Lesotho": "LSO","Liberia": "LBR","Libya": "LBY","Lithuania": "LTU","Luxembourg": "LUX","Madagascar": "MDG","Malawi": "MWI","Malaysia": "MYS","Mali": "MLI","Mauritania": "MRT","Mexico": "MEX","Moldova": "MDA","Mongolia": "MNG","Montenegro": "MNE","Morocco": "MAR","Mozambique": "MOZ","Myanmar": "MMR","Namibia": "NAM","Netherlands": "NLD","New Caledonia": "NCL","New Zealand": "NZL","Nicaragua": "NIC","Niger": "NER","Nigeria": "NGA","North Korea": "PRK","N. Cyprus": "XNC","Norway": "NOR","Oman": "OMN","Pakistan": "PAK","Palestine": "PSE","Panama": "PAN","Papua New Guinea": "PNG","Paraguay": "PRY","Peru": "PER","Philippines": "PHL","Poland": "POL","Portugal": "PRT","Puerto Rico": "PRI","Qatar": "QAT","Romania": "ROU","Russia": "RUS","Rwanda": "RWA","Saudi Arabia": "SAU","Senegal": "SEN","Serbia": "SRB","Sierra Leone": "SLE","Slovakia": "SVK","Slovenia": "SVN","Solomon Is.": "SLB","Somalia": "SOM","Somaliland": "SML","South Africa": "ZAF","South Korea": "KOR","South Sudan": "SSD","Spain": "ESP","Sri Lanka": "LKA","Sudan": "SDN","Suriname": "SUR","Sweden": "SWE","Switzerland": "CHE","Syria": "SYR","Taiwan": "TWN","Tajikistan": "TJK","Tanzania": "TZA","Thailand": "THA","Timor-Leste": "TLS","Togo": "TGO","Trinidad and Tobago": "TTO","Tunisia": "TUN","Turkey": "TUR","Turkmenistan": "TKM","Uganda": "UGA","Ukraine": "UKR","United Arab Emirates": "ARE","United Kingdom": "GBR","United States of America": "USA","Uruguay": "URY","Uzbekistan": "UZB","Vanuatu": "VUT","Venezuela": "VEN","Vietnam": "VNM","W. Sahara": "ESH","Yemen": "YEM","Zambia": "ZMB","Zimbabwe": "ZWE"
  };

  // Compute min/max number_of_speeches for color scale
  const { minSpeeches, maxSpeeches } = useMemo(() => {
    let min = Infinity, max = -Infinity;
    if (centralBanksMetadata) {
      Object.values(centralBanksMetadata).forEach((cb: any) => {
        if (typeof cb.number_of_speeches === "number") {
          if (cb.number_of_speeches < min) min = cb.number_of_speeches;
          if (cb.number_of_speeches > max) max = cb.number_of_speeches;
        }
      });
    }
    // Fallback for no data
    if (!isFinite(min)) min = 0;
    if (!isFinite(max)) max = 1;
    return { minSpeeches: min, maxSpeeches: max };
  }, [centralBanksMetadata]);

  return (
    <div className="w-full flex flex-col items-center">
      <ComposableMap
        projectionConfig={{ scale: 140 }}
        width={800}
        height={400}
        style={{ width: "100%", height: "auto", background: "transparent" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies
              .filter((geo) => geo.properties.ISO_A2 !== "AQ") // Remove Antarctica
              .map((geo) => {
                const props = geo.properties;
                const countryName = props.name;
                const iso3 = countryNameToIso3[countryName];
                let cbName = iso3 && countryCentralBankMapping ? countryCentralBankMapping[iso3] : undefined;
                let cbMeta = cbName && centralBanksMetadata ? centralBanksMetadata[cbName] : undefined;
                const speeches = cbMeta?.number_of_speeches;
                const color = getColorBySpeeches(speeches, minSpeeches, maxSpeeches);
                const isHovered = tooltip === countryName;
                const isSelected = clickedCountry === countryName;
                // Helper to darken a hex color
                function darkenColor(hex: string, amount: number) {
                  // amount: 0.0 (no change) to 1.0 (black)
                  const m = hex.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
                  if (!m) return hex;
                  let [r, g, b] = [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)];
                  r = Math.round(r * (1 - amount));
                  g = Math.round(g * (1 - amount));
                  b = Math.round(b * (1 - amount));
                  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
                }
                const hoverColor = darkenColor(color, 0.25);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={e => {
                      setTooltip(countryName);
                      setTooltipPos({
                        x: e.clientX,
                        y: e.clientY
                      });
                    }}
                    onMouseMove={e => {
                      setTooltipPos({
                        x: e.clientX,
                        y: e.clientY
                      });
                    }}
                    onMouseLeave={() => {
                      setTooltip(null);
                      setTooltipPos(null);
                    }}
                    onClick={e => {
                      setClickedCountry(countryName);
                      setClickedCountryPos({ x: e.clientX, y: e.clientY });
                    }}
                    style={{
                      default: {
                        fill: color,
                        stroke: "#b6c2d1",
                        strokeWidth: 0.7,
                        outline: "none",
                        transition: "fill 0.2s",
                      },
                      hover: {
                        fill: hoverColor,
                        stroke: "#b6c2d1",
                        strokeWidth: 0.7,
                        outline: "none",
                      },
                      pressed: {
                        fill: hoverColor,
                        stroke: "#b6c2d1",
                        strokeWidth: 0.7,
                        outline: "none"
                      },
                    }}
                    className="cursor-pointer"
                  />
                );
              })
          }
        </Geographies>
      </ComposableMap>
      {/* Tooltip: only render on hover */}
      {tooltip && tooltipPos && (() => {
        const iso3 = countryNameToIso3[tooltip!];
        const cbName = iso3 && countryCentralBankMapping ? countryCentralBankMapping[iso3] : undefined;
        const cbMeta = cbName && centralBanksMetadata ? centralBanksMetadata[cbName] : undefined;
        if (cbMeta?.number_of_speeches === undefined) return null;
        return (
          <div
            className="pointer-events-none absolute z-20 px-2 py-1 rounded bg-zinc-900 text-white text-xs shadow-lg"
            style={{
              left: tooltipPos.x + 10,
              top: tooltipPos.y + 10,
              position: "fixed",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 9999
            }}
          >
            <span className="ml-2">Speeches: {cbMeta.number_of_speeches}</span>
          </div>
        );
      })()}

      {/* Modal */}
      {clickedCountry && (
        <div
          ref={modalRef}
          className="z-10 bg-white dark:bg-zinc-900 shadow-lg rounded-md p-2 border border-zinc-200 dark:border-zinc-700 min-w-[180px]"
          style={clickedCountryPos ? {
            position: "fixed",
            left: clickedCountryPos.x,
            top: clickedCountryPos.y - 4, // even closer above click
            transform: "translate(-50%, -100%)",
            pointerEvents: "auto"
          } : {
            position: "absolute",
            left: "50%",
            top: "1rem",
            transform: "translate(-50%, 0)",
            pointerEvents: "auto"
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="text-base font-bold text-blue-950 dark:text-blue-300">{clickedCountry}</div>
            <button
              className="ml-4 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              onClick={() => { setClickedCountry(null); setClickedCountryPos(null); }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            {(() => {
              const iso3 = countryNameToIso3[clickedCountry];
              const cbName = iso3 && countryCentralBankMapping ? countryCentralBankMapping[iso3] : undefined;
              const cbMeta = cbName && centralBanksMetadata ? centralBanksMetadata[cbName] : undefined;
              if (!cbMeta) return <>No Speeches data</>;
              return <>
                <div className="mb-1">{cbMeta.name}</div>
                <div className="text-sm text-zinc-700 dark:text-zinc-200 mb-1">
                  {cbMeta.number_of_speeches !== undefined
                    ? <>Speeches: <span className="font-bold">{cbMeta.number_of_speeches}</span></>
                    : <>No speech data</>}
                </div>
              </>;
            })()}
          </div>
        </div>
      )}
      {/* Color scale legend */}
      <div className="w-full flex flex-col items-center mt-2">
        <div style={{width: 360, position: 'relative', height: 32, margin: '0 auto'}}>
          {/* SVG gradient bar */}
          <svg width="100%" height="20">
            <defs>
              <linearGradient id="speech-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
                {blueScale.slice(1).map((color, i) => (
                  <stop key={color} offset={`${(i/(blueScale.length-2))*100}%`} stopColor={color} />
                ))}
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100%" height="20" fill="url(#speech-gradient)" rx="4" />
          </svg>
          {/* Tick labels */}
          <div style={{position:'absolute', top:22, left:0, width:'100%', display:'flex', justifyContent:'space-between', fontSize:12, color:'#222'}}>
            <span>{minSpeeches}</span>
            <span>{Math.round((minSpeeches+maxSpeeches)/2)}</span>
            <span>{maxSpeeches}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
