'use client'
import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Input,
  Label,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui'
import { toast } from 'sonner'
import { Loader2, Mail, CheckCircle, RefreshCw, Lock } from 'lucide-react'
import { resetPasswordAction, verifyResetOtpAction } from '@/lib/actions/auth'
import { useCSRFToken, CSRFTokenField } from '@/lib/hooks/use-csrf-token'
export function ForgotPasswordForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [verified, setVerified] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const { token: csrfToken, loading: csrfLoading, error: csrfError } = useCSRFToken()
  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!csrfToken) {
      toast.error('Security token not loaded. Please refresh the page.')
      return
    }
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        const result = await resetPasswordAction(formData)
        if (result?.error) {
          toast.error(result.error)
        } else if (result?.success) {
          setOtpSent(true)
          setResendCooldown(60)
          toast.success('Verification code sent! Check your email.')
        }
      } catch (_error) {
        toast.error('An unexpected error occurred. Please try again.')
      }
    })
  }
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }
    setIsVerifying(true)
    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('token', otp)
      formData.append('csrf_token', csrfToken || '')
      const result = await verifyResetOtpAction(formData)
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        setVerified(true)
        toast.success('Verification successful!')
        // Store email in sessionStorage for reset page
        sessionStorage.setItem('reset_email', email)
        sessionStorage.setItem('reset_token', otp)
        // Redirect to reset password page
        setTimeout(() => {
          router.push('/reset-password')
        }, 1500)
      }
    } catch (_error) {
      toast.error('Verification failed. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }
  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    setIsResending(true)
    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('csrf_token', csrfToken || '')
      const result = await resetPasswordAction(formData)
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success('New verification code sent!')
        setResendCooldown(60)
        setOtp('')
      }
    } catch (_error) {
      toast.error('Failed to resend code')
    } finally {
      setIsResending(false)
    }
  }
  if (csrfError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Security initialization failed</p>
        <Button onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </div>
    )
  }
  if (verified) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Verified Successfully!</h3>
          <p className="text-sm text-muted-foreground">
            Redirecting to reset your password...
          </p>
        </div>
      </div>
    )
  }
  if (otpSent) {
    return (
      <div className="space-y-4">
        <CSRFTokenField />
        {/* Email Display */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Verification code sent to:</p>
          <p className="font-medium">{email}</p>
        </div>
        {/* OTP Input */}
        <div className="space-y-2">
          <Label htmlFor="otp">Enter Verification Code</Label>
          <div className="flex justify-center">
            <InputOTP
              id="otp"
              value={otp}
              onChange={setOtp}
              maxLength={6}
              disabled={isVerifying}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Enter the 6-digit code from your email
          </p>
        </div>
        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleVerifyOtp}
            className="w-full"
            disabled={isVerifying || otp.length !== 6}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Verify & Reset Password
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : resendCooldown > 0 ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend in {resendCooldown}s
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend Code
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setOtpSent(false)
              setOtp('')
              setEmail('')
            }}
            className="w-full"
          >
            Change Email
          </Button>
        </div>
      </div>
    )
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CSRFTokenField />
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isPending || csrfLoading}
            className="pl-10"
          />
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground">
          Enter the email address associated with your account
        </p>
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isPending || csrfLoading || !email}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending verification code...
          </>
        ) : csrfLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading security...
          </>
        ) : (
          'Send Verification Code'
        )}
      </Button>
    </form>
  )
}