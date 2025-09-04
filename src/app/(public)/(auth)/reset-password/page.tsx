'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Lock, Sparkles, Loader2, Eye, EyeOff, CheckCircle2, Shield, ArrowLeft, Key } from 'lucide-react'
import { createClient } from '@/lib/database/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)

  useEffect(() => {
    // Check if user has access to this page (came from email link)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Invalid or expired reset link')
        router.push('/forgot-password')
      }
    }
    checkSession()
  }, [supabase, router])

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        toast.error(error.message || 'Failed to reset password')
        return
      }

      setPasswordReset(true)
      toast.success('Password reset successfully!')
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (_error) {
      toast.error('Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordRequirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(password), text: 'One lowercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
    { met: /[^A-Za-z0-9]/.test(password), text: 'One special character' },
  ]

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Column - Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-muted/30 p-12">
        <div className="max-w-md space-y-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-3xl font-bold">FigDream</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Create your new password
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose a strong, unique password to keep your account secure.
          </p>
          
          {/* Password Tips */}
          <div className="space-y-3 pt-4">
            <p className="text-sm font-medium text-muted-foreground">Password security tips:</p>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm">Use a unique password for each account</span>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm">Avoid common words or personal information</span>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm">Consider using a password manager</span>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm">Enable two-factor authentication when available</span>
              </div>
            </div>
          </div>

          {/* Password Strength Indicator */}
          <div className="pt-6 p-4 rounded-lg bg-background/60 backdrop-blur border">
            <h3 className="font-medium mb-3">Password Requirements:</h3>
            <div className="space-y-2">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle2 
                    className={`h-4 w-4 ${req.met ? 'text-green-500' : 'text-muted-foreground'}`} 
                  />
                  <span className={`text-sm ${req.met ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center space-x-2 lg:hidden">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">FigDream</span>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Key className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Set new password</CardTitle>
              <CardDescription className="text-center">
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!passwordReset ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-9 pr-9"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-9"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleResetPassword()
                        }}
                      />
                    </div>
                  </div>

                  {/* Mobile Password Requirements */}
                  <div className="lg:hidden">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1 mt-2">
                          {passwordRequirements.map((req, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle2 
                                className={`h-3 w-3 ${req.met ? 'text-green-500' : 'text-muted-foreground'}`} 
                              />
                              <span className={`text-xs ${req.met ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {req.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleResetPassword}
                    disabled={isLoading || !passwordRequirements.every(r => r.met)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting password...
                      </>
                    ) : (
                      <>
                        Reset password
                        <Lock className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-4 py-4">
                  <div className="flex justify-center">
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Password reset successful!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your password has been updated. Redirecting to login...
                    </p>
                  </div>
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="w-full"
              >
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}