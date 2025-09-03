import { Database } from "@/types/database.types"
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Separator } from "@/components/ui"
import { MapPin, Phone, Mail } from "lucide-react"
type Location = Database['public']['Tables']['locations']['Row']
interface LocationSettingsFormProps {
  location: Location
}
export function LocationSettingsForm({ location }: LocationSettingsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Information</CardTitle>
        <CardDescription>Basic details about your location</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Location Name</Label>
            <p className="font-medium">{location.name}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Status</Label>
            <div>
              {location.is_active ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Address
          </h3>
          <div className="space-y-2">
            <p>{location.address_line_1}</p>
            {location.address_line_2 && (
              <p>{location.address_line_2}</p>
            )}
            <p>
              {location.city}, {location.state_province} {location.postal_code}
            </p>
            <p>{location.country}</p>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4 md:grid-cols-2">
          {location.phone && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <p className="font-medium">{location.phone}</p>
            </div>
          )}
          {location.email && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <p className="font-medium">{location.email}</p>
            </div>
          )}
        </div>
        {(location.latitude && location.longitude) && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Coordinates</Label>
              <p className="text-sm font-mono">
                {location.latitude}, {location.longitude}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}