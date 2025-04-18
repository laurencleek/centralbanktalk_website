import './globals.css'
import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import Image from 'next/image'
import { DataProvider } from '@/contexts/DataContext'

const inter = Inter({ subsets: ['latin'] })
const montserrat = Montserrat({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Central Bank Talk',
  description: 'Visualizations for how central bank communication changed over time',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
      <link rel="icon" type="image/webp" href="/logo.webp" />
      </head>
      <body className={inter.className}>
        <DataProvider>
          <div className="flex min-h-screen flex-col bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
              <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                  <Link href="/" className="flex items-center gap-4">
                    <div className="relative w-10 h-10 overflow-hidden rounded-full">
                      <Image
                        src="logo.webp"
                        alt="Central Bank Talk Logo"
                        width={40}
                        height={40}
                        layout="fixed"
                      />
                    </div>
                    <span className={`scroll-m-20 text-2xl font-semibold tracking-tight ${montserrat.className}`}>
                      <span className="text-black">CB</span>
                      <span className="text-blue-950"> Talk</span>
                    </span>
                  </Link>
                  <nav className="flex items-center">
                    {[
                      { name: "Data", href: "/data-page" },
                      { name: "Recent Papers", href: "/research" },
                      { name: "Speeches", href: "/data-speech" },
                      { name: "Memes", href: "/memes" },
                      { name: "About", href: "/about_us" }
                    ].map((item, i, arr) => (
                      <div key={item.name} className="flex items-center">
                        <Link
                          href={item.href}
                          className="nav-link px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-blue-900 rounded-md"
                        >
                          {item.name}
                        </Link>
                        {i < arr.length - 1 && (
                          <Separator orientation="vertical" className="h-4 mx-2 bg-slate-200" />
                        )}
                      </div>
                    ))}
                  </nav>
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1">
              {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white">
              <div className="container mx-auto px-4 py-6 flex justify-between items-center">
                <p className="text-sm text-slate-700">
                © 2025 Central Bank Talk.
                </p>
                <div className="flex space-x-4">
                  <Link href="/about_us#privacy" className="text-sm text-slate-700 hover:text-blue-900">Privacy Policy</Link>
                  <Link href="#" className="text-sm text-slate-700 hover:text-blue-900"></Link>
                </div>
              </div>
            </footer>
          </div>
        </DataProvider>
      </body>
    </html>
  )
}