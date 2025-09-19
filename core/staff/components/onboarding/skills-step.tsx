import { Award, Languages } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { OnboardingData } from "./types"

interface SkillsStepProps {
  data: OnboardingData
  errors: Record<string, string>
  onChange: (updates: Partial<OnboardingData>) => void
}

const COMMON_SPECIALIZATIONS = [
  "Hair Cutting", "Hair Coloring", "Highlights", "Balayage",
  "Manicure", "Pedicure", "Gel Nails", "Acrylic Nails",
  "Facial Treatments", "Makeup", "Eyebrow Shaping", "Lash Extensions"
]

const COMMON_LANGUAGES = [
  "English", "Spanish", "French", "Chinese", "Japanese",
  "Korean", "Vietnamese", "Russian", "Arabic", "Portuguese"
]

export function SkillsStep({ data, errors, onChange }: SkillsStepProps) {
  const toggleSpecialization = (spec: string) => {
    const updated = data.specializations.includes(spec)
      ? data.specializations.filter(s => s !== spec)
      : [...data.specializations, spec]
    onChange({ specializations: updated })
  }

  const toggleLanguage = (lang: string) => {
    const updated = data.languages.includes(lang)
      ? data.languages.filter(l => l !== lang)
      : [...data.languages, lang]
    onChange({ languages: updated })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills & Expertise</CardTitle>
        <CardDescription>
          Select your specializations and languages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Specializations */}
        <div className="space-y-3">
          <Label>Specializations</Label>
          <div className="flex flex-wrap gap-2">
            {COMMON_SPECIALIZATIONS.map(spec => (
              <Badge
                key={spec}
                variant={data.specializations.includes(spec) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleSpecialization(spec)}
              >
                {spec}
              </Badge>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-3">
          <Label>Languages Spoken</Label>
          <div className="flex flex-wrap gap-2">
            {COMMON_LANGUAGES.map(lang => (
              <Badge
                key={lang}
                variant={data.languages.includes(lang) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleLanguage(lang)}
              >
                {lang}
              </Badge>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="space-y-3">
          <Label>Certifications (Optional)</Label>
          <div className="space-y-2">
            {data.certifications.map((cert, index) => (
              <div key={index} className="flex gap-2">
                <Input value={cert} readOnly />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const updated = data.certifications.filter((_, i) => i !== index)
                    onChange({ certifications: updated })
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Input
              placeholder="Add certification..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  onChange({
                    certifications: [...data.certifications, e.currentTarget.value]
                  })
                  e.currentTarget.value = ''
                }
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}