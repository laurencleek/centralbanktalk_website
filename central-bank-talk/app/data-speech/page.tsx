"use client"

import { useState } from 'react'
import Link from "next/link"
import { ArrowLeft, Search, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for demonstration
const mockSpeeches = [
  { id: 1, url: "https://example.com/speech1", date: "2023-01-15", speaker: "John Doe", cb: "Federal Reserve", extract: "Monetary policy remains accommodative..." },
  { id: 2, url: "https://example.com/speech2", date: "2023-02-20", speaker: "Jane Smith", cb: "European Central Bank", extract: "Inflation expectations are well-anchored..." },
  { id: 3, url: "https://example.com/speech3", date: "2023-03-10", speaker: "Alice Johnson", cb: "Bank of England", extract: "Digital currencies and their impact on monetary policy..." },
  { id: 4, url: "https://example.com/speech4", date: "2023-04-05", speaker: "Bob Williams", cb: "Bank of Japan", extract: "The role of central banks in addressing climate change..." },
  { id: 5, url: "https://example.com/speech5", date: "2023-05-12", speaker: "Carol Brown", cb: "Federal Reserve", extract: "Labor market dynamics and their implications for monetary policy..." },
]

export default function DataPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpeech, setSelectedSpeech] = useState(null)
  const [year, setYear] = useState("")
  const [cb, setCb] = useState("")
  const [location, setLocation] = useState("")

  const filteredSpeeches = mockSpeeches.filter(speech =>
    (speech.extract.toLowerCase().includes(searchTerm.toLowerCase()) ||
     speech.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
     speech.cb.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (year === "" || speech.date.includes(year)) &&
    (cb === "" || speech.cb === cb) &&
    (location === "" || speech.speaker.includes(location))
  )

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) {
      return <span>{text}</span>
    }
    const regex = new RegExp(`(${highlight})`, 'gi')
    const parts = text.split(regex)
    return (
      <span>
        {parts.filter(String).map((part, i) => 
          regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : <span key={i}>{part}</span>
        )}
      </span>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <main className="flex-1 container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center text-blue-900 hover:text-blue-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold ml-4">Data (Speeches)</h1>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          <div className="flex space-x-4">
            <Input
              placeholder="Search speeches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Button>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
          <div className="flex space-x-4">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {["2023", "2022", "2021", "2020"].map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={cb} onValueChange={setCb}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Central Bank" />
              </SelectTrigger>
              <SelectContent>
                {["Federal Reserve", "European Central Bank", "Bank of England", "Bank of Japan"].map((bank) => (
                  <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {["New York", "Frankfurt", "London", "Tokyo"].map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Speaker</TableHead>
              <TableHead>Central Bank</TableHead>
              <TableHead>Extract</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSpeeches.map((speech) => (
              <TableRow key={speech.id}>
                <TableCell>{speech.date}</TableCell>
                <TableCell>{highlightText(speech.speaker, searchTerm)}</TableCell>
                <TableCell>{highlightText(speech.cb, searchTerm)}</TableCell>
                <TableCell className="max-w-md truncate">{highlightText(speech.extract, searchTerm)}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedSpeech(speech)}>
                        View Full Speech
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>{speech.speaker} - {speech.date}</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Full Speech</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          This is a placeholder for the full speech text. In a real application, 
                          you would fetch and display the complete speech content here.
                        </p>
                        <Button asChild>
                          <a href={speech.url} target="_blank" rel="noopener noreferrer">
                            View Original <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </div>
  )
}