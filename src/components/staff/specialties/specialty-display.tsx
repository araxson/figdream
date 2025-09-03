"use client"
import { Award, Star, TrendingUp } from "lucide-react"

interface SpecialtyDisplayProps {
  specialties: string[]
  rating?: number
  reviewCount?: number
  className?: string
  variant?: "compact" | "detailed" | "card"
}
export function SpecialtyDisplay({
  specialties,
  rating,
  reviewCount,
  className = "",
  variant = "compact",
}: SpecialtyDisplayProps) {
  if (specialties.length === 0 && variant !== "card") {
    return null
  }
  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        {specialties.map((specialty) => (
          <TooltipProvider key={specialty}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary">
                  <Award className="mr-1 h-3 w-3" />
                  {specialty}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Specialized in {specialty}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    )
  }
  if (variant === "detailed") {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Specialties</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {specialties.map((specialty) => (
            <Badge key={specialty} variant="outline" className="px-3 py-1">
              {specialty}
            </Badge>
          ))}
        </div>
        {rating && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating.toFixed(1)}</span>
            </div>
            {reviewCount && (
              <span className="text-muted-foreground">
                ({reviewCount} reviews)
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
  // Card variant
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Expert Specialties</h4>
              <p className="text-sm text-muted-foreground">
                {specialties.length} area{specialties.length !== 1 ? "s" : ""} of expertise
              </p>
            </div>
          </div>
          {specialties.length > 0 ? (
            <div className="grid gap-2">
              {specialties.map((specialty) => (
                <div
                  key={specialty}
                  className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{specialty}</span>
                  </div>
                  {rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              No specialties listed
            </p>
          )}
          {reviewCount && reviewCount > 0 && (
            <div className="border-t pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Customer Rating</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-1 font-medium">
                    {rating?.toFixed(1) || "0.0"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {reviewCount} customer review{reviewCount !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
