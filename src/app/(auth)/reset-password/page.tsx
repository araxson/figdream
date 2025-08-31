'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  Lock, CheckCircle, XCircle, Eye, EyeOff, 
  ShieldCheck, Info, Loader2, KeyRound, AlertTriangle
} from 'lucide-react'

interface PasswordStrength {
  score: number
  label: string
  color: string
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenExpired, setTokenExpired] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Get token from URL
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  
  // Form data
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  // Password requirements
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })

  // Password strength
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Too weak',
    color: 'bg-red-500',
  })

  useEffect(() => {
    // Verify reset token
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false)
        return
      }

      try {
        // Simulate token verification
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Simulate token validation logic
        const isValid = Math.random() > 0.2 // 80% chance of valid token
        const isExpired = Math.random() > 0.9 // 10% chance of expired
        
        if (isExpired) {
          setTokenExpired(true)
        } else if (isValid) {
          setTokenValid(true)
        }
      } catch (error) {
        console.error('Token verification error:', error)
        toast.error('Failed to verify reset link')
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  useEffect(() => {
    // Check password requirements
    const password = formData.password
    
    setRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    })

    // Calculate password strength
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

    const strengthMap: Record<number, PasswordStrength> = {
      0: { score: 0, label: 'Too weak', color: 'bg-red-500' },
      1: { score: 20, label: 'Weak', color: 'bg-orange-500' },
      2: { score: 40, label: 'Fair', color: 'bg-yellow-500' },
      3: { score: 60, label: 'Good', color: 'bg-blue-500' },
      4: { score: 80, label: 'Strong', color: 'bg-green-500' },
      5: { score: 100, label: 'Very strong', color: 'bg-green-600' },
    }

    setStrength(strengthMap[score] || strengthMap[0])
  }, [formData.password])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (strength.score < 40) {
      toast.error('Please choose a stronger password')
      return
    }

    setIsLoading(true)

    try {
      // Simulate password reset
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setPasswordReset(true)
      toast.success('Password reset successful!')
    } catch (error) {
      toast.error('Failed to reset password. Please try again.')
      console.error('Password reset error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isVerifying) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Verifying reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Invalid or missing token
  if (!token || (!tokenValid && !tokenExpired)) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has been used
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                The password reset link you followed is invalid. This could happen if:
                <ul className="mt-2 list-disc list-inside text-sm">
                  <li>The link was copied incorrectly</li>
                  <li>The link has already been used</li>
                  <li>The link was tampered with</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full"
              onClick={() => router.push('/auth/forgot-password')}
            >
              Request New Reset Link
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

  // Token expired
  if (tokenExpired) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Link Expired</CardTitle>
            <CardDescription>
              This password reset link has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                For security reasons, password reset links expire after 1 hour. 
                Please request a new reset link to continue.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full"
              onClick={() => router.push('/auth/forgot-password')}
            >
              Request New Reset Link
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
  if (passwordReset) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Password Reset Successful!</CardTitle>
            <CardDescription>
              Your password has been successfully reset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription>
                Your password has been updated. You can now sign in with your new password.
              </AlertDescription>
            </Alert>
            
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">Security tips:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use a unique password for each account</li>
                <li>• Consider using a password manager</li>
                <li>• Enable two-factor authentication when available</li>
                <li>• Never share your password with anyone</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => router.push('/auth/login')}
            >
              Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Reset password form
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create New Password</CardTitle>
          <CardDescription>
            {email && (
              <span>
                Reset password for <strong>{email}</strong>
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Password strength</span>
                  <span className="font-medium">{strength.label}</span>
                </div>
                <Progress value={strength.score} className="h-2" />
              </div>
            )}

            {/* Password Requirements */}
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Password must contain:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  {requirements.length ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className={requirements.length ? 'text-green-600' : 'text-muted-foreground'}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {requirements.uppercase && requirements.lowercase ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className={requirements.uppercase && requirements.lowercase ? 'text-green-600' : 'text-muted-foreground'}>
                    Upper and lowercase letters
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {requirements.number ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className={requirements.number ? 'text-green-600' : 'text-muted-foreground'}>
                    At least one number
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {requirements.special ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className={requirements.special ? 'text-green-600' : 'text-muted-foreground'}>
                    At least one special character
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-sm text-destructive">Passwords do not match</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || strength.score < 40}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>
            
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={() => router.push('/auth/login')}
            >
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}