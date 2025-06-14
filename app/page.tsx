'use client'

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useData } from '@/contexts/DataContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { useState, useEffect } from 'react'
import DynamicWordCloud from './components/dynamic-word-cloud';
import InteractiveWorldMap from './components/InteractiveWorldMap';

export default function Page() {
  const { data: centralBankData, isLoading: isCentralBankDataLoading, error: centralBankError } = useData("data/central_banks/central_banks.json");
  const { data: worldData, isLoading: isWorldDataLoading, error: worldDataError } = useData("data/world_year_dom.json");
  const [isMapDataReady, setIsMapDataReady] = useState(false);

  // Process chart data safely
  const chartData = worldData ? Object.entries(worldData).map(([year, values]: [string, any]) => ({
    year: parseInt(year),
    monetary: Number((values?.monetary_dominance * 100 || 0).toFixed(2)),
    fiscal: Number((values?.fiscal_dominance * 100 || 0).toFixed(2)),
    financial: Number((values?.financial_dominance * 100 || 0).toFixed(2)),
  })).sort((a, b) => a.year - b.year) : [];

  // Ensure map data is ready before rendering
  useEffect(() => {
    if (centralBankData && !isCentralBankDataLoading) {
      // Additional validation to ensure data is properly structured
      try {
        // Perform basic validation - you could add more specific checks based on your data structure
        if (typeof centralBankData === 'object' && centralBankData !== null) {
          setIsMapDataReady(true);
        }
      } catch (e) {
        console.error("Error validating map data:", e);
        setIsMapDataReady(false);
      }
    }
  }, [centralBankData, isCentralBankDataLoading]);

  // Loading state for any data
  if (isCentralBankDataLoading || isWorldDataLoading) return <div>Loading...</div>;
  
  // Error state for any error
  if (centralBankError || worldDataError) 
    return <div>Error: {centralBankError?.message || worldDataError?.message}</div>;

  // Add this function to get the last value for each metric
  const getLastValues = () => {
    if (!chartData.length) return null;
    const lastPoint = chartData[chartData.length - 1];
    return {
      monetary: lastPoint.monetary,
      fiscal: lastPoint.fiscal,
      financial: lastPoint.financial,
      year: lastPoint.year
    };
  };

  // Add this function to get y-values for latest data point
  const getLastDataPoint = () => {
    if (!chartData.length) return null;
    const lastPoint = chartData[chartData.length - 1];
    return {
      monetary: { x: lastPoint.year + 0.5, y: lastPoint.monetary },
      fiscal: { x: lastPoint.year + 0.5, y: lastPoint.fiscal },
      financial: { x: lastPoint.year + 0.5, y: lastPoint.financial }
    };
  };

  const lastValues = getLastValues();
  const lastPoint = getLastDataPoint();

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <main className="flex-1">
        {/* Featured Tiles */}
        <section className="container mx-auto px-4 py-4 sm:py-8">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-5 lg:grid-cols-5">
            {/* Main Large Tile */}
            <Link href="/research#cbi-llm" className="relative col-span-1 md:col-span-3 overflow-hidden rounded-lg shadow-lg group">
              <div className="absolute inset-0">
                <img
                  src="images/website_mainpaper.avif"
                  alt="Central Bank Library"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-blue-900/70" />
              </div>
              <div className="relative p-4 sm:p-8 md:p-12 text-center sm:text-left">
                <h2 className="mb-4 text-2xl sm:text-3xl font-bold text-amber-100 md:text-4xl">CBI and Communication</h2>
                <p className="mb-6 max-w-[90%] text-base sm:text-lg text-amber-50">
                  Access our comprehensive analysis of how central bank independence shapes monetary policy communication.
                </p>
                <span className="inline-block bg-amber-100 text-blue-950 hover:bg-amber-200 px-6 py-3 rounded-md font-medium">
                  Explore the Paper
                  <ArrowRight className="ml-2 h-4 w-4 inline" />
                </span>
              </div>
            </Link>
            {/* Right Column Tiles */}
            <div className="col-span-1 md:col-span-2 grid gap-4 sm:gap-6">
              {/* Top Tile */}
              <Link href="/research#agenda-setting" className="relative overflow-hidden rounded-lg shadow-lg group">
                <div className="absolute inset-0">
                  <img
                    src="images/webstite_eurosystem.jpg"
                    alt="Eurosystem CB Network"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-blue-900/70" />
                </div>
                <div className="relative p-4 sm:p-6">
                  <h3 className="mb-2 text-lg sm:text-xl font-bold text-amber-100 md:text-2xl">Eurosystem CB Network</h3>
                  <p className="mb-4 text-sm text-amber-50">
                    Explore the interconnected network of the ECB and national central banks and their communication patterns.
                  </p>
                  <span className="inline-block bg-amber-100 text-blue-950 hover:bg-amber-200 px-4 py-2 rounded-md text-sm font-medium">
                    Explore
                    <ArrowRight className="ml-2 h-4 w-4 inline" />
                  </span>
                </div>
              </Link>
              {/* Bottom Tile */}
              <Link href="/research#textual-measures" className="relative overflow-hidden rounded-lg shadow-lg group">
                <div className="absolute inset-0">
                  <img
                    src="images/website_machinelearning.jpg"
                    alt="ML Analysis"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-blue-900/70" />
                </div>
                <div className="relative p-4 sm:p-6">
                  <h3 className="mb-2 text-lg sm:text-xl font-bold text-amber-100 md:text-2xl">LLM Classification</h3>
                  <p className="mb-4 text-sm text-amber-50">
                    Discover insights through our optimizing LLMs for classification of central bank speak.
                  </p>
                  <span className="inline-block bg-amber-100 text-blue-950 hover:bg-amber-200 px-4 py-2 rounded-md text-sm font-medium">
                    Explore
                    <ArrowRight className="ml-2 h-4 w-4 inline" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>
        {/* Hero Section - Reduced top padding */}
        <section className="container mx-auto px-4 py-4 sm:py-8">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-blue-950 md:text-5xl lg:text-6xl">
              Explore Central Bank Communication
            </h1>
            <p className="mt-4 sm:mt-6 max-w-[800px] text-base sm:text-lg text-slate-700">
              Discover how central bank communication has evolved over time through our comprehensive analysis
              of speeches, policy statements, and research papers.
            </p>
          </div>
        </section>
        {/* Key Data Point */}
        <section className="border-t border-slate-200 bg-white">
          <div className="container mx-auto px-4 py-12 sm:py-24">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-blue-900">
                Key Insight
              </div>
              <h2 className="max-w-[800px] text-3xl font-bold tracking-tighter text-blue-950 sm:text-4xl">
                Central banks are increasingly responding in their communication to various political and market pressures
              </h2>
              <p className="max-w-[800px] text-base text-slate-700 mt-4 leading-relaxed">
                Based on a large sample of central bank speeches, we uncover the responses in communication of central bankers to various pressures. Below these responses are summarised as monetary, fiscal, and financial dominance, which can be tracked over time.
              </p>
              <div className="mt-8 w-full">
                <ChartContainer
                  config={{
                    monetary: {
                      label: "Monetary Dominance",
                      color: "hsl(var(--chart-1))",
                    },
                    fiscal: {
                      label: "Fiscal Dominance",
                      color: "hsl(var(--chart-2))",
                    },
                    financial: {
                      label: "Financial Dominance",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[300px] sm:h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                      <XAxis
                        dataKey="year" 
                        className="text-xs text-muted-foreground" 
                        tickMargin={10}
                      />
                      <YAxis 
                        className="text-xs text-muted-foreground"
                        tickMargin={10}
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Year
                                    </span>
                                    <span className="font-bold text-muted-foreground">
                                      {label}
                                    </span>
                                  </div>
                                  {payload.map((entry) => (
                                    <div key={entry.name} className="flex flex-col">
                                      <span 
                                        className="text-[0.70rem] uppercase"
                                        style={{ color: entry.color }}
                                      >
                                        {entry.name}
                                      </span>
                                      <span className="font-bold" style={{ color: entry.color }}>
                                        {Number(entry.value).toFixed(2)}%
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom"
                        height={36}
                        content={({ payload }) => {
                          if (payload && payload.length) {
                            return (
                              <div className="flex justify-center gap-6 pt-4">
                                {payload.map((entry) => (
                                  <div key={entry.value} className="flex items-center gap-2">
                                    <div 
                                      className="h-3 w-3 rounded-full"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-sm font-medium">
                                      {entry.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      {lastPoint && (
                        <>
                          <text
                            x={lastPoint.monetary.x}
                            y={lastPoint.monetary.y}
                            textAnchor="start"
                            fill="hsl(var(--chart-1))"
                            fontSize={12}
                            dy={4}
                          >
                            Monetary Dominance
                          </text>
                          <text
                            x={lastPoint.fiscal.x}
                            y={lastPoint.fiscal.y}
                            textAnchor="start"
                            fill="hsl(var(--chart-2))"
                            fontSize={12}
                            dy={4}
                          >
                            Fiscal Dominance
                          </text>
                          <text
                            x={lastPoint.financial.x}
                            y={lastPoint.financial.y}
                            textAnchor="start"
                            fill="hsl(var(--chart-3))"
                            fontSize={12}
                            dy={4}
                          >
                            Financial Dominance
                          </text>
                        </>
                      )}
                      <Line
                        type="monotone"
                        dataKey="monetary"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={3}
                        dot={false}
                        name="Monetary Dominance"
                      />
                      <Line
                        type="monotone"
                        dataKey="fiscal"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={3}
                        dot={false}
                        name="Fiscal Dominance"
                      />
                      <Line
                        type="monotone"
                        dataKey="financial"
                        stroke="hsl(var(--chart-3))"
                        strokeWidth={3}
                        dot={false}
                        name="Financial Dominance"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-8 sm:mt-12 space-y-4 sm:space-y-8">
                  {/* Data source explanation with visual separation */}
                  
                  {/* Key Insight about topic changes - above the word cloud */}
                  <div className="flex flex-col items-center gap-4 text-center my-12">
                    <div className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-blue-900">
                      Key Insight
                    </div>
                    <h3 className="max-w-[800px] text-3xl font-bold tracking-tighter text-blue-950 sm:text-4xl">
                      Topics addressed by central banks have evolved significantly over time
                    </h3>
                    <p className="max-w-[800px] text-base text-slate-700 mt-4 leading-relaxed">
                      Our analysis of topic distribution shows a clear evolution in what central bankers talk about. While central banks were once focused narrowly on monetary policy, recent years have seen a shift towards addressing fiscal and financial stability issues as well as new topics like climate change and digital currencies.
                    </p>
                  </div>

                  {/* Topic Evolution Word Cloud - without box styling, directly embedded */}
                  <DynamicWordCloud 
                    width={800}
                    height={450}
                    className="mx-auto w-full"
                  />

        
                </div>
              </div>
            </div>
          </div>
        </section>
              {/* Interactive World Map Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 text-blue-950"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            <h2 className="text-2xl font-bold text-blue-950 dark:text-blue-100">Global Coverage of Central Bank Communication</h2>
          </div>
          {isMapDataReady ? (
            <InteractiveWorldMap />
          ) : (
            <div className="flex justify-center items-center h-[400px] bg-slate-50 rounded-lg border border-slate-100">
              <p>Preparing map data...</p>
            </div>
          )}
        </section>
        {/* Data Source Section moved below map */}
        <section className="container mx-auto px-4 pb-8">
          <div className="relative py-4 sm:py-6 px-4 sm:px-8 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-blue-950">Data Source</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We construct indices of pressures by applying a large language model to classify individual sentences in the central bank speeches database of the Bank of International Settlements, covering communications from more than 100 central banks worldwide.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}