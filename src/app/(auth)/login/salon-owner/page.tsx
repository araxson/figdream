'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Building, Loader2, Mail, Lock, Info, ChevronRight } from 'lucide-react'

export default function SalonOwnerLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [salonCode, setSalonCode] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Please enter your email and password')
      return
    }

    setIsLoading(true)

    try {
      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Check if salon code is provided for multi-salon owners
      if (salonCode) {
        console.log('Logging in with salon code:', salonCode)
      }

      toast.success('Welcome back to your salon dashboard!')
      router.push('/owner')
    } catch (error) {
      toast.error('Invalid email or password. Please try again.')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
            <Building className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Salon Owner Login</h1>
        <p className="text-muted-foreground">
          Access your salon management dashboard
        </p>
      </div>

      {/* Login Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Enter your salon owner credentials to continue
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="owner@yoursalon.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salonCode">
                Salon Code <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <Input
                id="salonCode"
                type="text"
                placeholder="Enter salon code if you manage multiple salons"
                value={salonCode}
                onChange={(e) => setSalonCode(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Only needed if you manage multiple salon locations
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
              >
                Keep me signed in for 30 days
              </Label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-center text-sm">
              <div className="text-muted-foreground">
                Don&apos;t have a salon account?{' '}
                <Link href="/auth/register/salon" className="text-primary hover:underline">
                  Register your salon
                </Link>
              </div>
              <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">
                Back to login options
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Info Section */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>For Salon Owners:</strong> Use this login if you own or manage one or more salon locations. 
          You&apos;ll have access to staff management, booking oversight, financial reports, and business analytics.
        </AlertDescription>
      </Alert>

      {/* Quick Links */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-sm">Quick Links</h3>
          <div className="space-y-2 text-sm">
            <Link href="/pricing" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-3 w-3" />
              View pricing plans
            </Link>
            <Link href="/features" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-3 w-3" />
              Explore features
            </Link>
            <Link href="/contact" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-3 w-3" />
              Contact support
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}