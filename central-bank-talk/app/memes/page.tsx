import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

const memes = [
    { id: 1, title: "Central Bank Meme 1", src: "/memes/supermeme_10h14_41.png"},
    { id: 2, title: "Central Bank Meme 2", src: "/memes/supermeme_10h22_25.png"}
]

export default function MemesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex-1 container mx-auto p-4 md:p-6 flex flex-col items-center">
        <div className="w-full flex flex-col md:flex-row items-center justify-between mb-6">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-4 md:mt-0">Central Bank Memes</h1>
        </div>

        <div className="w-full max-w-2xl mx-auto space-y-6">
          {memes.map((meme) => (
            <div 
              key={meme.id} 
              className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <Image
                src={meme.src}
                alt={meme.alt}
                width={600}
                height={600}
                className="w-full h-auto rounded-lg"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}