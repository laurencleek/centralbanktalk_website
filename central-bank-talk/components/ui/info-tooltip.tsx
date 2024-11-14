
import { Info } from 'lucide-react'

interface InfoTooltipProps {
  content: string
  link?: { text: string, href: string }
}

export function InfoTooltip({ content, link }: InfoTooltipProps) {
  return (
    <div className="absolute top-4 right-4 group z-10">
      <Info className="h-5 w-5 text-[hsl(var(--brand-primary))] cursor-help" />
      <div className="hidden group-hover:block absolute right-0 w-80 p-2 bg-white border border-gray-200 rounded-lg shadow-lg text-sm">
        {content}
        {link && (
          <span className="block mt-1">
            See{' '}
            <a href={link.href} className="text-[hsl(var(--brand-primary))] hover:underline">
              {link.text}
            </a>
            {' '}for more details.
          </span>
        )}
      </div>
    </div>
  )
}