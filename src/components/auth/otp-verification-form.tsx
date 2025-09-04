'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { OTPInput } from './otp-input'
import { Loader2, Mail, CheckCircle } from 'lucide-react'

interface OTPVerificationFormProps {
  email: string
  type: 'signup' | 'login' | 'password-reset'
  onResend?: () => Promise<{ success: boolean; message?: string; error?: string }>
  onVerify: (otp: string) => Promise<{ success: boolean; message?: string; error?: string }>
  redirectTo?: string
  title?: string
  description?: string
}

export function OTPVerificationForm({
  email,
  type,
  onResend,
  onVerify,
  redirectTo,
  title,
  description
}: OTPVerificationFormProps) {
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [resendTimer, setResendTimer] = useState(0)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleComplete = async (otpValue: string) => {
    if (otpValue.length === 6) {
      await handleVerify(otpValue)
    }
  }

  const handleVerify = async (otpValue?: string) => {
    const code = otpValue || otp
    if (code.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await onVerify(code)
      
      if (result.success) {
        setSuccess(result.message || 'Verification successful!')
        
        // Redirect after a short delay
        setTimeout(() => {
          if (redirectTo) {
            router.push(redirectTo)
          }
        }, 1500)
      } else {
        setError(result.error || 'Verification failed')
        setOtp('')
      }
    } catch (_err) {
      setError('An unexpected error occurred')
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!onResend || resendTimer > 0) return

    setResending(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await onResend()
      
      if (result.success) {
        setSuccess(result.message || 'Verification code resent!')
        setResendTimer(60) // 60 second cooldown
      } else {
        setError(result.error || 'Failed to resend code')
      }
    } catch (_err) {
      setError('Failed to resend verification code')
    } finally {
      setResending(false)
    }
  }

  const getDefaultTitle = () => {
    switch (type) {
      case 'signup':
        return 'Verify Your Email'
      case 'login':
        return 'Enter Login Code'
      case 'password-reset':
        return 'Enter Reset Code'
      default:
        return 'Enter Verification Code'
    }
  }

  const getDefaultDescription = () => {
    switch (type) {
      case 'signup':
        return `We've sent a 6-digit verification code to ${email}`
      case 'login':
        return `Enter the 6-digit login code sent to ${email}`
      case 'password-reset':
        return `Enter the 6-digit reset code sent to ${email}`
      default:
        return `Enter the verification code sent to ${email}`
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">
          {title || getDefaultTitle()}
        </CardTitle>
        <CardDescription className="text-center">
          {description || getDefaultDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <OTPInput
            value={otp}
            onChange={setOtp}
            onComplete={handleComplete}
            disabled={loading}
            autoFocus
          />

          <Button
            onClick={() => handleVerify()}
            disabled={loading || otp.length !== 6}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>

          {onResend && (
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={resending || resendTimer > 0}
                className="text-sm"
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Sending...
                  </>
                ) : resendTimer > 0 ? (
                  `Resend code in ${resendTimer}s`
                ) : (
                  "Didn't receive a code? Resend"
                )}
              </Button>
            </div>
          )}
        </div>

        {type === 'password-reset' && (
          <div className="text-center text-sm text-muted-foreground">
            After verification, you&apos;ll be able to set a new password
          </div>
        )}
      </CardContent>
    </Card>
  )
}