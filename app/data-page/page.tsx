"use client"

import { useState, useEffect, useRef, KeyboardEvent, useCallback } from 'react'
import Link from "next/link"
import { ArrowLeft, MapPin, TrendingUp, PieChart, BarChart, Search, User, Users, Coins, MessageSquare, FileText, List, BarChart2, PieChart as PieChartIcon, TrendingUp as TrendingUpIcon, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
// Removed useSearchParams and useRouter
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsDonutChart, Pie, Cell, Label, Sector } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import PolicyPressuresChart from '@/components/ui/policy-pressures-chart'
import InteractiveCentralBankMap from '@/components/ui/interactive-map'
import { SectionHeader } from "@/components/ui/section-header"
import { DataCard } from "@/components/ui/data-card"
import { PageHeader } from "@/components/ui/page-header"
import { InfoTooltip } from "@/components/ui/info-tooltip"

import { useData } from '@/contexts/DataContext'
import { useMemo } from 'react';

// Utility to invert an object mapping
function invertMapping(obj: Record<string, string>): Record<string, string> {
  const inverted: Record<string, string> = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      inverted[obj[key]] = key;
    }
  }
  return inverted;
}

export default function DataPage() {
  // Load country mapping at the top level (hook)
  const { data: countryNameToIso3 } = useData<Record<string, string>>("/data/country_name_to_iso3.json");
  const isoToCountry = useMemo(
    () => countryNameToIso3 ? invertMapping(countryNameToIso3) : {},
    [countryNameToIso3]
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [bankData, setBankData] = useState(null);
  const [centralBankKey, setCentralBankKey] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setCentralBankKey(params.get("central_bank"));
    }
  }, []);
  // router removed
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const [activeSection, setActiveSection] = useState("");

  const { data: centralBanks, isLoading, error } = useData("/data/central_banks/central_banks.json");

  useEffect(() => {
    // Always use the URL param if present, otherwise default to ECB
    const bankKey = centralBankKey || "european_central_bank";
    if (centralBanks && bankKey) {
      const bankNameRaw = centralBanks[bankKey] || bankKey.replace(/_/g, " ");
      // Capitalize display name (first letter of each word)
      const bankName = bankNameRaw.replace(/\b\w/g, l => l.toUpperCase());
      setSelectedBank({ key: bankKey, value: bankName });
      loadBankData({ key: bankKey, value: bankName });
    }
  }, [centralBankKey, centralBanks]);

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

      console.log("Bank data loaded:", data)
      
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
    setSelectedBank(bank);
    setSearchTerm(""); // Clear search box after selection
    setShowDropdown(false);
    await loadBankData(bank);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("central_bank", bank.key);
      window.history.replaceState({}, '', url.toString());
    }
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
  
  const AudienceDistributionCard = ({ audienceData, tooltipContent }) => {
    return (
      <Card className="shadow-lg">
        <div className="relative">
          <InfoTooltip content={tooltipContent} />
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-[hsl(var(--brand-primary))]" />
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
        </div>
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -35% 0%'
      }
    )

    const sections = ['key-facts', 'communication-frequency', 'audience-distribution', 'policy-pressures']
    sections.forEach(id => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const TableOfContents = useCallback(() => {
    const sections = [
      { id: 'key-facts', title: 'Key Facts & Topics', icon: List },
      { id: 'communication-frequency', title: 'Communication Frequency', icon: TrendingUpIcon },
      { id: 'audience-distribution', title: 'Audience Distribution', icon: PieChartIcon },
      { id: 'policy-pressures', title: 'Policy Pressures', icon: BarChart }
    ]

    return (
      <Card className="shadow-lg mt-4">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <List className="mr-2 h-5 w-5 text-[hsl(var(--brand-primary))]" />
            Table of Contents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <nav className="space-y-1">
            {sections.map(({ id, title, icon: Icon }) => (
              <Link
                key={id}
                href={`#${id}`}
                className={`
                  flex items-center px-3 py-2 text-sm rounded-md transition-colors
                  ${activeSection === id 
                    ? 'bg-[hsl(var(--brand-primary))] text-white' 
                    : 'text-gray-600 hover:bg-gray-100'}
                `}
              >
                <Icon className={`mr-2 h-4 w-4 ${activeSection === id ? 'text-white' : 'text-[hsl(var(--brand-primary))]'}`} />
                {title}
              </Link>
            ))}
          </nav>
        </CardContent>
      </Card>
    )
  }, [activeSection])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const communicationData = getCommunicationData(
    bankData?.year || [],
    bankData?.number_of_speeches || []
  )

  const audienceData = getAudienceData()

  const AUDIENCE_DESCRIPTIONS = {
    "academic": "Speeches delivered at universities, research institutions, and academic conferences",
    "central bank": "Communication aimed at a general central banking audience like press conferences",
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
    <div className="page-container">
      <PageHeader 
        tag="CENTRAL BANK DATA"
        title="Analyze central bank"
        titleAccent="communication"
        description="Explore detailed analytics and insights about central bank speeches."
      />
      <div className="section-container">
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-4">
            <Link 
              href="#key-facts" 
              className="flex flex-col items-center p-4 space-y-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
            >
              <List className="h-6 w-6 text-[hsl(var(--brand-primary))]" />
              <span className="text-sm font-medium text-gray-700">Key Facts & Topics</span>
            </Link>
            <Link 
              href="#communication-frequency" 
              className="flex flex-col items-center p-4 space-y-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
            >
              <TrendingUpIcon className="h-6 w-6 text-[hsl(var(--brand-primary))]" />
              <span className="text-sm font-medium text-gray-700">Communication Frequency</span>
            </Link>
            <Link 
              href="#audience-distribution" 
              className="flex flex-col items-center p-4 space-y-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
            >
              <PieChartIcon className="h-6 w-6 text-[hsl(var(--brand-primary))]" />
              <span className="text-sm font-medium text-gray-700">Audience Distribution</span>
            </Link>
            <Link 
              href="#policy-pressures" 
              className="flex flex-col items-center p-4 space-y-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
            >
              <BarChart className="h-6 w-6 text-[hsl(var(--brand-primary))]" />
              <span className="text-sm font-medium text-gray-700">Policy Pressures</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-[hsl(var(--brand-primary))]" />
                    Search Central Banks
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
                        className="w-full"
                        autoComplete="off"
                        spellCheck={false}
                        ref={inputRef}
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
              </Card>
              <TableOfContents />
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-lg" id="key-facts">
              <div className="relative">
                <InfoTooltip 
                  content="Topics extracted by Google Gemini on the speech level."
                  link={{
                    text: "How Central Bank Independence Shapes Monetary Policy Communication: A Large Language Model Application",
                    href: "#cbi-llm"
                  }}
                />
                <CardHeader>
                  <CardTitle className="text-2xl text-blue-900">
                    {selectedBank ? selectedBank.value : "Select a central bank"}
                  </CardTitle>
                  <CardDescription>
                    {bankData?.country && isoToCountry[bankData.country]
                      ? `Central Bank of ${isoToCountry[bankData.country]}`
                      : bankData?.country ? `Central Bank of ${bankData.country}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800 mb-4">Key Facts</h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <MessageSquare className="h-5 w-5 text-[hsl(var(--brand-primary))] mr-2" />
                          <span className="text-sm font-medium text-slate-700">Number of Speeches:</span>
                          <span className="ml-auto text-sm font-bold text-slate-900">
                            {bankData ? bankData.number_of_speeches.reduce((a, b) => a + b, 0) : 'N/A'}
                          </span>
                        </div>
                        
                        <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
                        
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-[hsl(var(--brand-primary))] mr-2" />
                          <span className="text-sm font-medium text-slate-700">Unique Speakers:</span>
                          <span className="ml-auto text-sm font-bold text-slate-900">
                            {bankData ? bankData.number_of_speakers : 'N/A'}
                          </span>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
                        
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <User className="h-5 w-5 text-[hsl(var(--brand-primary))] mr-2" />
                            <span className="text-sm font-medium text-slate-700">Top 3 Speakers:</span>
                          </div>
                          {bankData && getTopSpeakers(bankData.speakers).map((speaker, index) => (
                            <div
                              key={speaker.name}
                              className="flex items-center space-x-2 ml-7 text-sm text-slate-900"
                            >
                              <span className="text-[hsl(var(--brand-primary))] font-semibold">{index + 1}.</span>
                              <span>{speaker.name}</span>
                              <span className="text-slate-500">({speaker.count})</span>
                            </div>
                          ))}
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
                        
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-[hsl(var(--brand-primary))] mr-2" />
                          <span className="text-sm font-medium text-slate-700">Headquarters:</span>
                          <span className="ml-auto text-sm font-bold text-slate-900">
                            {bankData ? bankData.cb_location : 'N/A'}
                          </span>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
                        
                        <div className="flex items-center">
                          <Coins className="h-5 w-5 text-[hsl(var(--brand-primary))] mr-2" />
                          <span className="text-sm font-medium text-slate-700">Currency:</span>
                          <span className="ml-auto text-sm font-bold text-slate-900">
                            {bankData ? bankData.currency : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800 mb-4" id="top-topics">Top 10 Topics</h3>
                      <ul className="space-y-3">
                        {bankData?.top_topics?.slice(0, 10).map(([topic, percentage], index) => (
                          <li key={topic} className="flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-slate-700 capitalize">
                                {index + 1}. {topic}
                              </span>
                              <span className="text-sm font-semibold text-slate-900">
                                {(percentage * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full">
                              <div 
                                className="bg-[hsl(var(--brand-primary))] h-2 rounded-full transition-all duration-300 ease-in-out"
                                style={{ width: `${percentage * 100}%` }}
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            <Card className="shadow-lg" id="communication-frequency">
              <div className="relative">
                <InfoTooltip 
                  content="The graphs show the number of speeches of the central bank in the BIS speeches database."
                />
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-[hsl(var(--brand-primary))]" />
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
                          stroke="hsl(var(--brand-primary))"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </div>
            </Card>

            <div id="audience-distribution">
              <AudienceDistributionCard 
                audienceData={audienceData}
                tooltipContent="Audiences labelled by Google Gemini based on the descriptions included in the BIS speeches database."
              />
            </div>

            {bankData && (
              <div id="policy-pressures">
                <Card className="shadow-lg">
                  <PolicyPressuresChart bankData={bankData} />
                </Card>
              </div>
            )}

            {/* Sentiment Analysis card remains the same */}
            {/* ... */}
          </div>
        </div>
      </div>
    </div>
  )
}