import Link from "next/link"
import { ChevronLeft } from 'lucide-react'

interface PageHeaderProps {
  tag: string
  title?: string
  titleAccent?: string
  description?: string
  showBackButton?: boolean
}

export function PageHeader({ 
  tag, 
  title, 
  titleAccent, 
  description,
  showBackButton = true 
}: PageHeaderProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      {showBackButton && (
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-[hsl(var(--brand-primary))] transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      )}
      <div className="flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center justify-center rounded-full bg-amber-100 px-6 py-2 text-sm font-medium text-[hsl(var(--brand-primary))]">
          {tag}
        </div>
        {(title || titleAccent) && (
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {title} {" "}
              {titleAccent && <span className="text-[hsl(var(--brand-primary))]">{titleAccent}</span>}
            </h1>
            {description && (
              <p className="text-xl text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}