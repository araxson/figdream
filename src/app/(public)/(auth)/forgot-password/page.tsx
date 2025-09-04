'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { ArrowLeft, Mail, Sparkles, Loader2, Info, CheckCircle2, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/database/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast.error(error.message || 'Failed to send reset email')
        return
      }

      setEmailSent(true)
      toast.success('Password reset email sent! Check your inbox.')
    } catch (_error) {
      toast.error('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    'Secure password reset process',
    'Email verification required',
    'Link expires in 1 hour',
    '24/7 support available'
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
            Reset your password securely
          </h1>
          <p className="text-lg text-muted-foreground">
            We&apos;ll send you a secure link to reset your password and get you back into your account.
          </p>
          
          {/* Security Features */}
          <div className="space-y-3 pt-4">
            <p className="text-sm font-medium text-muted-foreground">Security features:</p>
            <div className="space-y-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-start space-x-2">
                  <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Help Info */}
          <div className="pt-6 p-4 rounded-lg bg-background/60 backdrop-blur border">
            <h3 className="font-medium mb-2">Common Issues:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check your spam folder if you don&apos;t see the email</li>
              <li>• Make sure you&apos;re using the correct email address</li>
              <li>• Contact support if you need additional help</li>
            </ul>
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

          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-fit"
          >
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </Button>

          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Reset password</CardTitle>
              <CardDescription className="text-center">
                Enter your email address and we&apos;ll send you a link to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!emailSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleResetPassword()
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleResetPassword}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending reset link...
                      </>
                    ) : (
                      <>
                        Send reset link
                        <Mail className="ml-2 h-4 w-4" />
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
                    <h3 className="font-semibold">Check your email</h3>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ve sent a password reset link to:
                    </p>
                    <p className="font-medium">{email}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setEmailSent(false)
                      setEmail('')
                    }}
                  >
                    Try another email
                  </Button>
                </div>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Password reset links expire after 1 hour. If you don&apos;t receive an email within a few minutes, check your spam folder.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center w-full text-muted-foreground">
                Remember your password?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>

          {/* Mobile Help Section */}
          <div className="lg:hidden text-center text-sm text-muted-foreground space-y-2">
            <p>Need help?</p>
            <Link href="/contact" className="text-primary hover:underline">
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}