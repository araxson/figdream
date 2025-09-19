import { Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { OnboardingData } from "./types"

interface ReviewStepProps {
  data: OnboardingData
}

export function ReviewStep({ data }: ReviewStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Information</CardTitle>
        <CardDescription>
          Please review all information before submitting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Info */}
        <div>
          <h3 className="font-semibold mb-2">Personal Information</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name:</dt>
              <dd>{data.first_name} {data.last_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email:</dt>
              <dd>{data.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Phone:</dt>
              <dd>{data.phone}</dd>
            </div>
          </dl>
        </div>

        <Separator />

        {/* Professional Info */}
        <div>
          <h3 className="font-semibold mb-2">Professional Details</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Title:</dt>
              <dd>{data.title}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Experience:</dt>
              <dd>{data.experience_years} years</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Employment:</dt>
              <dd>{data.employment_type.replace('_', ' ')}</dd>
            </div>
          </dl>
        </div>

        <Separator />

        {/* Skills */}
        <div>
          <h3 className="font-semibold mb-2">Skills & Services</h3>
          <div className="space-y-2">
            {data.specializations.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Specializations:</p>
                <div className="flex flex-wrap gap-1">
                  {data.specializations.map(spec => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {data.selected_services.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Services:</p>
                <div className="flex flex-wrap gap-1">
                  {data.selected_services.map(service => (
                    <Badge key={service} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Compensation */}
        <div>
          <h3 className="font-semibold mb-2">Compensation</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Commission:</dt>
              <dd>{data.commission_rate}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Hourly Rate:</dt>
              <dd>${data.hourly_rate}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Payment:</dt>
              <dd>{data.payment_method.replace('_', ' ')}</dd>
            </div>
          </dl>
        </div>

        <Separator />

        {/* Access */}
        <div>
          <h3 className="font-semibold mb-2">Access & Permissions</h3>
          <div className="space-y-1">
            {data.is_bookable && (
              <div className="flex items-center text-sm">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Accept online bookings
              </div>
            )}
            {data.can_view_reports && (
              <div className="flex items-center text-sm">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                View reports
              </div>
            )}
            {data.can_manage_schedule && (
              <div className="flex items-center text-sm">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Manage own schedule
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}