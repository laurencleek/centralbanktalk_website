import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { ExternalLink } from "lucide-react"

interface PolicyPressuresChartProps {
  bankData: {
    year: number[];
    monetary_dominance_yearly: number[];
    fiscal_dominance_yearly: number[];
    financial_dominance_yearly: number[];
  };
}

export default function PolicyPressuresChart({ bankData }: PolicyPressuresChartProps) {
  const chartData = bankData.year.map((year, index) => ({
    year,
    monetary: Number((bankData.monetary_dominance_yearly[index] * 100).toFixed(2)),
    fiscal: Number((bankData.fiscal_dominance_yearly[index] * 100).toFixed(2)),
    financial: Number((bankData.financial_dominance_yearly[index] * 100).toFixed(2)),
  }));

  return (
    <Card className="shadow-lg">
      <div className="relative">
        <InfoTooltip 
          content="We define these based on responses of central banks to pressures. For more information on the index construction and examples see the paper Introducing Textual Measures of Central Bank Policy-Linkages Using ChatGPT."
          link={{
            text: "Introducing Textual Measures of Central Bank Policy-Linkages Using ChatGPT",
            href: "#textual-measures"
          }}
        />
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-5 w-5 text-[hsl(var(--brand-primary))]"
            >
              <path d="M2 20h20" />
              <path d="M5 17A13 13 0 0 0 18 4" />
              <path d="M5 14v3" />
              <path d="M18 4h3v3" />
            </svg>
            Policy Pressures Over Time
          </CardTitle>
          <CardDescription>Trends in monetary, fiscal, and financial dominance</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              monetary: {
                label: "Monetary Dominance",
                color: "hsl(var(--chart-1))",
              },
              fiscal: {
                label: "Fiscal Dominance",
                color: "hsl(var(--chart-2))",
              },
              financial: {
                label: "Financial Dominance",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="year" 
                  className="text-sm" 
                  tickMargin={10}
                  tickFormatter={(value) => value.toString()}
                />
                <YAxis 
                  className="text-sm"
                  tickMargin={10}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Year
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {label}
                              </span>
                            </div>
                            {payload.map((entry) => (
                              <div key={entry.name} className="flex flex-col">
                                <span 
                                  className="text-[0.70rem] uppercase"
                                  style={{ color: entry.color }}
                                >
                                  {entry.name}
                                </span>
                                <span className="font-bold" style={{ color: entry.color }}>
                                  {Number(entry.value).toFixed(2)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      return (
                        <div className="flex justify-center gap-6 pt-2">
                          {payload.map((entry) => (
                            <div key={entry.value} className="flex items-center gap-2">
                              <div 
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm font-medium">
                                {entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="monetary"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Monetary Dominance"
                />
                <Line
                  type="monotone"
                  dataKey="fiscal"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Fiscal Dominance"
                />
                <Line
                  type="monotone"
                  dataKey="financial"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Financial Dominance"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          {/* Source attribution */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 flex items-center">
              Source: 
              <a 
                href="https://www.sciencedirect.com/science/article/pii/S017626802500028X" 
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-[hsl(var(--brand-primary))] hover:underline flex items-center"
              >
                Leek & Bischl (2024)
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </p>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}