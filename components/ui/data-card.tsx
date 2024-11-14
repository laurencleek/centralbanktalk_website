
import { Card, CardContent, CardHeader, CardTitle } from "./card"

interface DataCardProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

export function DataCard({ icon, title, children }: DataCardProps) {
  return (
    <Card className="hover-lift card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-slate-800">
          {icon}
          <span className="ml-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}