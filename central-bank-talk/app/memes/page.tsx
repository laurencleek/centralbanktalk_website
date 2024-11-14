import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from 'lucide-react'
import { Card } from "@/components/ui/card"

const memes = [
  { id: 1, src: "memes/supermeme_10h14_41.png" },
  { id: 2, src: "memes/supermeme_10h22_25.png" }
]

export default function MemesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <main className="container mx-auto p-4 md:p-8">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link 
              href="/" 
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Central Bank Memes
            </h1>
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        </div>

        {/* Memes Stack */}
        <div className="max-w-2xl mx-auto space-y-8 flex flex-col items-center">
          {memes.map((meme) => (
            <Card key={meme.id} className="overflow-hidden inline-flex p-0">
              <Image
                src={meme.src}
                alt="Central Bank Meme"
                width={800}
                height={800}
                className="rounded-lg max-w-full max-h-[80vh] w-auto h-auto"
              />
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}