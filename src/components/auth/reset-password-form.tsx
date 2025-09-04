'use client'
import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Loader2, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { updatePasswordWithOtpAction } from '@/lib/actions/auth'
import { useCSRFToken } from '@/hooks/use-csrf-token'
import { CSRFTokenField } from '@/components/shared/forms/csrf-token-field'
interface PasswordStrength {
  score: number
  label: string
  color: string
}
export function ResetPasswordForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Weak',
    color: 'bg-red-500'
  })
  const { token: csrfToken, loading: csrfLoading, error: csrfError } = useCSRFToken()
  // Password requirements
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })
  // Get email and token from sessionStorage on mount
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('reset_email')
    const storedToken = sessionStorage.getItem('reset_token')
    if (!storedEmail || !storedToken) {
      toast.error('Verification session expired. Please start over.')
      router.push('/forgot-password')
      return
    }
    setEmail(storedEmail)
    setToken(storedToken)
    // Clear session storage after retrieving
    sessionStorage.removeItem('reset_email')
    sessionStorage.removeItem('reset_token')
  }, [router])
  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: 'Weak', color: 'bg-red-500' })
      setRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      })
      return
    }
    const newRequirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    setRequirements(newRequirements)
    const score = Object.values(newRequirements).filter(Boolean).length
    let strength: PasswordStrength
    if (score === 5) {
      strength = { score: 100, label: 'Strong', color: 'bg-green-500' }
    } else if (score === 4) {
      strength = { score: 80, label: 'Good', color: 'bg-blue-500' }
    } else if (score === 3) {
      strength = { score: 60, label: 'Fair', color: 'bg-yellow-500' }
    } else if (score === 2) {
      strength = { score: 40, label: 'Weak', color: 'bg-orange-500' }
    } else {
      strength = { score: 20, label: 'Very Weak', color: 'bg-red-500' }
    }
    setPasswordStrength(strength)
  }, [password])
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!csrfToken) {
      toast.error('Security token not loaded. Please refresh the page.')
      return
    }
    if (!email || !token) {
      toast.error('Verification session expired. Please start over.')
      router.push('/forgot-password')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (passwordStrength.score < 60) {
      toast.error('Please choose a stronger password')
      return
    }
    const formData = new FormData(e.currentTarget)
    formData.append('email', email)
    formData.append('token', token)
    startTransition(async () => {
      try {
        const result = await updatePasswordWithOtpAction(formData)
        if (result?.error) {
          toast.error(result.error)
          // If token is invalid or expired, redirect to start over
          if (result.error.includes('expired') || result.error.includes('invalid')) {
            setTimeout(() => {
              router.push('/forgot-password')
            }, 2000)
          }
        } else if (result?.errors) {
          Object.entries(result.errors).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              errors.forEach(error => toast.error(`${field}: ${error}`))
            }
          })
        } else {
          toast.success('Password updated successfully!')
          // Redirect to login
          setTimeout(() => {
            router.push('/login?message=Password+updated+successfully.+Please+sign+in.')
          }, 1500)
        }
      } catch (_error) {
        toast.error('An unexpected error occurred. Please try again.')
      }
    })
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
  if (!email || !token) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Loading verification data...</p>
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    )
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CSRFTokenField />
      {/* Show verified email */}
      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
        <p className="text-sm text-green-600 dark:text-green-400">
          Verified for: <span className="font-medium">{email}</span>
        </p>
      </div>
      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isPending || csrfLoading}
            className="pl-10 pr-10"
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-auto p-1"
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
      {/* Password Strength Indicator */}
      {password && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Password strength</span>
            <span className="font-medium">{passwordStrength.label}</span>
          </div>
          <Progress value={passwordStrength.score} className="h-2" />
        </div>
      )}
      {/* Password Requirements */}
      {password && (
        <div className="space-y-1">
          <RequirementCheck met={requirements.length} text="At least 8 characters" />
          <RequirementCheck met={requirements.uppercase} text="One uppercase letter" />
          <RequirementCheck met={requirements.lowercase} text="One lowercase letter" />
          <RequirementCheck met={requirements.number} text="One number" />
          <RequirementCheck met={requirements.special} text="One special character" />
        </div>
      )}
      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isPending || csrfLoading}
            className="pl-10 pr-10"
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-auto p-1"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-red-500">Passwords do not match</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isPending || csrfLoading || !password || !confirmPassword || password !== confirmPassword}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating password...
          </>
        ) : csrfLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading security...
          </>
        ) : (
          'Update Password'
        )}
      </Button>
    </form>
  )
}
function RequirementCheck({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center space-x-2 text-xs">
      {met ? (
        <CheckCircle className="h-3 w-3 text-green-500" />
      ) : (
        <XCircle className="h-3 w-3 text-muted-foreground" />
      )}
      <span className={met ? 'text-green-600' : 'text-muted-foreground'}>
        {text}
      </span>
    </div>
  )
}