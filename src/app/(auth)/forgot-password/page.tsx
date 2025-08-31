'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'
import { toast } from 'sonner'
import { 
  Mail, Phone, ArrowLeft, Lock, CheckCircle, 
  Info, Loader2, Send, KeyRound, User, Building, Shield
} from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [smsSent, setSmsSent] = useState(false)
  const [resetMethod, setResetMethod] = useState<'email' | 'sms'>('email')
  const [smsOtp, setSmsOtp] = useState('')
  const [otpError, setOtpError] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  
  // Get role from URL params if navigated from a specific login page
  const role = searchParams.get('role') || 'customer'
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    staffId: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEmailReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email && role !== 'staff') {
      toast.error('Please enter your email address')
      return
    }

    if (role === 'staff' && !formData.email && !formData.staffId) {
      toast.error('Please enter your email or staff ID')
      return
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setEmailSent(true)
      toast.success('Password reset link sent! Check your email.')
    } catch (error) {
      toast.error('Failed to send reset email. Please try again.')
      console.error('Password reset error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSmsReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.phone) {
      toast.error('Please enter your phone number')
      return
    }

    // Basic phone validation
    const phoneDigits = formData.phone.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSmsSent(true)
      toast.success('Verification code sent to your phone!')
    } catch (error) {
      toast.error('Failed to send SMS. Please try again.')
      console.error('SMS reset error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Success state - email sent
  if (emailSent) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent a password reset link to your email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                A password reset link has been sent to <strong>{formData.email || 'your registered email'}</strong>. 
                The link will expire in 1 hour.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Check your email inbox</li>
                <li>Click the reset link in the email</li>
                <li>Create a new password</li>
                <li>Sign in with your new password</li>
              </ol>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <Button
                  variant="link"
                  className="h-auto p-0 font-normal"
                  onClick={() => {
                    setEmailSent(false)
                    setFormData({ email: '', phone: '', staffId: '' })
                  }}
                >
                  try again
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => router.push(`/auth/login/${role}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const handleOtpChange = (value: string) => {
    setSmsOtp(value)
    setOtpError(false)
    
    // Auto-submit when all fields are filled
    if (value.length === 6) {
      handleOtpVerify(value)
    }
  }

  const handleOtpVerify = async (code?: string) => {
    const verificationCode = code || smsOtp
    
    if (verificationCode.length !== 6) {
      setOtpError(true)
      toast.error('Please enter the complete 6-digit code')
      return
    }
    
    setIsVerifyingOtp(true)
    
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate verification logic (in real app, call API)
      const isValid = verificationCode === '123456' || Math.random() > 0.3
      
      if (isValid) {
        toast.success('Code verified! Redirecting to reset password...')
        // In real app, navigate to password reset form with verified token
        setTimeout(() => {
          router.push(`/auth/reset-password?token=verified&phone=${formData.phone}&role=${role}`)
        }, 1500)
      } else {
        setOtpError(true)
        toast.error('Invalid verification code. Please try again.')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      toast.error('Failed to verify code. Please try again.')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  // Success state - SMS sent
  if (smsSent) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Phone className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Code Sent!</CardTitle>
            <CardDescription>
              We&apos;ve sent a verification code to your phone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Phone className="h-4 w-4" />
              <AlertDescription>
                A 6-digit verification code has been sent to{' '}
                <strong>{formData.phone}</strong>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <Label className="text-center block">Enter Verification Code</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={smsOtp}
                  onChange={handleOtpChange}
                  className={otpError ? 'error' : ''}
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
              {otpError && (
                <p className="text-sm text-destructive text-center">
                  Invalid verification code. Please try again.
                </p>
              )}
            </div>

            <Button 
              className="w-full" 
              onClick={() => handleOtpVerify()}
              disabled={isVerifyingOtp || smsOtp.length < 6}
            >
              {isVerifyingOtp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Verify Code
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive the code?{' '}
              <Button
                variant="link"
                className="h-auto p-0 font-normal"
                onClick={() => {
                  setSmsSent(false)
                  setFormData({ email: '', phone: '', staffId: '' })
                }}
              >
                Send again
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => router.push(`/auth/login/${role}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Main reset form
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Choose how you&apos;d like to reset your password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={resetMethod} onValueChange={(v) => setResetMethod(v as 'email' | 'sms')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="sms">
                <Phone className="mr-2 h-4 w-4" />
                SMS
              </TabsTrigger>
            </TabsList>

            {/* Email Reset */}
            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleEmailReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {role === 'staff' ? 'Email or Staff ID' : 'Email Address'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type={role === 'staff' ? 'text' : 'email'}
                      placeholder={
                        role === 'staff' 
                          ? 'Enter email or staff ID' 
                          : 'your@email.com'
                      }
                      value={role === 'staff' ? (formData.email || formData.staffId) : formData.email}
                      onChange={(e) => {
                        if (role === 'staff') {
                          // Check if input looks like email
                          if (e.target.value.includes('@')) {
                            handleInputChange('email', e.target.value)
                            handleInputChange('staffId', '')
                          } else {
                            handleInputChange('staffId', e.target.value)
                            handleInputChange('email', '')
                          }
                        } else {
                          handleInputChange('email', e.target.value)
                        }
                      }}
                      className="pl-10"
                    />
                    {role === 'staff' ? (
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll send a password reset link to your registered email
                  </p>
                </div>

                {/* Role-specific help text */}
                {role === 'salon-owner' && (
                  <Alert>
                    <Building className="h-4 w-4" />
                    <AlertDescription>
                      Use the email associated with your salon owner account. 
                      If you manage multiple salons, you&apos;ll regain access to all of them.
                    </AlertDescription>
                  </Alert>
                )}

                {role === 'staff' && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      You can use either your email address or staff ID. 
                      If you don&apos;t remember either, contact your salon manager.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* SMS Reset */}
            <TabsContent value="sms" className="space-y-4">
              <form onSubmit={handleSmsReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll send a verification code to your registered phone number
                  </p>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Standard messaging rates may apply. Make sure this is the phone 
                    number associated with your account.
                  </AlertDescription>
                </Alert>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Verification Code
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full"
            variant="outline"
            onClick={() => router.push(`/auth/login/${role}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            Need help?{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Contact Support
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}