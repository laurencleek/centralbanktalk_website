import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function Papers() {
  const papers = [
    {
      id: 1,
      category: "Paper",
      title: "How Central Bank Independence Shapes Monetary Policy Communication: A Large Language Model Application",
      authors: ["Lauren Leek", "Simeon Bischl"],
      date: "JULY 2024",
      abstract: "Although central bank communication is a core monetary policy and accountability tool for central banks, little is known about what shapes it. This paper develops and tests a theory regarding a previously unconsidered variable: central bank independence (CBI). We argue that increases in CBI alter the pressures a central bank faces and amends the reputation costs of not addressing these. We fine-tune and validate a Large Language Model (Google's Gemini) to develop novel monetary policy indices in speeches of 100 central banks from 1997 to 2023. Employing a staggered difference-in-differences and an instrumental variable approach, we find robust evidence that an increase in independence decreases communication portraying central banks to be in full control of their monetary policy conduct and increases communication reflecting financial pressures. These results are not, as generally is assumed, confounded by general changes in communication over time or singular events, in particular, the financial crisis.",
      downloads: [
        { type: "PDF", label: "Presentation Slides" },
      ]
    },
    {
      id: 2,
      category: "Paper",
      title: "Agenda-Setting and Responsiveness: How National Central Banks Shape the Eurozone Agenda",
      authors: ["Lauren Leek"],
      date: "JUNE 2024",
      abstract: "It has been well-established that central bank policy agendas are shaped by various factors, including the spread of ideas, individual governors' agency, and economic and political pressures. However, most responsiveness and agenda-setting studies treat central banks as relatively autonomous entities, overlooking the unique multi-layered structure of the Eurosystem, which includes both the European Central Bank (ECB) and National Central Banks (NCBs). How does this institutional setup influence responsiveness and agenda-setting dynamics within the Eurosystem? This study argues that NCBs act as intermediaries, channeling national priorities to the ECB level. Using a transformer model for topic modeling, alongside sequence and cross-sectional time-series analyses of ECB and NCB speeches from 1997 to mid-2022, I find that 'new' agenda issues are driven primarily by NCBs' informational roles, while established issues respond to pressures from member states. By revealing how institutional structure shapes issue responsiveness, I contribute to how central banks balance national pressures with broader mandates revealing how responsiveness is not uniform but influenced by hierarchical structures and internal member dynamics.",
      downloads: []
    },
    {
      id: 3,
      category: "Paper",
      title: "Introducing Textual Measures of Central Bank Policy-Linkages Using ChatGPT",
      authors: ["Lauren Leek", "Simeon Bischl", "Maximilian Freier"],
      date: "PREPRINT FEBRUARY 2024",
      abstract: "While institutionally independent, monetary policy-makers do not operate in a vacuum. The policy choices of a central bank are intricately linked to government policies and financial markets. We present novel indices of monetary, fiscal and financial policy-linkages based on central bank communication, namely, speeches by 118 central banks worldwide from 1997 to mid-2023. Our indices measure not only instances of monetary, fiscal or financial dominance but, importantly, also identify communication that aims to coordinate monetary policy with the government and financial markets. To create our indices, we use a Large Language Model (ChatGPT 3.5-0301) and provide transparent prompt-engineering steps, considering both accuracy on the basis of a manually coded dataset as well as efficiency regarding token usage. We also test several model improvements and provide descriptive statistics of the trends of the indices over time and across central banks including correlations with political-economic variables.",
      downloads: [
        { type: "PDF", label: "Full Paper" },
        { type: "ZIP", label: "Replication Files" },
      ]
    }
  ]

  return (
    <main className="flex-1 py-12 bg-gradient-to-b from-[#F8F9FF] to-white">
      <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h1 className="text-4xl font-light text-[#4052A8] bg-[#E6E9F4] px-8 py-2 rounded-full shadow-sm">Research Output</h1>
            <p className="text-2xl text-[#1a365d] max-w-[900px] font-light leading-relaxed mt-8">
              Work in progress, stay tuned
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
            <Input 
              className="w-full border-gray-200" 
              placeholder="Search papers" 
              type="search" 
            />
            <Select>
              <SelectTrigger className="w-full border-gray-200">
                <SelectValue placeholder="Select author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                <SelectItem value="leek">Lauren Leek</SelectItem>
                <SelectItem value="bischl">Simeon Bischl</SelectItem>
                <SelectItem value="freier">Maximilian Freier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-12">
            {papers.map((paper, index) => (
              <div key={paper.id} className="flex flex-col md:flex-row gap-8 bg-white rounded-lg border p-6">
                <div className="w-full md:w-2/5">
                  <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      alt="Paper thumbnail"
                      className="object-cover w-full h-full"
                      height={400}
                      src={index === 0 ? "/papers/paper1.png" : 
                           index === 1 ? "/papers/paper2.png" : 
                           "/papers/paper3.png"}
                      width={533}
                    />
                  </div>
                </div>
                <div className="flex-1 md:pl-6">
                  <div className="text-sm font-medium text-[#1a365d] mb-2 bg-[#1a365d] text-white px-2 py-1 rounded inline-block">{paper.category}</div>
                  <h2 className="text-xl font-semibold text-[#1a365d] mb-2">{paper.title}</h2>
                  <p className="text-gray-600 mb-2 font-light text-[#1a365d]">{paper.authors.join(", ").replace("Freier, Maximilian", "Maximilian Freier")}</p>
                  <p className="text-sm text-gray-500 mb-4 font-light text-[#1a365d]">{paper.date}</p>
                  <p className="text-sm text-gray-700 mb-4 font-light text-[#1a365d]">{paper.abstract}</p>
                  <div className="space-y-2">
                    {paper.downloads.map((download, index) => (
                      <Link 
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4052A8] font-light"
                        href="#"
                      >
                        <Badge variant="outline" className="w-12 border-[#1a365d]">
                          {download.type}
                        </Badge>
                        {download.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
      </div>
    </main>
  )
}