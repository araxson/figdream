import { Shield, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import type { OnboardingData } from "./types"

interface AccessStepProps {
  data: OnboardingData
  errors: Record<string, string>
  onChange: (updates: Partial<OnboardingData>) => void
}

export function AccessStep({ data, errors, onChange }: AccessStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Access & Permissions</CardTitle>
        <CardDescription>
          Configure staff access and accept terms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permissions */}
        <div className="space-y-4">
          <Label>Permissions</Label>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="bookable">Accept Online Bookings</Label>
              <p className="text-xs text-muted-foreground">
                Customers can book appointments with you online
              </p>
            </div>
            <Switch
              id="bookable"
              checked={data.is_bookable}
              onCheckedChange={(checked) => onChange({ is_bookable: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reports">View Reports</Label>
              <p className="text-xs text-muted-foreground">
                Access to performance and financial reports
              </p>
            </div>
            <Switch
              id="reports"
              checked={data.can_view_reports}
              onCheckedChange={(checked) => onChange({ can_view_reports: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="schedule">Manage Own Schedule</Label>
              <p className="text-xs text-muted-foreground">
                Ability to modify your own schedule and availability
              </p>
            </div>
            <Switch
              id="schedule"
              checked={data.can_manage_schedule}
              onCheckedChange={(checked) => onChange({ can_manage_schedule: checked })}
            />
          </div>
        </div>

        {/* Legal Agreements */}
        <div className="space-y-4">
          <Label>Legal Agreements</Label>
          
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={data.terms_accepted}
                onCheckedChange={(checked) => 
                  onChange({ terms_accepted: checked as boolean })
                }
              />
              <div className="space-y-1">
                <Label htmlFor="terms" className="cursor-pointer">
                  I accept the Terms of Service and Privacy Policy
                </Label>
                {errors.terms_accepted && (
                  <p className="text-xs text-destructive">{errors.terms_accepted}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="handbook"
                checked={data.handbook_acknowledged}
                onCheckedChange={(checked) => 
                  onChange({ handbook_acknowledged: checked as boolean })
                }
              />
              <div className="space-y-1">
                <Label htmlFor="handbook" className="cursor-pointer">
                  I have read and acknowledge the Employee Handbook
                </Label>
                {errors.handbook_acknowledged && (
                  <p className="text-xs text-destructive">{errors.handbook_acknowledged}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must accept both agreements to complete onboarding.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}