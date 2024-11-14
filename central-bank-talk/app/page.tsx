'use client'

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useData } from '@/contexts/DataContext'

export default function Page() {
  const { data, isLoading, error } = useData("data/central_banks/central_banks.json");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <main className="flex-1">
        {/* Featured Tiles */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-5 lg:grid-cols-5">
            {/* Main Large Tile */}
            <Link href="/research#cbi-llm" className="relative col-span-3 overflow-hidden rounded-lg shadow-lg group">
              <div className="absolute inset-0">
                <img
                  src="images/website_mainpaper.avif"
                  alt="Central Bank Library"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-blue-900/70" />
              </div>
              <div className="relative p-8 md:p-12">
                <h2 className="mb-4 text-3xl font-bold text-amber-100 md:text-4xl">CBI and Communication</h2>
                <p className="mb-6 max-w-[90%] text-lg text-amber-50">
                  Access our comprehensive analysis of how central bank independence shapes monetary policy communication.
                </p>
                <span className="inline-block bg-amber-100 text-blue-950 hover:bg-amber-200 px-6 py-3 rounded-md font-medium">
                  Explore the Paper
                  <ArrowRight className="ml-2 h-4 w-4 inline" />
                </span>
              </div>
            </Link>

            {/* Right Column Tiles */}
            <div className="col-span-2 grid gap-6">
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
                <div className="relative p-6">
                  <h3 className="mb-2 text-xl font-bold text-amber-100 md:text-2xl">Eurosystem CB Network</h3>
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
                <div className="relative p-6">
                  <h3 className="mb-2 text-xl font-bold text-amber-100 md:text-2xl">LLM Classification</h3>
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
        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold tracking-tighter text-blue-950 sm:text-5xl md:text-6xl">
              Explore Central Bank Communication
            </h1>
            <p className="mt-6 max-w-[800px] text-lg text-slate-700">
              Discover how central bank communication has evolved over time through our comprehensive analysis
              of speeches, policy statements, and research papers.
            </p>
          </div>
        </section>

        {/* Key Data Point */}
        <section className="border-t border-slate-200 bg-white">
          <div className="container mx-auto px-4 py-24">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-blue-900">
                Key Insight
              </div>
              <h2 className="max-w-[800px] text-3xl font-bold tracking-tighter text-blue-950 sm:text-4xl">
                Central banks are increasingly responding in their communication to various political and market pressures
              </h2>
              <p className="max-w-[800px] text-sm text-slate-600 mt-4">
                Central bank communication has gone from being something 'not done' to a core tool of central banks over the past three decades. Lauren's PhD project aims to discover systematic patterns to give insights into this major transformation. She does this in several ways including through joint papers Simeon and Maximilian. First, we (Lauren, Simeon and Maximilian) propose a novel LLM based method to measure responses of central banks to various pressures in their monetary communication. Second, we (Lauren and Simeon) examine how central bank independence shapes these responses. Third, Lauren examines how institutional aspects, in this case the Eurosystem multi-level set-up, influences agenda-setting and responsiveness in the communication of central banks. This website allows insights into the data used for all these projects.
              </p>
              <div className="mt-8 w-full max-w-4xl">
                <img
                  src="/images/placeholder_map.png"
                  alt="Placeholder for data visualization"
                  className="h-auto w-full rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <div>
    </div>
    </div>
  )
}