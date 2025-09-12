import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export function LoginInfo() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-lg text-muted-foreground">
          Sign in to access your personalized dashboard and manage your appointments.
        </p>
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          New to our platform? Create an account to start booking appointments with top-rated salons.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Why Choose Us?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            "Real-time availability",
            "Secure online payments", 
            "Instant confirmations",
            "24/7 customer support"
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}