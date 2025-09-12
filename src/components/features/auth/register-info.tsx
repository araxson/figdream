import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle } from "lucide-react"

export function RegisterInfo() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Join Our Platform</h1>
        <p className="text-lg text-muted-foreground">
          Create your account to start booking appointments or manage your salon business.
        </p>
      </div>
      
      <Progress value={33} className="h-2" />
      <p className="text-sm text-muted-foreground">Step 1 of 3: Account Information</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Account Type</CardTitle>
          <CardDescription>Select the option that best describes you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You can always upgrade or change your account type later from your settings.
            </AlertDescription>
          </Alert>
          <div className="space-y-3">
            {[
              { title: "Customer Account", desc: "Book appointments and manage your beauty schedule" },
              { title: "Salon Professional", desc: "Manage bookings and grow your business" },
              { title: "Salon Owner", desc: "Full salon management and staff tools" }
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}