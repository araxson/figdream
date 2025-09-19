import { Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import type { OnboardingData } from "./types"

interface ScheduleStepProps {
  data: OnboardingData
  errors: Record<string, string>
  onChange: (updates: Partial<OnboardingData>) => void
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
] as const

export function ScheduleStep({ data, errors, onChange }: ScheduleStepProps) {
  const toggleDay = (day: keyof typeof data.availability) => {
    onChange({
      availability: {
        ...data.availability,
        [day]: !data.availability[day]
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Preferences</CardTitle>
        <CardDescription>
          Set your availability and preferred working hours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Available Days */}
        <div className="space-y-3">
          <Label>Available Days</Label>
          <div className="space-y-2">
            {DAYS.map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={data.availability[key]}
                  onCheckedChange={() => toggleDay(key)}
                />
                <Label htmlFor={key} className="cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Preferred Hours */}
        <div className="space-y-2">
          <Label htmlFor="preferred_hours">Preferred Working Hours</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="preferred_hours"
              placeholder="e.g., 9:00 AM - 5:00 PM"
              value={data.preferred_hours}
              onChange={(e) => onChange({ preferred_hours: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}