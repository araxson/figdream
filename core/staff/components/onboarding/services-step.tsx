import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { OnboardingData } from "./types"

interface ServicesStepProps {
  data: OnboardingData
  errors: Record<string, string>
  onChange: (updates: Partial<OnboardingData>) => void
}

export function ServicesStep({ data, errors, onChange }: ServicesStepProps) {
  // In a real app, this would be fetched from the database
  const availableServices = [
    "Haircut", "Hair Color", "Highlights", "Blowout",
    "Manicure", "Pedicure", "Facial", "Massage"
  ]

  const toggleService = (service: string) => {
    const updated = data.selected_services.includes(service)
      ? data.selected_services.filter(s => s !== service)
      : [...data.selected_services, service]
    onChange({ selected_services: updated })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Selection</CardTitle>
        <CardDescription>
          Choose the services you can provide
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Label>Available Services</Label>
          <div className="space-y-2">
            {availableServices.map(service => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox
                  id={service}
                  checked={data.selected_services.includes(service)}
                  onCheckedChange={() => toggleService(service)}
                />
                <Label htmlFor={service} className="cursor-pointer">
                  {service}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}