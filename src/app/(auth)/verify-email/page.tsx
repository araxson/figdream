'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Mail, CheckCircle, XCircle, RefreshCw, ArrowLeft, 
  Info, Loader2, Send, AlertTriangle, Clock, Shield
} from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [verificationFailed, setVerificationFailed] = useState(false)
  const [resendCount, setResendCount] = useState(0)
  const [resendCooldown, setResendCooldown] = useState(0)
  
  // Get token from URL if present (for direct verification link)
  const token = searchParams.get('token')
  const email = searchParams.get('email') || ''
  const role = searchParams.get('role') || 'customer'
  
  // OTP verification
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState(false)

  useEffect(() => {
    // Auto-verify if token is present
    if (token) {
      verifyWithToken()
    }
  }, [token])

  useEffect(() => {
    // Cooldown timer for resend button
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const verifyWithToken = async () => {
    setIsVerifying(true)
    
    try {
      // Simulate token verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate success/failure
      const isValid = Math.random() > 0.2 // 80% success rate
      
      if (isValid) {
        setEmailVerified(true)
        toast.success('Email verified successfully!')
      } else {
        setVerificationFailed(true)
        toast.error('Verification failed. Token may be expired.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationFailed(true)
      toast.error('Failed to verify email')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent pasting multiple chars
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setOtpError(false)
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
    
    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit) && index === 5) {
      handleOtpSubmit(newOtp.join(''))
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleOtpSubmit = async (code?: string) => {
    const verificationCode = code || otp.join('')
    
    if (verificationCode.length !== 6) {
      setOtpError(true)
      toast.error('Please enter the complete 6-digit code')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate verification logic
      const isValid = verificationCode === '123456' || Math.random() > 0.3
      
      if (isValid) {
        setEmailVerified(true)
        toast.success('Email verified successfully!')
      } else {
        setOtpError(true)
        toast.error('Invalid verification code')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      toast.error('Failed to verify code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return
    
    setIsResending(true)
    
    try {
      // Simulate resending email
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setResendCount(resendCount + 1)
      setResendCooldown(60) // 60 second cooldown
      toast.success('Verification email resent!')
      
      // Clear OTP on resend
      setOtp(['', '', '', '', '', ''])
      setOtpError(false)
    } catch (error) {
      console.error('Resend error:', error)
      toast.error('Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  const handleChangeEmail = () => {
    // Navigate back to registration with email pre-filled
    router.push(`/auth/register/${role}?email=${encodeURIComponent(email)}`)
  }

  // Loading state for auto-verification
  if (isVerifying) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Verifying your email...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please wait while we confirm your email address
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Verification failed state
  if (verificationFailed) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verification Failed</CardTitle>
            <CardDescription>
              We couldn&apos;t verify your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                The verification link may have expired or is invalid. 
                Verification links expire after 24 hours for security reasons.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold">What to do next:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Request a new verification email</li>
                <li>Check your spam folder</li>
                <li>Make sure you&apos;re using the latest link</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full"
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => router.push('/auth/login')}
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Success state
  if (emailVerified) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your account is now active. You can sign in and start using all features.
              </AlertDescription>
            </Alert>
            
            {role === 'salon' && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Next steps for salon owners:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Complete your salon profile</li>
                  <li>• Add your services and pricing</li>
                  <li>• Invite your staff members</li>
                  <li>• Configure booking settings</li>
                </ul>
              </div>
            )}
            
            {role === 'staff' && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Next steps for staff:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Set up your availability</li>
                  <li>• Configure your services</li>
                  <li>• Update your professional profile</li>
                  <li>• Connect with clients</li>
                </ul>
              </div>
            )}
            
            {role === 'customer' && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Welcome to FigDream!</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Browse nearby salons</li>
                  <li>• Book your first appointment</li>
                  <li>• Earn loyalty rewards</li>
                  <li>• Get exclusive offers</li>
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => router.push(`/auth/login/${role}`)}
            >
              Continue to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Main verification form (OTP input)
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            {email ? (
              <>We sent a verification code to <strong>{email}</strong></>
            ) : (
              <>Enter the 6-digit code sent to your email</>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OTP Input */}
          <div className="space-y-4">
            <Label className="text-center block">Verification Code</Label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-12 h-12 text-center text-lg font-semibold ${
                    otpError ? 'border-destructive' : ''
                  }`}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            {otpError && (
              <p className="text-sm text-destructive text-center">
                Invalid verification code. Please try again.
              </p>
            )}
          </div>

          <Button
            className="w-full"
            onClick={() => handleOtpSubmit()}
            disabled={isLoading || otp.some(d => !d)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </Button>

          <Separator />

          {/* Help Section */}
          <div className="space-y-3">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Didn&apos;t receive the code? Check your spam folder or wait a few minutes. 
                Verification codes expire after 10 minutes.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    {resendCooldown}s
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Resend Code
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleChangeEmail}
              >
                <Mail className="mr-2 h-4 w-4" />
                Change Email
              </Button>
            </div>

            {resendCount > 0 && (
              <p className="text-xs text-center text-muted-foreground">
                Verification email resent {resendCount} {resendCount === 1 ? 'time' : 'times'}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            variant="ghost"
            onClick={() => router.push('/auth/login')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}