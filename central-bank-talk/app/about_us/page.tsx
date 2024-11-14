import Image from 'next/image'
import Link from 'next/link'
import { Twitter, ExternalLink, Github } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

export default function AboutPage() {
  return (
    <div className="min-h-screen font-sans bg-white">
      <PageHeader 
        tag="ABOUT US"
        title="We are passionate about"
        titleAccent="data"
      />

      {/* Team Section */}
      <section className="bg-white text-gray-800 py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="relative mb-16">
            <h2 className="text-xl font-medium text-gray-900">OUR PROJECT TEAM</h2>
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
                  She was previously a visiting PhD researcher at the London School of Economics 
                  and a PhD trainee at the European Central Bank in DG Economics.
                </p>
                <div className="flex items-center justify-center space-x-6 mt-auto pt-6">
                  <Link 
                    href="https://twitter.com/leek_lauren" 
                    className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 hover:gap-2 duration-300"
                  >
                    <Twitter className="w-5 h-5" />
                    <span>@lauren_leek</span>
                  </Link>
                  <Link 
                    href="https://github.com/laurencleek" 
                    className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 hover:gap-2 duration-300"
                  >
                    <Github className="w-5 h-5" />
                    <span>GitHub</span>
                  </Link>
                  <Link 
                    href="https://laurencleek.github.io/laurencleek/" 
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
                  He was previously a research analyst at the European Central Bank in DG Econnomics.
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
                    href="https://github.com/sbischl" 
                    className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 hover:gap-2 duration-300"
                  >
                    <Github className="w-5 h-5" />
                    <span>GitHub</span>
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

      {/* Contact Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            <Link href="mailto:info@centralbanktalk.eu" className="text-indigo-600 hover:text-indigo-800 transition-colors">
              info@centralbanktalk.eu
            </Link>
          </p>
        </div>
      </section>

      {/* Privacy Policy Section */}
      <section id="privacy" className="bg-white py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="relative mb-8">
            <h2 className="text-xl font-medium text-gray-900">PRIVACY POLICY</h2>
            <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-indigo-500"></div>
          </div>
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              This website does not collect, store, or process any personal data from its visitors.
            </p>
            <p className="mb-4">
              The website is hosted on GitHub Pages, and as such, GitHub's privacy policies apply to the hosting infrastructure. 
              For more information about GitHub's data collection and processing practices, please refer to the{' '}
              <Link 
                href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" 
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Privacy Statement
              </Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}