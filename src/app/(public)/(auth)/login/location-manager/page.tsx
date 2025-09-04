import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { MapPin } from "lucide-react"
export const metadata: Metadata = {
  title: "Location Manager Login | FigDream",
  description: "Sign in to your location manager account",
}
export default function LocationManagerLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Location Manager Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your location dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="manager@salon.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
            />
          </div>
          <Button className="w-full" type="submit">
            Sign In
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link 
            href="/forgot-password" 
            className="text-sm text-muted-foreground"
          >
            Forgot your password?
          </Link>
          <div className="text-sm text-muted-foreground">
            Not a location manager?{" "}
            <Link href="/login" className="text-primary">
              Choose another login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
