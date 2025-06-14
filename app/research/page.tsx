"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { PageHeader } from "@/components/ui/page-header"
import { useState } from 'react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X, FileText, Github, Archive, Presentation, Image, Package, ExternalLink } from 'lucide-react'

// Helper function to get the appropriate icon based on download type
const getDownloadIcon = (type: string) => {
  const iconProps = { className: "h-4 w-4" };
  switch (type.toLowerCase()) {
    case 'paper':
    case 'pdf':
    case 'appendix':  
      return <FileText {...iconProps} />;
    case 'github':
    case 'repo':
      return <Github {...iconProps} />;
    case 'slides':
    case 'presentation':
      return <Presentation {...iconProps} />;
    case 'zip':
    case 'archive':
      return <Archive {...iconProps} />;
    case 'container':
    case 'docker':
      return <Package {...iconProps} />;
    default:
      return <ExternalLink {...iconProps} />;
  }
};

export default function ResearchPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const papers = [
    {
      id: 1,
      category: "Paper",
      title: "How Central Bank Independence Shapes Monetary Policy Communication: A Large Language Model Application",
      authors: ["Lauren Leek", "Simeon Bischl"],
      date: "April 2025",
      journal: "European Journal of Political Economy",
      link: "https://www.sciencedirect.com/science/article/pii/S017626802500028X",
      abstract: "Although central bank communication is a core monetary policy and accountability tool for central banks, little is known about what shapes it. This paper develops and tests a theory regarding a previously unconsidered variable: central bank independence (CBI). We argue that increases in CBI alter the pressures central banks face, compelling them to address these pressures to maintain their reputation. We fine-tune and validate a Large Language Model (Google’s Gemini) to develop novel textual indices of policy pressures regarding monetary policy communication of central banks in speeches of 100 central banks from 1997 to 2023. Employing a staggered difference-in-differences and an instrumental variable approach, we find robust evidence that an increase in independence decreases the narrow focus on price stability and increases financial pressures discussed in monetary policy communication. These results are not, as generally is assumed, confounded by general changes in communication over time or singular events, in particular, the Global Financial Crisis.",
      downloads: [
        { type: "Paper", label: "Full Paper", url: "https://www.sciencedirect.com/science/article/pii/S017626802500028X" },
        { type: "Slides", label: "Presentation", url: "/papers/cbi_llm/CBI_LLM_presentation.pdf" },
        { type: "Repo", label: "Replication Files", url: "https://github.com/sbischl/cbi_llm_com" },
        { type: "Container", label: "Docker", url: "https://hub.docker.com/r/sbischl/cbi_llm_com" },
        { type: "Appendix", label: "Online Appendix", url: "/papers/cbi_llm/Appendix_EJPE.pdf" },
      ],
      mainFigure: {
        title: "The effect of central bank independence on policy pressures",
        image: "/papers/cbi_llm/main_graph_cbi_llm.png"
      },
      figureNote: "The event-study plots show the effect of changes central bank independence on monetary and financial policy pressures up to 12 years past the event."
    },
    {
      id: 2,
      category: "Paper",
      title: "Who Sets the Agenda of the European Central Bank? The Role of National Central Banks in the Eurosystem",
      authors: ["Lauren Leek"],
      date: "May 2025",
      link: "https://osf.io/preprints/socarxiv/pb24v_v1",
      abstract: "It has been well-established that central bank policy agendas are shaped by the spread of ideas, individual governors’ agency and economic and political pressures. However, in the case of the European Central Bank (ECB) the influence of the multi-level set-up of the Eurosystem consisting of both the ECB and National Central Banks (NCBs) is often not considered. How does this peculiar institutional setup shape the agenda? This study argues that NCBs act as intermediaries, channeling national and public priorities to the ECB level. Using a transformer model, alongside sequence and cross-sectional time-series analyses of ECB and NCB speeches from 1997 to 2024, I find that the ECB agenda and issue-responsiveness vis-a-vis `new' topics are driven primarily by NCBs. By revealing how NCBs shape what and when the ECB talks about certain topics, I also contribute more broadly to implications of the multi-level structure of the EU as well as how independent central banks and international organisations respond to outside pressures.",
      downloads: [
        { type: "Paper", label: "Full Paper", url: "https://osf.io/preprints/socarxiv/pb24v_v1" }
      ],
      mainFigure: {
        title: "Topic Transitions between central banks",
        image: "/papers/spread_of_ideas/main_graph_spread_of_ideas.png"
      },
      figureNote: "Markov Transition Matrix of central banks conditional on the topic"
    },
    {
      id: 3,
      category: "Paper",
      title: "Introducing Textual Measures of Central Bank Policy-Linkages Using ChatGPT",
      authors: ["Lauren Leek", "Simeon Bischl", "Maximilian Freier"],
      date: "February 2024",
      link: "https://osf.io/preprints/socarxiv/78wnp",
      abstract: "While institutionally independent, monetary policy-makers do not operate in a vacuum. The policy choices of a central bank are intricately linked to government policies and financial markets. We present novel indices of monetary, fiscal and financial policy-linkages based on central bank communication, namely, speeches by 118 central banks worldwide from 1997 to mid-2023. Our indices measure not only instances of monetary, fiscal or financial dominance but, importantly, also identify communication that aims to coordinate monetary policy with the government and financial markets. To create our indices, we use a Large Language Model (ChatGPT 3.5-0301) and provide transparent prompt-engineering steps, considering both accuracy on the basis of a manually coded dataset as well as efficiency regarding token usage. We also test several model improvements and provide descriptive statistics of the trends of the indices over time and across central banks including correlations with political-economic variables.",
      downloads: [
        { type: "PDF", label: "Full Paper", url: "https://osf.io/preprints/socarxiv/78wnp" },
        { type: "ZIP", label: "Replication Files", url: "https://github.com/sbischl/cb-policy-LLM" },
      ],
      mainFigure: {
        title: "Policy linkeages over time",
        image: "/papers/pressures_measurement/main_graph_measurement.png"
      },
      figureNote: "The graph shows the proportions of each of the five policy linkeages studies in the paper according to our ChatGPT-3.5 classification algorithm"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <PageHeader 
        tag="RESEARCH"
        title="Academic"
        titleAccent="papers"
        description="Explore our research on central bank communication and policy frameworks."
      />
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="space-y-8">
          {papers.map((paper, index) => (
            <div 
              key={paper.id} 
              id={paper.id === 1 ? 'cbi-llm' : paper.id === 2 ? 'agenda-setting' : 'textual-measures'}
              className="flex flex-col lg:flex-row gap-6 bg-white rounded-lg border p-4 sm:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex-1">
                <div className="space-y-4">
                  <div className="text-sm font-medium text-[#1a365d] mb-2 bg-amber-100/80 text-[#1a365d] px-2 py-1 rounded inline-block">
                    {paper.category}
                  </div>
                  {paper.link ? (
                    <Link href={paper.link} target="_blank" rel="noopener noreferrer">
                      <h2 className="text-lg sm:text-xl font-semibold text-[#1a365d] hover:underline transition-all cursor-pointer">
                        {paper.title}
                      </h2>
                    </Link>
                  ) : (
                    <h2 className="text-lg sm:text-xl font-semibold text-[#1a365d]">
                      {paper.title}
                    </h2>
                  )}
                  <div className="text-sm flex flex-wrap items-center">
                    {paper.authors.map((author, index) => (
                      <span key={index}>
                        <span className="font-medium text-[#4052A8] hover:text-[#1a365d] transition-colors">
                          {author}
                        </span>
                        {index < paper.authors.length - 1 && (
                          <span className="text-gray-400 mx-1">•</span>
                        )}
                      </span>
                    ))}
                    <span className="text-gray-400 mx-1">•</span>
                    <span className="text-gray-600">{paper.date}</span>
                    
                    {/* Display journal if available */}
                    {paper.journal && (
                      <>
                        <span className="text-gray-400 mx-1">•</span>
                        <span className="italic text-gray-600">{paper.journal}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">{paper.abstract}</p>
                  <div className="flex flex-wrap gap-2">
                    {paper.downloads.map((download, index) => (
                      <Link 
                        key={index}
                        className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 hover:text-[#4052A8]"
                        href={download.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Badge variant="outline" className="flex items-center justify-center gap-1.5 min-w-12 border-[#1a365d] py-1">
                          {getDownloadIcon(download.type)}
                          <span className="sr-only sm:not-sr-only">{download.type}</span>
                        </Badge>
                        {download.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-2/5">
                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <p className="font-medium text-sm text-[#1a365d] mb-1">Main Figure</p>
                      <p className="text-sm text-slate-600">{paper.mainFigure.title}</p>
                    </div>
                    <div 
                      className="group cursor-pointer transition-all duration-300"
                      onClick={() => setSelectedImage(paper.mainFigure.image)}
                    >
                      <img
                        alt="Paper thumbnail"
                        className="w-full h-auto transform transition-all duration-300 group-hover:scale-[1.02] group-hover:brightness-105"
                        src={paper.mainFigure.image}
                      />
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200">
                      <p className="text-xs text-slate-500 italic">
                        Note: {paper.figureNote}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="w-auto h-auto max-w-[min(95vw,1200px)] max-h-[90vh] p-0 overflow-hidden">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute right-3 top-3 z-50 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-colors hover:bg-white"
          >
            <X className="h-4 w-4 text-gray-700" />
            <span className="sr-only">Close</span>
          </button>
          <div className="w-full h-full flex items-center justify-center bg-white p-6">
            <img
              src={selectedImage || ''}
              alt="Enlarged figure"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}