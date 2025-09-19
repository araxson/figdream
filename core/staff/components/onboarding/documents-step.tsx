import { FileText, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { OnboardingData } from "./types"

interface DocumentsStepProps {
  data: OnboardingData
  errors: Record<string, string>
  onChange: (updates: Partial<OnboardingData>) => void
}

export function DocumentsStep({ data, errors, onChange }: DocumentsStepProps) {
  const handleFileUpload = (type: keyof OnboardingData['documents']) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onChange({
          documents: {
            ...data.documents,
            [type]: file
          }
        })
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentation</CardTitle>
        <CardDescription>
          Upload required documents (optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* License */}
        <div className="space-y-2">
          <Label>Professional License</Label>
          <div className="flex gap-2">
            <Input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={handleFileUpload('license')}
              className="flex-1"
            />
            {data.documents.license && (
              <span className="text-sm text-muted-foreground">
                {data.documents.license.name}
              </span>
            )}
          </div>
        </div>

        {/* Insurance */}
        <div className="space-y-2">
          <Label>Insurance Certificate</Label>
          <div className="flex gap-2">
            <Input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={handleFileUpload('insurance')}
              className="flex-1"
            />
            {data.documents.insurance && (
              <span className="text-sm text-muted-foreground">
                {data.documents.insurance.name}
              </span>
            )}
          </div>
        </div>

        {/* ID Verification */}
        <div className="space-y-2">
          <Label>ID Verification</Label>
          <div className="flex gap-2">
            <Input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={handleFileUpload('id_verification')}
              className="flex-1"
            />
            {data.documents.id_verification && (
              <span className="text-sm text-muted-foreground">
                {data.documents.id_verification.name}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}