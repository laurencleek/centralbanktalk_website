"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import Link from "next/link";
import { useData } from '@/contexts/DataContext';

// A small, simplified world topojson (no Antarctica, fewer islands)
const geoUrl =
  "data/world_map.json";

// Color scales derived from globals.css (HSL values)
const colorScales = {
  speeches: [
    '#d1d5db', // grey for missing
    '#e3f0ff', // light blue
    '#b3d4fc', // medium blue
    '#6ca0dc', // blue
    '#357ab7', // dark blue
    '#174e87', // deepest blue
  ],
  audiences: [
    '#d1d5db',
    '#e9f7e9', // very light green
    '#b6e5b6', // light green
    '#6fdc6f', // medium green
    '#2bb52b', // green
    '#147d14', // dark green
  ],
  pressures: [
    '#d1d5db',
    '#f7fcfd', // perceptual blue-green
    '#ccece6',
    '#66c2a4',
    '#238b45',
    '#005824', // dark green
  ]
};
// For monetary dominance, we apply a power normalization to spread out high values

// Indicator config
const INDICATORS = [
  {
    group: 'Speeches',
    options: [
      { value: 'number_of_speeches', label: 'Number of Speeches', colorKey: 'speeches', get: (cb: any) => cb?.number_of_speeches }
    ]
  },
  {
    group: 'Audiences',
    options: [
      { value: 'audiences.financial_market', label: 'Financial Market Audience (%)', colorKey: 'audiences', get: (cb: any) => cb?.audiences?.financial_market != null ? cb.audiences.financial_market * 100 : undefined },
      { value: 'audiences.academic', label: 'Academic Audience (%)', colorKey: 'audiences', get: (cb: any) => cb?.audiences?.academic != null ? cb.audiences.academic * 100 : undefined },
      { value: 'audiences.central_bank', label: 'Central Bank Audience (%)', colorKey: 'audiences', get: (cb: any) => cb?.audiences?.central_bank != null ? cb.audiences.central_bank * 100 : undefined },
      { value: 'audiences.political', label: 'Political Audience (%)', colorKey: 'audiences', get: (cb: any) => cb?.audiences?.political != null ? cb.audiences.political * 100 : undefined },
    ]
  },
  {
    group: 'Pressures',
    options: [
      { value: 'pressures.monetary_dominance', label: 'Monetary Dominance (%)', colorKey: 'pressures', get: (cb: any) => cb?.pressures?.monetary_dominance != null ? cb.pressures.monetary_dominance * 100 : undefined },
      { value: 'pressures.fiscal_dominance', label: 'Fiscal Dominance (%)', colorKey: 'pressures', get: (cb: any) => cb?.pressures?.fiscal_dominance != null ? cb.pressures.fiscal_dominance * 100 : undefined },
      { value: 'pressures.financial_dominance', label: 'Financial Dominance (%)', colorKey: 'pressures', get: (cb: any) => cb?.pressures?.financial_dominance != null ? cb.pressures.financial_dominance * 100 : undefined },
    ]
  }
];

function getColorByValue(value: number | undefined, min: number, max: number, scale: string[], indicatorKey?: string) {
  if (value === undefined) return scale[0];
  let norm: number;
  // Special normalization for monetary dominance to spread high values
  if (indicatorKey === 'pressures' /* specifically monetary dominance */) {
    // Use a power normalization (gamma < 1) to spread high values
    norm = Math.pow((value - min) / (max - min || 1), 0.5); // sqrt
  } else {
    norm = (value - min) / (max - min || 1);
  }
  const clamped = Math.max(0, Math.min(1, norm));
  const idx = clamped * (scale.length - 2) + 1;
  const lowIdx = Math.floor(idx);
  const highIdx = Math.ceil(idx);
  if (lowIdx === highIdx) return scale[lowIdx];
  // Interpolate between RGB colors
  function hexToRgb(hex: string) {
    const match = hex.match(/#([\da-f]{2})([\da-f]{2})([\da-f]{2})/i);
    if (!match) return [0,0,0];
    return [parseInt(match[1],16), parseInt(match[2],16), parseInt(match[3],16)];
  }
  const rgbLow = hexToRgb(scale[lowIdx]);
  const rgbHigh = hexToRgb(scale[highIdx]);
  const frac = idx - lowIdx;
  const rgb = rgbLow.map((c, i) => Math.round(c + frac * (rgbHigh[i] - c)));
  return `#${rgb[0].toString(16).padStart(2,'0')}${rgb[1].toString(16).padStart(2,'0')}${rgb[2].toString(16).padStart(2,'0')}`;
}





import { Select, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select';

export default function InteractiveWorldMap() {
  // Load data FIRST so it is available for hooks below
  const { data: countryCentralBankMapping } = useData<any>("/data/central_banks/country_central_bank_mapping.json");
  const { data: centralBanksMetadata } = useData<any>("/data/central_banks/central_banks_metadata.json");
  const { data: countryNameToIso3 } = useData<Record<string, string>>("/data/country_name_to_iso3.json");

  const [selectedIndicator, setSelectedIndicator] = useState('number_of_speeches');
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number, y: number } | null>(null);
  const [clickedCountry, setClickedCountry] = useState<string | null>(null);
  const [clickedCountryPos, setClickedCountryPos] = useState<{ x: number, y: number } | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Indicator config helpers
  const indicatorOption = useMemo(() => INDICATORS.flatMap(g => g.options).find(opt => opt.value === selectedIndicator), [selectedIndicator]);
  const indicatorLabel = indicatorOption?.label || '';
  const indicatorColorKey = indicatorOption?.colorKey || 'speeches';
  const indicatorGet = indicatorOption?.get || ((cb: any) => undefined);

  // Compute min/max for selected indicator
  const { minValue, maxValue } = useMemo(() => {
    let min = Infinity, max = -Infinity;
    if (centralBanksMetadata && indicatorGet) {
      Object.values(centralBanksMetadata).forEach((cb: any) => {
        const v = indicatorGet(cb);
        if (typeof v === 'number') {
          if (v < min) min = v;
          if (v > max) max = v;
        }
      });
    }
    if (!isFinite(min)) min = 0;
    if (!isFinite(max)) max = 1;
    return { minValue: min, maxValue: max };
  }, [centralBanksMetadata, indicatorGet]);

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
      <div className="w-full flex flex-col items-end mb-1 pr-4" style={{marginTop: '-1.5rem'}}>
        <span className="mb-0.5 text-sm font-bold text-zinc-700 mr-1">Indicator:</span>
        <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
          <SelectTrigger className="w-[175px] h-8 text-[12px] px-3 py-1 min-h-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="text-[12px] py-1 px-2 min-w-[175px]">
            {INDICATORS.map(group => (
              <SelectGroup key={group.group}>
                <SelectLabel className="text-[12px] px-1 py-0.5">{group.group}</SelectLabel>
                {group.options.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="py-1 px-1 text-[12px] min-h-0 min-w-0">{opt.label}</SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
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
                const value = indicatorGet(cbMeta);
                const color = getColorByValue(value, minValue, maxValue, colorScales[indicatorColorKey]);
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
        if (!cbMeta) return null;
        const value = indicatorGet(cbMeta);
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
            <span className="font-semibold">{indicatorLabel}:</span> {value !== undefined ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'N/A'}
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
                     ? <><span className="font-bold">Speeches:</span> <span className="font-normal">{cbMeta.number_of_speeches}</span></>
                     : <>No speech data</>}
                 </div>
                 <div className="text-sm text-zinc-700 dark:text-zinc-200 mb-1">
                   {cbMeta.cb_location && (<><span className="font-bold">Location:</span> <span className="font-normal">{cbMeta.cb_location}</span></>)}
                 </div>
                 <div className="text-sm text-zinc-700 dark:text-zinc-200 mb-1">
                   {cbMeta.currency && (<><span className="font-bold">Currency:</span> <span className="font-normal">{cbMeta.currency}</span></>)}
                 </div>
               </>; 
            })()}
          </div>
        </div>
      )}
      {/* Color scale legend */}
      <div className="w-full flex flex-col items-center" style={{marginTop: -65}}>

        <div style={{width: 360, position: 'relative', height: 48, margin: '0 auto'}}>
          {/* Legend Title */}
          <div className="font-bold text-xs text-zinc-700 mb-1 text-center w-full" style={{marginBottom: '0.3rem'}}>{indicatorLabel}</div>
          {/* SVG gradient bar */}
          <svg width="100%" height="20">
            <defs>
              <linearGradient id="indicator-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
                {colorScales[indicatorColorKey].slice(1).map((color, i) => (
                  <stop key={color} offset={`${(i/(colorScales[indicatorColorKey].length-2))*100}%`} stopColor={color} />
                ))}
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100%" height="20" fill="url(#indicator-gradient)" rx="4" />
          </svg>
        </div>
        {/* Tick labels below the bar, perfectly centered at ends and middle, hugging the gradient */}
        <div className="w-[360px] relative mt-0.5 mx-auto" style={{height: '16px'}}>
          <span style={{position:'absolute', left:0, top:-5, transform:'translateX(-50%)', width:'max-content'}} className="text-[12px] text-[#222]">{minValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          <span style={{position:'absolute', left:'50%', top:-5, transform:'translateX(-50%)', width:'max-content'}} className="text-[12px] text-[#222]">{((minValue+maxValue)/2).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          <span style={{position:'absolute', right:0, top:-5, transform:'translateX(50%)', width:'max-content'}} className="text-[12px] text-[#222]">{maxValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
}
