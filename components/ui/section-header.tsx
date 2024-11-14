
interface SectionHeaderProps {
  title: string
  subtitle?: string
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="text-center mb-10">
      <div className="section-title mb-4">{title}</div>
      {subtitle && (
        <p className="text-2xl md:text-4xl max-w-3xl mx-auto leading-relaxed text-gray-800 font-light">
          {subtitle}
        </p>
      )}
    </div>
  )
}