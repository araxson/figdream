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
import { Users, Loader2, Mail, Lock, Briefcase, Calendar, ChevronRight, Info } from 'lucide-react'

export default function StaffLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'email' | 'staffId'>('email')
  const [email, setEmail] = useState('')
  const [staffId, setStaffId] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loginMethod === 'email' && !email) {
      toast.error('Please enter your email address')
      return
    }

    if (loginMethod === 'staffId' && !staffId) {
      toast.error('Please enter your staff ID')
      return
    }

    if (!password) {
      toast.error('Please enter your password')
      return
    }

    setIsLoading(true)

    try {
      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Welcome back! Loading your schedule...')
      router.push('/staff')
    } catch (error) {
      toast.error('Invalid credentials. Please try again.')
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
          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
            <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Staff Login</h1>
        <p className="text-muted-foreground">
          Access your appointments and schedule
        </p>
      </div>

      {/* Login Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sign in to Staff Portal</CardTitle>
          <CardDescription>
            Use your staff credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {/* Login Method Toggle */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <Button
                type="button"
                variant={loginMethod === 'email' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setLoginMethod('email')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                type="button"
                variant={loginMethod === 'staffId' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setLoginMethod('staffId')}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Staff ID
              </Button>
            </div>

            {loginMethod === 'email' ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.name@salon.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="staffId">Staff ID</Label>
                <div className="relative">
                  <Input
                    id="staffId"
                    type="text"
                    placeholder="Enter your staff ID"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                  />
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your staff ID was provided by your salon manager
                </p>
              </div>
            )}

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
                Remember me on this device
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

            <div className="flex flex-col gap-2 text-center text-sm">
              <div className="text-muted-foreground">
                First time staff member?{' '}
                <Link href="/auth/register/staff" className="text-primary hover:underline">
                  Activate your account
                </Link>
              </div>
              <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">
                Back to login options
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Quick Access Info */}
      <div className="grid gap-4">
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            <strong>Today&apos;s Schedule:</strong> View your appointments, manage your availability, 
            and track your performance all in one place.
          </AlertDescription>
        </Alert>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Need Help?</strong> Contact your salon manager or{' '}
            <Link href="/contact" className="text-primary hover:underline">
              reach out to support
            </Link>{' '}
            for assistance with your account.
          </AlertDescription>
        </Alert>
      </div>

      {/* Features Preview */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-sm">Staff Portal Features</h3>
          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Appointment Calendar</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Client Management</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Commission Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              <span>Performance Reports</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}