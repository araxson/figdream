import { User, Mail, Phone, Camera } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { OnboardingData } from "./types"

interface PersonalInfoStepProps {
  data: OnboardingData
  errors: Record<string, string>
  onChange: (updates: Partial<OnboardingData>) => void
}

export function PersonalInfoStep({ data, errors, onChange }: PersonalInfoStepProps) {
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onChange({ avatar_url: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Let's start with your basic information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={data.avatar_url} />
            <AvatarFallback>
              {data.first_name?.[0]?.toUpperCase()}
              {data.last_name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="avatar" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Photo
                </span>
              </Button>
            </Label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG or WEBP (max 2MB)
            </p>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">
              First Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="first_name"
                placeholder="John"
                value={data.first_name}
                onChange={(e) => onChange({ first_name: e.target.value })}
                className={`pl-9 ${errors.first_name ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.first_name && (
              <p className="text-xs text-destructive">{errors.first_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="last_name"
              placeholder="Doe"
              value={data.last_name}
              onChange={(e) => onChange({ last_name: e.target.value })}
              className={errors.last_name ? 'border-destructive' : ''}
            />
            {errors.last_name && (
              <p className="text-xs text-destructive">{errors.last_name}</p>
            )}
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="display_name">
            Display Name (Optional)
          </Label>
          <Input
            id="display_name"
            placeholder="How customers will see your name"
            value={data.display_name}
            onChange={(e) => onChange({ display_name: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Leave blank to use your full name
          </p>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={data.email}
                onChange={(e) => onChange({ email: e.target.value })}
                className={`pl-9 ${errors.email ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={data.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                className={`pl-9 ${errors.phone ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Privacy Notice */}
        <Alert>
          <AlertDescription>
            Your personal information will be kept confidential and only used for
            salon operations and customer communications.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}