'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Shield, AlertTriangle, Loader2, Key, Lock } from 'lucide-react'

export default function SuperAdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showTwoFactor, setShowTwoFactor] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Please enter your email and password')
      return
    }

    // Validate email domain for super admin
    if (!email.endsWith('@figdream.com')) {
      toast.error('Invalid super admin email domain')
      return
    }

    setIsLoading(true)

    try {
      // Simulate initial authentication
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For super admin, always require 2FA
      if (!showTwoFactor) {
        setShowTwoFactor(true)
        setIsLoading(false)
        toast.info('Please enter your 2FA code')
        return
      }

      if (!twoFactorCode || twoFactorCode.length !== 6) {
        toast.error('Please enter a valid 6-digit code')
        setIsLoading(false)
        return
      }

      // Simulate 2FA verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Log successful admin login (would be sent to audit log in production)
      console.log('Super admin login:', {
        email,
        timestamp: new Date().toISOString(),
        ip: 'xxx.xxx.xxx.xxx', // Would be actual IP in production
      })

      toast.success('Welcome, Super Admin!')
      router.push('/admin')
    } catch (error) {
      toast.error('Authentication failed. Please try again.')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Security Warning */}
      <Alert className="border-destructive/50 text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Restricted Access:</strong> This login is for FigDream platform administrators only. 
          All login attempts are monitored and logged.
        </AlertDescription>
      </Alert>

      {/* Login Card */}
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-destructive" />
            <CardTitle className="text-2xl">Super Admin Login</CardTitle>
          </div>
          <CardDescription>
            Enter your administrator credentials to access the platform dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {!showTwoFactor ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@figdream.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="pl-10"
                    />
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be a valid @figdream.com email address
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
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
                    Remember this device for 30 days
                  </Label>
                </div>
              </>
            ) : (
              <>
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    A 2FA code has been sent to your registered device. 
                    Please enter the 6-digit code below.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="twoFactorCode">Two-Factor Authentication Code</Label>
                  <Input
                    id="twoFactorCode"
                    type="text"
                    placeholder="000000"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={isLoading}
                    maxLength={6}
                    className="text-center text-2xl font-mono tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the code from your authenticator app
                  </p>
                </div>
              </>
            )}
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
                  {showTwoFactor ? 'Verifying...' : 'Authenticating...'}
                </>
              ) : (
                showTwoFactor ? 'Verify & Sign In' : 'Continue'
              )}
            </Button>
            
            {showTwoFactor && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowTwoFactor(false)
                  setTwoFactorCode('')
                }}
                disabled={isLoading}
              >
                Back to Login
              </Button>
            )}

            <div className="text-center text-sm text-muted-foreground">
              <Link href="/auth/login" className="hover:underline">
                Not a super admin? Return to regular login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Security Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="flex items-center gap-2">
              <Lock className="h-3 w-3" />
              This connection is encrypted and secure
            </p>
            <p className="flex items-center gap-2">
              <Shield className="h-3 w-3" />
              IP Address: {typeof window !== 'undefined' ? 'xxx.xxx.xxx.xxx' : 'Loading...'}
            </p>
            <p className="text-xs">
              Session will expire after 2 hours of inactivity
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}