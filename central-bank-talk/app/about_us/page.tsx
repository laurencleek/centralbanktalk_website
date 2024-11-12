import Image from 'next/image'
import Link from 'next/link'
import { Twitter } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen font-sans">
      {/* Hero Section */}
      <section className="bg-background py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-block bg-blue-100 px-4 py-1 mb-8">
            <h1 className="text-lg font-medium text-blue-800">OUR PROJECT TEAM</h1>
          </div>
          <p className="text-4xl max-w-3xl mx-auto leading-relaxed text-gray-800">
            We are passionate about data.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-blue-900 text-white py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="relative mb-12">
            <h2 className="text-xl font-medium">ABOUT US</h2>
            <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-blue-400"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex flex-col h-full">
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <Image
                    src="/placeholder.svg?height=600&width=600"
                    alt="Lauren Leek"
                    layout="fill"
                    objectFit="cover"
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-medium">Lauren Leek</h3>
                <p className="text-blue-200 leading-relaxed">
                  PhD researcher in political science at the European University Institute. 
                  Previously a visiting PhD researcher at the London School of Economics 
                  and a PhD trainee at the European Central Bank in DG Economics.
                </p>
                <div className="flex items-center space-x-4 mt-auto pt-4">
                  <Link href="https://twitter.com/leek_lauren" className="text-amber-300 hover:text-amber-100 transition-colors">
                    <Twitter className="inline-block w-5 h-5 mr-1" />
                    <span>@laurenleek</span>
                  </Link>
                  <Link href="https://laurenleek.com" className="text-amber-300 hover:text-amber-100 transition-colors">
                    laurenleek.com
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col h-full">
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <Image
                    src="/placeholder.svg?height=600&width=600"
                    alt="Simeon Bischl"
                    layout="fill"
                    objectFit="cover"
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-medium">Simeon Bischl</h3>
                <p className="text-blue-200 leading-relaxed">
                  PhD researcher in Economics at the European University Institute. 
                  Previously a trainee at the European Central Bank.
                </p>
                <div className="flex items-center space-x-4 mt-auto pt-4">
                  <Link href="https://twitter.com/simeonbischl" className="text-amber-300 hover:text-amber-100 transition-colors">
                    <Twitter className="inline-block w-5 h-5 mr-1" />
                    <span>@simeonbischl</span>
                  </Link>
                  <Link href="https://simeonbischl.com" className="text-amber-300 hover:text-amber-100 transition-colors">
                    simeonbischl.com
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}