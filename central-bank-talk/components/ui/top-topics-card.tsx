import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

type TopTopic = [string, number]

interface TopTopicsCardProps {
  topics: TopTopic[]
}

export default function TopTopicsCard({ topics }: TopTopicsCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-slate-800">
          <TrendingUp className="mr-2 h-5 w-5 text-primary" />
          Top 10 Topics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {topics.map(([topic, percentage], index) => (
            <li key={topic} className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700 capitalize">
                  {index + 1}. {topic}
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {(percentage * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${percentage * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}