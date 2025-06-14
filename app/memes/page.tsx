"use client"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ThumbsUp, ThumbsDown, X } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { useState } from "react"

const memes = [
  { id: 1, src: "memes/supermeme_10h14_41.png", tags: ["FED", "Acemoglu"] },
  { id: 2, src: "memes/supermeme_10h22_25.png", tags: ["Acemoglu", "Jackson Hole"] },
  { id: 3, src: "memes/milei_meme.png", tags: ["Milei", "Argentina", "Chainsaw"] },
  { id: 4, src: "memes/open_ai.jpeg", tags: ["AI", "Tech", "April Fool"] },
  { id: 5, src: "memes/daron_got_rejected.jpeg", tags: ["Acemoglu", "April Fool"] },
  { id: 6, src: "memes/rate_hike.png", tags: ["Monetary policy", "Rate hikes"] }
]

export default function MemesPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Get all unique tags
  const allTags = Array.from(
    new Set(memes.flatMap(meme => meme.tags))
  ).sort();
  
  // Filter memes based on selected tag
  const filteredMemes = selectedTag 
    ? memes.filter(meme => meme.tags.includes(selectedTag))
    : memes;
  
  return (
    <div className="page-container">
      <PageHeader 
        tag="CENTRAL BANK MEMES"
        title="Explore monetary"
        titleAccent="meme theory"
        description="The one and only MMT that matters."
      />
      <main className="section-container">
        {/* Tag Filter */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex flex-wrap items-center gap-2 justify-center">
            <span className="text-sm font-medium">Filter by tag:</span>
            {selectedTag ? (
              <button 
                onClick={() => setSelectedTag(null)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {selectedTag} <X size={14} />
              </button>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className="px-3 py-1 bg-gray-100 hover:bg-blue-100 rounded-full text-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Memes Stack */}
        <div className="max-w-2xl mx-auto space-y-8 flex flex-col items-center">
          {filteredMemes.map((meme) => (
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
              
              {/* Tags Display */}
              <div className="flex flex-wrap justify-center gap-2">
                {meme.tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedTag === tag 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}