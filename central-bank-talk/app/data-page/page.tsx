"use client"

import { useState } from 'react'
import Link from "next/link"
import { ArrowLeft, MapPin, TrendingUp, PieChart, BarChart, Search, User, Users, MessageSquare, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"

// Placeholder data for charts
const communicationData = [
  { month: "Jan", value: 100 },
  { month: "Feb", value: 120 },
  { month: "Mar", value: 110 },
  { month: "Apr", value: 140 },
  { month: "May", value: 130 },
  { month: "Jun", value: 160 },
]

const topicData = [
  { topic: "Monetary Policy", value: 40 },
  { topic: "Economic Outlook", value: 30 },
  { topic: "Financial Stability", value: 20 },
  { topic: "Other", value: 10 },
]

const sentimentData = [
  { month: "Jan", positive: 60, neutral: 30, negative: 10 },
  { month: "Feb", positive: 55, neutral: 35, negative: 10 },
  { month: "Mar", positive: 65, neutral: 25, negative: 10 },
  { month: "Apr", positive: 70, neutral: 20, negative: 10 },
  { month: "May", positive: 60, neutral: 30, negative: 10 },
  { month: "Jun", positive: 75, neutral: 20, negative: 5 },
]

export default function DataPage() {
  const [searchTerm, setSearchTerm] = useState("")

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
          {/* Left Column - Map of Central Banks */}
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                    Map of Central Banks
                  </CardTitle>
                  <CardDescription>
                    <div className="mt-2">
                      <Input
                        type="text"
                        placeholder="Search central banks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
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

          {/* Right Column - Central Bank Information */}
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-900">Federal Reserve</CardTitle>
                <CardDescription>Central Bank of the United States</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800 mb-4">Key Facts</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-slate-700">Number of Speeches:</span>
                        <span className="ml-auto text-sm font-bold text-slate-900">1,245</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-slate-700">Unique Speakers:</span>
                        <span className="ml-auto text-sm font-bold text-slate-900">87</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-slate-700">Most Frequent Speaker:</span>
                        <span className="ml-auto text-sm font-bold text-slate-900">Jerome Powell (124)</span>
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

            {/* Chart 1 - Communication Frequency */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                  Communication Frequency Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    frequency: {
                      label: "Frequency",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={communicationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip content={<ChartTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--color-frequency)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Chart 2 - Topic Distribution */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5 text-blue-600" />
                  Topic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    topics: {
                      label: "Topics",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={topicData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="topic" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip content={<ChartTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--color-topics)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Chart 3 - Sentiment Analysis */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5 text-blue-600" />
                  Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    positive: {
                      label: "Positive",
                      color: "hsl(var(--chart-3))",
                    },
                    neutral: {
                      label: "Neutral",
                      color: "hsl(var(--chart-4))",
                    },
                    negative: {
                      label: "Negative",
                      color: "hsl(var(--chart-5))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sentimentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="positive" stroke="var(--color-positive)" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="neutral" stroke="var(--color-neutral)" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="negative" stroke="var(--color-negative)" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}