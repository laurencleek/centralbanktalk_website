"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import Link from "next/link";
import { useData } from '@/contexts/DataContext';

// A small, simplified world topojson (no Antarctica, fewer islands)
const geoUrl =
  "data/world_map.json";

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

  // Country name to ISO-3 code mapping loaded dynamically
  const { data: countryNameToIso3 } = useData<Record<string, string>>("/data/country_name_to_iso3.json");

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
        height={385}
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
                <div className="mb-1">
                  {cbName ? (
                    <Link href={`/data-page?central_bank=${encodeURIComponent(cbName)}`} legacyBehavior>
                      <a className="text-blue-700 hover:underline font-medium" target="_blank" rel="noopener noreferrer">{cbMeta.name}</a>
                    </Link>
                  ) : cbMeta.name}
                </div>
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
