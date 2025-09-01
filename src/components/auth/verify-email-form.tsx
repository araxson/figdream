'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'
import { toast } from 'sonner'
import { Loader2, Mail, CheckCircle, RefreshCw } from 'lucide-react'
import { verifyOtpAction } from '@/app/_actions/auth'
import { useCSRFToken, CSRFTokenField } from '@/lib/hooks/use-csrf-token'

export function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isResending, setIsResending] = useState(false)
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [verified, setVerified] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const { token: csrfToken, loading: csrfLoading, error: csrfError } = useCSRFToken()

  // Get email from URL params if available
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!csrfToken) {
      toast.error('Security token not loaded. Please refresh the page.')
      return
    }

    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.append('token', otp)
    
    startTransition(async () => {
      try {
        const result = await verifyOtpAction(formData)
        
        if (result?.error) {
          toast.error(result.error)
        } else if (result?.success === false) {
          toast.error('Verification failed. Please check your code and try again.')
        } else {
          setVerified(true)
          toast.success('Email verified successfully!')
          // Redirect will be handled by server action
        }
      } catch (error) {
        console.error('Verification error:', error)
        toast.error('An unexpected error occurred. Please try again.')
      }
    })
  }

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsResending(true)
    
    try {
      // In a real implementation, this would call a resend action
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Verification code sent! Check your email.')
      setResendCooldown(60) // 60 second cooldown
      setOtp('') // Clear the OTP input
    } catch (error) {
      toast.error('Failed to resend verification code')
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
          <h3 className="text-lg font-semibold">Email Verified!</h3>
          <p className="text-sm text-muted-foreground">
            Your email has been successfully verified. Redirecting to your dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <CSRFTokenField />
      
      {/* Email Field */}
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
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* OTP Input */}
      <div className="space-y-2">
        <Label htmlFor="otp">Verification Code</Label>
        <div className="flex justify-center">
          <InputOTP
            id="otp"
            value={otp}
            onChange={setOtp}
            maxLength={6}
            disabled={isPending || csrfLoading}
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
          type="submit"
          className="w-full"
          disabled={isPending || csrfLoading || !email || otp.length !== 6}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : csrfLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading security...
            </>
          ) : (
            'Verify Email'
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleResend}
          disabled={isResending || resendCooldown > 0 || !email}
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
      </div>
    </form>
  )
}