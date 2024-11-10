import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col bg-slate-50">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
            <div className="container mx-auto px-4">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-10 h-10 overflow-hidden rounded-full">
                    <Image
                      src="/logo.webp"
                      alt="Central Bank Talk Logo"
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <span className="text-xl font-bold text-blue-950">Central Bank Talk</span>
                </div>
                <nav className="flex items-center">
                  {[
                    { name: "Data", href: "/data-page" },
                    { name: "Recent Papers", href: "#" },
                    { name: "Speeches", href: "/data-speech" },
                    { name: "Themes", href: "#" },
                    { name: "About", href: "#" }
                  ].map((item, i, arr) => (
                    <div key={item.name} className="flex items-center">
                      <Link
                        href={item.href}
                        className="px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-blue-900 hover:bg-blue-50 rounded-md"
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
                © 2024 Central Bank Talk. All rights reserved.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-sm text-slate-700 hover:text-blue-900">Privacy Policy</Link>
                <Link href="#" className="text-sm text-slate-700 hover:text-blue-900">Terms of Service</Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}