'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { toast } from 'sonner'
import { Mail, Sparkles, Loader2, CheckCircle2, RefreshCw, Shield, ArrowLeft, Inbox } from 'lucide-react'
import { createClient } from '@/lib/database/supabase/client'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verified, setVerified] = useState(false)
  const email = searchParams.get('email') || ''

  useEffect(() => {
    // Check if already verified
    const checkVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email_confirmed_at) {
        setVerified(true)
        toast.success('Email already verified!')
        setTimeout(() => {
          router.push('/customer')
        }, 2000)
      }
    }
    checkVerification()
  }, [supabase, router])

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      })

      if (error) {
        toast.error(error.message || 'Invalid verification code')
        return
      }

      setVerified(true)
      toast.success('Email verified successfully!')
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/customer')
      }, 2000)
    } catch (_error) {
      toast.error('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      toast.error('Email address not found')
      return
    }

    setIsResending(true)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) {
        toast.error(error.message || 'Failed to resend code')
        return
      }

      toast.success('New verification code sent!')
      setOtp('')
    } catch (_error) {
      toast.error('Failed to resend code. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const benefits = [
    'Secure your account',
    'Receive appointment reminders', 
    'Access loyalty rewards',
    'Get exclusive offers'
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
            One more step to get started
          </h1>
          <p className="text-lg text-muted-foreground">
            Verify your email to unlock all features and secure your account.
          </p>
          
          {/* Benefits */}
          <div className="space-y-3 pt-4">
            <p className="text-sm font-medium text-muted-foreground">Why verify your email?</p>
            <div className="space-y-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Email Illustration */}
          <div className="pt-6 p-6 rounded-lg bg-background/60 backdrop-blur border text-center">
            <Inbox className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="font-medium mb-2">Check your inbox</h3>
            <p className="text-sm text-muted-foreground">
              We sent a verification code to:
            </p>
            <p className="text-sm font-medium mt-1">{email || 'your email address'}</p>
            <p className="text-xs text-muted-foreground mt-3">
              Can&apos;t find it? Check your spam folder
            </p>
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
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Verify your email</CardTitle>
              <CardDescription className="text-center">
                Enter the 6-digit code we sent to your email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!verified ? (
                <>
                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleVerify}
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify email
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      Didn&apos;t receive the code? Check your spam folder or click resend below. 
                      Codes expire after 10 minutes.
                    </AlertDescription>
                  </Alert>

                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResendCode}
                      disabled={isResending}
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Resending...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Resend code
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4 py-4">
                  <div className="flex justify-center">
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Email verified!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your account is now active. Redirecting to dashboard...
                    </p>
                  </div>
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center w-full text-muted-foreground">
                Already verified?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="w-full"
              >
                <Link href="/register">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to registration
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Mobile Help */}
          <div className="lg:hidden text-center text-sm text-muted-foreground">
            <p>Having trouble?</p>
            <Link href="/contact" className="text-primary hover:underline">
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}