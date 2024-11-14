import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"

const memes = [
  { id: 1, src: "memes/supermeme_10h14_41.png" },
  { id: 2, src: "memes/supermeme_10h22_25.png" },
  { id: 3, src: "memes/milei_meme.png" }
]

export default function MemesPage() {
  return (
    <div className="page-container">
      <PageHeader 
        tag="CENTRAL BANK MEMES"
        title="Explore monetary"
        titleAccent="meme culture"
        description="A curated collection of central bank and monetary policy memes."
      />
      <main className="section-container">

        {/* Memes Stack */}
        <div className="max-w-2xl mx-auto space-y-8 flex flex-col items-center">
          {memes.map((meme) => (
            <div key={meme.id} className="space-y-2">
              <Card className="overflow-hidden inline-flex p-0">
                <Image
                  src={meme.src}
                  alt="Central Bank Meme"
                  width={800}
                  height={800}
                  className="rounded-lg max-w-full max-h-[80vh] w-auto h-auto"
                />
              </Card>
              <div className="flex justify-center gap-4">
                <button
                  className="flex items-center gap-1 p-2 rounded-md text-green-500"
                >
                  <ThumbsUp size={20} />
                  <span>100%</span>
                </button>
                <button
                  className="flex items-center gap-1 p-2 rounded-md text-gray-500"
                >
                  <ThumbsDown size={20} />
                  <span>0%</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}