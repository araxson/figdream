'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'

export function VerifyOTPForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [success, setSuccess] = useState(false)
  const verificationType = searchParams.get('type')
  const isPasswordReset = verificationType === 'password-reset'
  const isLogin = verificationType === 'login'

  useEffect(() => {
    const storedEmail = isPasswordReset 
      ? sessionStorage.getItem('reset-email')
      : sessionStorage.getItem('login-email')
    
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      router.push(isPasswordReset ? '/forgot-password' : '/login-otp')
    }
  }, [router, isPasswordReset, isLogin])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  async function handleVerifyOTP() {
    if (otp.length !== 6) {
      setError('Please enter a complete 6-digit code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (isPasswordReset) {
        // Verify OTP for password reset
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'email'
        })

        if (error) {
          setError(error.message)
          setLoading(false)
          return
        }

        if (data.session) {
          // Store the session for password reset
          sessionStorage.setItem('password-reset-session', 'true')
          setSuccess(true)
          setTimeout(() => {
            router.push('/reset-password')
          }, 1500)
        }
      } else {
        // Login or regular email verification
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'email'
        })

        if (error) {
          setError(error.message)
          setLoading(false)
          return
        }

        if (data.session) {
          // Clear session storage
          sessionStorage.removeItem('login-email')
          setSuccess(true)
          setTimeout(() => {
            router.push('/admin')
            router.refresh()
          }, 1500)
        }
      }
    } catch {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  async function handleResendOTP() {
    setResending(true)
    setError(null)

    try {
      if (isPasswordReset) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) {
          setError(error.message)
        } else {
          setCountdown(60)
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false
          }
        })

        if (error) {
          setError(error.message)
        } else {
          setCountdown(60)
        }
      }
    } catch {
      setError('Failed to resend code')
    } finally {
      setResending(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {isPasswordReset 
              ? 'Verification successful! Redirecting to reset password...'
              : 'Verification successful! Redirecting to dashboard...'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Enter the code sent to
          </p>
          <p className="font-medium">{email}</p>
        </div>

        <div className="flex justify-center">
          <InputOTP
            value={otp}
            onChange={setOtp}
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            disabled={loading}
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
          onClick={handleVerifyOTP}
          className="w-full"
          disabled={loading || otp.length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the code?
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResendOTP}
            disabled={resending || countdown > 0}
          >
            {countdown > 0 
              ? `Resend in ${countdown}s`
              : resending 
                ? 'Sending...' 
                : 'Resend Code'}
          </Button>
        </div>

        <div className="pt-4 border-t">
          <Link 
            href={isPasswordReset ? "/forgot-password" : isLogin ? "/login-otp" : "/login"}
            className="flex items-center justify-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {isPasswordReset ? "password reset" : isLogin ? "email entry" : "login"}
          </Link>
        </div>
      </div>
    </div>
  )
}