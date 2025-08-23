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
  { id: 6, src: "memes/rate_hike.png", tags: ["Monetary policy", "Rate hikes", "Ghibli"] }
]

export default function MemesPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Count occurrences of each tag
  const tagCount = memes.reduce((acc, meme) => {
    meme.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Create array of [tag, count] pairs and sort them
  const sortedTags = Object.entries(tagCount)
    .sort((a, b) => {
      // Sort by count (descending)
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      // Then alphabetically
      return a[0].localeCompare(b[0]);
    });
  
  // Simplified tag styling with more subtle colors and decreased spacing
  const getTagStyle = (isSelected: boolean = false) => {
    return {
      default: `bg-slate-100 text-slate-700`,
      selected: isSelected ? 'shadow-sm ring-1 ring-slate-300 ring-offset-1' : '',
      badge: `text-slate-600`
    };
  };
  
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
          <div className="flex flex-wrap items-center gap-1.5 justify-center">
            <span className="text-sm font-medium">Filter by tag:</span>
            {selectedTag ? (
              <button 
                onClick={() => setSelectedTag(null)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm transition-all duration-200 ${getTagStyle(true).default} ${getTagStyle(true).selected}`}
              >
                {selectedTag} 
                <span className="ml-0.5 text-xs font-medium ${getTagStyle().badge}">
                  ({tagCount[selectedTag]})
                </span>
                <X size={13} className="ml-0.5" />
              </button>
            ) : (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {sortedTags.map(([tag, count]) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-sm ${getTagStyle().default}`}
                  >
                    {tag}
                    <span className="text-xs font-medium ${getTagStyle().badge}">
                      ({count})
                    </span>
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
              <div className="flex flex-wrap justify-center gap-1.5">
                {meme.tags.map(tag => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${getTagStyle().default} ${getTagStyle(isSelected).selected}`}
                    >
                      {tag}
                      <span className="text-xs font-medium ${getTagStyle().badge}">
                        ({tagCount[tag]})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}