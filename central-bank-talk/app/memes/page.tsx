import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

const memes = [
    { id: 1, title: "Central Bank Meme 1", src: "memes/supermeme_10h14_41.png"},
    { id: 2, title: "Central Bank Meme 2", src: "memes/supermeme_10h22_25.png"}
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

        {/* Memes Grid */}
        <div className="max-w-4xl mx-auto grid gap-8">
          {memes.map((meme) => (
            <div 
              key={meme.id} 
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100">
                <h2 className="text-lg font-medium text-slate-700">{meme.title}</h2>
              </div>
              <div className="relative flex justify-center p-4">
                <div className="relative w-full max-w-2xl aspect-[16/9]">
                  <Image
                    src={meme.src}
                    alt={meme.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}