import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <main className="flex-1">
        {/* Featured Tiles */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-5 lg:grid-cols-5">
            {/* Main Large Tile */}
            <div className="relative col-span-3 overflow-hidden rounded-lg shadow-lg">
              <div className="absolute inset-0">
                <img
                  src="images/website_mainpaper.avif"
                  alt="Central Bank Library"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-blue-900/70" />
              </div>
              <div className="relative p-8 md:p-12">
                <h2 className="mb-4 text-3xl font-bold text-amber-100 md:text-4xl">CBT Library</h2>
                <p className="mb-6 max-w-[90%] text-lg text-amber-50">
                  Access our comprehensive collection of central bank communications and analysis tools.
                </p>
                <Button variant="secondary" size="lg" className="bg-amber-100 text-blue-950 hover:bg-amber-200">
                  Explore the Paper
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Right Column Tiles */}
            <div className="col-span-2 grid gap-6">
              {/* Top Tile */}
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <div className="absolute inset-0">
                  <img
                    src="images/webstite_eurosystem.jpg"
                    alt="World CB Network"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-blue-900/70" />
                </div>
                <div className="relative p-6">
                  <h3 className="mb-2 text-xl font-bold text-amber-100 md:text-2xl">World CB Network</h3>
                  <p className="mb-4 text-sm text-amber-50">
                    Explore the interconnected network of central banks and their communication patterns.
                  </p>
                  <Button variant="secondary" size="sm" className="bg-amber-100 text-blue-950 hover:bg-amber-200">
                    Explore
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Bottom Tile */}
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <div className="absolute inset-0">
                  <img
                    src="images/website_machinelearning.jpg"
                    alt="ML Analysis"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-blue-900/70" />
                </div>
                <div className="relative p-6">
                  <h3 className="mb-2 text-xl font-bold text-amber-100 md:text-2xl">ML Analysis</h3>
                  <p className="mb-4 text-sm text-amber-50">
                    Discover insights through our machine learning analysis of central bank language.
                  </p>
                  <Button variant="secondary" size="sm" className="bg-amber-100 text-blue-950 hover:bg-amber-200">
                    Explore
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
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
                Map and examine development of communication across central banks & systematically track key metrics
              </h2>
              <div className="mt-8 w-full max-w-4xl">
                <img
                  src="/placeholder.svg?height=400&width=800"
                  alt="Placeholder for data visualization"
                  className="h-auto w-full rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 flex h-16 items-center">
          <p className="text-sm text-slate-700">
            © 2024 Central Bank Talk. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}