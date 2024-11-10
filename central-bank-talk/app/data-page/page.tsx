"use client"

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import Link from "next/link"
import { ArrowLeft, MapPin, TrendingUp, PieChart, BarChart, Search, User, Users, MessageSquare, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsDonutChart, Pie, Cell, Label, Sector } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import PolicyPressuresChart from '@/components/ui/policy-pressures-chart'
import InteractiveCentralBankMap from '@/components/ui/interactive-map'

import { useData } from '@/contexts/DataContext'

export default function DataPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredBanks, setFilteredBanks] = useState([])
  const [selectedBank, setSelectedBank] = useState(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [bankData, setBankData] = useState(null)
  const preselectedBank = { key: "european_central_bank", value: "European Central Bank" }
  const dropdownRef = useRef(null)

  const { data: centralBanks, isLoading, error } = useData("/data/central_banks/central_banks.json")

  useEffect(() => {
    if (!selectedBank) {
      setSearchTerm(preselectedBank.value)
      loadBankData(preselectedBank)
    }
  }, [])

  const getAudienceData = () => {
    if (!bankData?.audiences) {
      return []
    }
    
    try {
      const total = Object.values(bankData.audiences).reduce((sum, value) => sum + Number(value), 0)
      if (total === 0) return []
      
      return Object.entries(bankData.audiences).map(([key, value]) => ({
        name: key.replace('_', ' '),
        value: (Number(value) / total) * 100
      }))
    } catch (error) {
      console.error("Error processing audience data:", error)
      return []
    }
  }
  
  const loadBankData = async (bank) => {
    try {
      const bankKey = bank.key.toLowerCase().replace(/ /g, '_')
      const response = await fetch(`/data/central_banks/${bankKey}.json`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      setBankData({
        ...data,
        audiences: data.audiences || {},
        speakers: data.speakers || {},
        number_of_speeches: data.number_of_speeches || [],
        year: data.year || [],
        number_of_speakers: data.number_of_speakers || 0
      })
    } catch (error) {
      console.error("Error loading bank data:", error)
      setBankData(null)
    }
  }

  useEffect(() => {
    if (centralBanks && searchTerm && showDropdown) {
      const filtered = Object.entries(centralBanks)
        .filter(([key, value]) => 
          key.toLowerCase().includes(searchTerm.toLowerCase()) || 
          value.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(([key, value]) => ({ key, value }))
      setFilteredBanks(filtered)
      setHighlightedIndex(-1)
    } else {
      setFilteredBanks([])
    }
  }, [searchTerm, centralBanks, showDropdown])

  const handleBankSelect = async (bank) => {
    setSelectedBank(bank)
    setSearchTerm(bank.value)
    setShowDropdown(false)
    await loadBankData(bank)
  }

  const handleSearchFocus = () => {
    setShowDropdown(true)
    if (!selectedBank) {
      setSearchTerm("")
    }
  }

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <text
          x={cx + (outerRadius + 30) * Math.cos(-((startAngle + endAngle) / 2) * Math.PI / 180)}
          y={cy + (outerRadius + 30) * Math.sin(-((startAngle + endAngle) / 2) * Math.PI / 180)}
          textAnchor="middle"
          fill="#666"
          className="text-xs font-medium"
        >
          {`${payload.name} (${value.toFixed(1)}%)`}
        </text>
      </g>
    )
  }
  
  const AudienceDistributionCard = ({ audienceData }) => {
    return (
      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center">
            <PieChart className="mr-2 h-5 w-5 text-blue-600" />
            Audience Distribution
          </CardTitle>
          <CardDescription>
            Distribution of speech audiences by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {audienceData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsDonutChart>
                    <Pie
                      data={audienceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {audienceData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={AUDIENCE_COLORS[entry.name]} 
                          className="stroke-background hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 border border-gray-300 rounded shadow">
                              <p className="text-sm font-bold">{`${payload[0].name}: ${payload[0].value.toFixed(1)}%`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RechartsDonutChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {audienceData.map((entry) => (
                  <div key={entry.name} className="space-y-1">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: AUDIENCE_COLORS[entry.name] }}
                      />
                      <span className="text-sm font-medium capitalize">
                        {entry.name} ({entry.value.toFixed(1)}%)
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-5">
                      {AUDIENCE_DESCRIPTIONS[entry.name]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground">No audience data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prevIndex) => 
        prevIndex < filteredBanks.length - 1 ? prevIndex + 1 : prevIndex
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0))
    } else if (e.key === 'Enter' && highlightedIndex !== -1) {
      handleBankSelect(filteredBanks[highlightedIndex])
    }
  }

  useEffect(() => {
    if (dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex]
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex])

  const highlightMatch = (text: string, search: string) => {
    if (!search) return text
    const parts = text.split(new RegExp(`(${search})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === search.toLowerCase() ? 
        <span key={i} className="bg-yellow-200">{part}</span> : part
    )
  }

  const getTopSpeakers = (speakers) => {
    if (!speakers) return []
    return Object.entries(speakers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }))
  }

  const getCommunicationData = (years, speechCounts) => {
    if (!years || !speechCounts) return []
    return years.map((year, index) => ({
      year: year.toString(),
      speeches: speechCounts[index]
    }))
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const communicationData = getCommunicationData(
    bankData?.year || [],
    bankData?.number_of_speeches || []
  )

  const audienceData = getAudienceData()

  const AUDIENCE_DESCRIPTIONS = {
    "academic": "Speeches delivered at universities, research institutions, and academic conferences",
    "central bank": "Communications aimed at other central banks and monetary policy institutions",
    "financial market": "Addresses to financial sector participants, banks, and market analysts",
    "political": "Speeches to government bodies, parliaments, and policy makers"
  }
  
  const AUDIENCE_COLORS = {
    "academic": "hsl(var(--chart-1))",
    "central bank": "hsl(var(--chart-2))",
    "financial market": "hsl(var(--chart-3))",
    "political": "hsl(var(--chart-4))"
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-blue-900 hover:text-blue-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mt-4 md:mt-0">Central Bank Data</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                    Map of Central Banks
                  </CardTitle>
                  <CardDescription>
                    <div className="mt-2 relative">
                      <Input
                        type="text"
                        placeholder="Search central banks..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          setShowDropdown(true)
                        }}
                        onFocus={handleSearchFocus}
                        onKeyDown={handleKeyDown}
                        className={`w-full ${!selectedBank && !showDropdown ? 'text-gray-400' : ''}`}
                      />
                      {showDropdown && filteredBanks.length > 0 && (
                        <div 
                          ref={dropdownRef}
                          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                        >
                          {filteredBanks.map((bank, index) => (
                            <div
                              key={bank.key}
                              className={`px-4 py-2 cursor-pointer ${
                                index === highlightedIndex ? 'bg-gray-100' : 'hover:bg-gray-100'
                              }`}
                              onClick={() => handleBankSelect(bank)}
                            >
                              {highlightMatch(bank.value, searchTerm)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-300">
                    <p className="text-lg font-semibold">Interactive Map Placeholder</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-900">
                  {selectedBank ? selectedBank.value : preselectedBank.value}
                </CardTitle>
                <CardDescription>
                  Central Bank of {selectedBank ? selectedBank.value : preselectedBank.value}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800 mb-4">Key Facts</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-slate-700">Number of Speeches:</span>
                        <span className="ml-auto text-sm font-bold text-slate-900">
                          {bankData ? bankData.number_of_speeches.reduce((a, b) => a + b, 0) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-slate-700">Unique Speakers:</span>
                        <span className="ml-auto text-sm font-bold text-slate-900">
                          {bankData ? bankData.number_of_speakers : 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-slate-700">Top 3 Speakers:</span>
                        </div>
                        {bankData && getTopSpeakers(bankData.speakers).map((speaker, index) => (
                          <div key={speaker.name} className="ml-7 text-sm text-slate-900">
                            {speaker.name} ({speaker.count})
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-slate-700">Avg. Speech Length:</span>
                        <span className="ml-auto text-sm font-bold text-slate-900">2,500 words</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800 mb-4">Top 10 Topics</h3>
                    <ol className="space-y-2">
                      {[
                        "Monetary Policy",
                        "Economic Outlook",
                        "Financial Stability",
                        "Inflation",
                        "Employment",
                        "Interest Rates",
                        "Banking Regulation",
                        "Digital Currencies",
                        "Global Economy",
                        "Fiscal Policy"
                      ].map((topic, index) => (
                        <li key={topic} className="flex items-center">
                          <Badge variant="outline" className="mr-2 w-6 h-6 rounded-full">
                            {index + 1}
                          </Badge>
                          <span className="text-sm text-slate-700">{topic}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                  Communication Frequency Over Time
                </CardTitle>
                <CardDescription>Number of speeches per year</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    frequency: {
                      label: "Number of Speeches",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={communicationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="year" 
                        stroke="#6b7280"
                        tickFormatter={(value) => value}
                      />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-2 border border-gray-300 rounded shadow">
                                <p className="text-sm">{`Year: ${payload[0].payload.year}`}</p>
                                <p className="text-sm font-bold">{`Number of Speeches: ${payload[0].value}`}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="speeches"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <AudienceDistributionCard audienceData={audienceData}/>

            {bankData && (
            <PolicyPressuresChart bankData={bankData} />
            )}

<InteractiveCentralBankMap />

            {/* Sentiment Analysis card remains the same */}
            {/* ... */}
          </div>
        </div>
      </main>
    </div>
  )
}