"use client"
import { Award } from "lucide-react"
import { Badge, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui"
interface SpecialtyBadgeProps {
  specialty: string
  variant?: "default" | "secondary" | "outline" | "destructive"
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
  className?: string
}
export function SpecialtyBadge({
  specialty,
  variant = "secondary",
  size = "md",
  showIcon = true,
  className = "",
}: SpecialtyBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  }
  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={variant}
            className={`${sizeClasses[size]} ${className} inline-flex items-center gap-1`}
          >
            {showIcon && (
              <Award className={`${iconSizes[size]} shrink-0`} />
            )}
            <span className="truncate max-w-[150px]">{specialty}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Specialty: {specialty}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
interface SpecialtyBadgeListProps {
  specialties: string[]
  maxDisplay?: number
  variant?: "default" | "secondary" | "outline" | "destructive"
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
  className?: string
}
export function SpecialtyBadgeList({
  specialties,
  maxDisplay = 3,
  variant = "secondary",
  size = "sm",
  showIcon = true,
  className = "",
}: SpecialtyBadgeListProps) {
  if (specialties.length === 0) {
    return null
  }
  const displayedSpecialties = specialties.slice(0, maxDisplay)
  const remainingCount = specialties.length - maxDisplay
  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {displayedSpecialties.map((specialty) => (
        <SpecialtyBadge
          key={specialty}
          specialty={specialty}
          variant={variant}
          size={size}
          showIcon={showIcon}
        />
      ))}
      {remainingCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={size === "sm" ? "text-xs" : "text-sm"}>
                +{remainingCount} more
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {specialties.slice(maxDisplay).map((specialty) => (
                  <p key={specialty} className="text-sm">
                    {specialty}
                  </p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}