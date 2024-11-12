import Image from 'next/image'
import Link from 'next/link'
import { Twitter, ExternalLink } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen font-sans bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-block bg-indigo-100 px-6 py-2 mb-8 rounded-full shadow-sm">
            <h1 className="text-lg font-medium text-indigo-800">OUR PROJECT TEAM</h1>
          </div>
          <p className="text-4xl max-w-3xl mx-auto leading-relaxed text-gray-800 font-light">
            We are passionate about <span className="font-medium text-indigo-900">data</span>.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-white text-gray-800 py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="relative mb-16">
            <h2 className="text-xl font-medium text-gray-900">ABOUT US</h2>
            <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-indigo-500"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4 group">
              <div className="flex flex-col h-full bg-gray-50 rounded-2xl p-8 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
                <div className="w-48 h-48 relative overflow-hidden bg-gray-100 rounded-full mx-auto ring-4 ring-indigo-100 group-hover:ring-indigo-200 transition-all duration-300">
                  <Image
                    src="about/lauren.png?height=600&width=600"
                    alt="Lauren Leek"
                    layout="fill"
                    objectFit="cover"
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-2xl font-medium mt-6 text-center text-gray-900">Lauren Leek</h3>
                <p className="text-gray-600 leading-relaxed mt-4 text-center">
                  PhD researcher in political science at the European University Institute. 
                  Previously a visiting PhD researcher at the London School of Economics 
                  and a PhD trainee at the European Central Bank in DG Economics.
                </p>
                <div className="flex items-center justify-center space-x-6 mt-auto pt-6">
                  <Link 
                    href="https://twitter.com/leek_lauren" 
                    className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 hover:gap-2 duration-300"
                  >
                    <Twitter className="w-5 h-5" />
                    <span>@laurenleek</span>
                  </Link>
                  <Link 
                    href="https://laurenleek.com" 
                    className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 hover:gap-2 duration-300"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Website</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-4 group">
              <div className="flex flex-col h-full bg-gray-50 rounded-2xl p-8 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
                <div className="w-48 h-48 relative overflow-hidden bg-gray-100 rounded-full mx-auto ring-4 ring-indigo-100 group-hover:ring-indigo-200 transition-all duration-300">
                  <Image
                    src="about/simeon.jpg?height=600&width=600"
                    alt="Simeon Bischl"
                    layout="fill"
                    objectFit="cover"
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-2xl font-medium mt-6 text-center text-gray-900">Simeon Bischl</h3>
                <p className="text-gray-600 leading-relaxed mt-4 text-center">
                  PhD researcher in Economics at the European University Institute. 
                  Previously a trainee at the European Central Bank.
                </p>
                <div className="flex items-center justify-center space-x-6 mt-auto pt-6">
                  <Link 
                    href="https://twitter.com/simeonbischl" 
                    className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 hover:gap-2 duration-300"
                  >
                    <Twitter className="w-5 h-5" />
                    <span>@simeonbischl</span>
                  </Link>
                  <Link 
                    href="https://simeonbischl.de" 
                    className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 hover:gap-2 duration-300"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Website</span>
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