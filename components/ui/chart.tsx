"use client"

import { TooltipProps } from "recharts"
import { Card } from "@/components/ui/card"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartProps {
  config: ChartConfig
  className?: string
  children: React.ReactNode
}

export function ChartContainer({
  config,
  className,
  children,
}: ChartProps) {
  return (
    <div className={className}>
      <style jsx global>{`
        :root {
          ${Object.entries(config).map(
            ([key, value]) => `
            --color-${key}: ${value.color};
          `
          )}
        }
      `}</style>
      {children}
    </div>
  )
}

interface ChartTooltipProps extends TooltipProps<any, any> {
  className?: string
}

export function ChartTooltip({
  active,
  payload,
  label,
  className,
}: ChartTooltipProps) {
  if (!active || !payload) {
    return null
  }

  return (
    <Card className={className}>
      <div className="p-2">
        <div className="text-sm font-medium text-muted-foreground mb-1">{label}</div>
        {payload.map((item: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <span className="text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function ChartTooltipContent({
  active,
  payload,
  label,
}: TooltipProps<any, any>) {
  if (!active || !payload) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {label}
          </span>
          <span className="font-bold text-muted-foreground">
            {payload[0]?.value}
          </span>
        </div>
      </div>
    </div>
  )
}