import { Briefcase, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { OnboardingData } from "./types"

interface ProfessionalStepProps {
  data: OnboardingData
  errors: Record<string, string>
  onChange: (updates: Partial<OnboardingData>) => void
}

export function ProfessionalStep({ data, errors, onChange }: ProfessionalStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Information</CardTitle>
        <CardDescription>
          Tell us about your professional background
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Job Title <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="title"
              placeholder="e.g., Senior Stylist, Nail Technician"
              value={data.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className={`pl-9 ${errors.title ? 'border-destructive' : ''}`}
            />
          </div>
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title}</p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">
            Professional Bio
          </Label>
          <Textarea
            id="bio"
            placeholder="Tell customers about your experience and specialties..."
            value={data.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            This will be displayed on your booking profile
          </p>
        </div>

        {/* Experience */}
        <div className="space-y-2">
          <Label htmlFor="experience">
            Years of Experience: {data.experience_years}
          </Label>
          <Slider
            id="experience"
            min={0}
            max={30}
            step={1}
            value={[data.experience_years]}
            onValueChange={(value) => onChange({ experience_years: value[0] })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>New</span>
            <span>5 years</span>
            <span>10 years</span>
            <span>15+ years</span>
            <span>30+ years</span>
          </div>
        </div>

        {/* Employment Type */}
        <div className="space-y-2">
          <Label htmlFor="employment_type">
            Employment Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.employment_type}
            onValueChange={(value: "full_time" | "part_time" | "contractor") =>
              onChange({ employment_type: value })
            }
          >
            <SelectTrigger id="employment_type">
              <SelectValue placeholder="Select employment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="contractor">Independent Contractor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hire Date */}
        <div className="space-y-2">
          <Label htmlFor="hired_at">
            Start Date <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="hired_at"
              type="date"
              value={data.hired_at}
              onChange={(e) => onChange({ hired_at: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}