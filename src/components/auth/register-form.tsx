'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react'
import { signUpAction } from '@/lib/actions/auth'
import { useCSRFToken } from '@/hooks/use-csrf-token'
import { CSRFTokenField } from '@/components/shared/forms/csrf-token-field'
interface RegisterFormProps {
  role?: 'customer' | 'staff' | 'salon_owner' | 'location_manager' | 'super_admin'
  redirectTo?: string
  includePhone?: boolean
  includeBusinessInfo?: boolean
}
export function RegisterForm({ 
  role = 'customer', 
  redirectTo,
  includePhone = false,
  includeBusinessInfo = false
}: RegisterFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToMarketing, setAgreedToMarketing] = useState(false)
  const { token: csrfToken, loading: csrfLoading, error: csrfError } = useCSRFToken()
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!csrfToken) {
      toast.error('Security token not loaded. Please refresh the page.')
      return
    }
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }
    const formData = new FormData(e.currentTarget)
    formData.append('role', role)
    startTransition(async () => {
      try {
        const result = await signUpAction(formData)
        if (result?.error) {
          toast.error(result.error)
        } else if (result?.errors) {
          // Show field-specific errors
          Object.entries(result.errors).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              errors.forEach(error => toast.error(`${field}: ${error}`))
            }
          })
        } else {
          // Success - redirect will happen automatically
          toast.success('Registration successful! Please check your email to verify your account.')
          // Fallback redirect if server action doesn't redirect
          setTimeout(() => {
            if (redirectTo) {
              router.push(redirectTo)
            } else {
              router.push('/verify-email')
            }
          }, 1000)
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
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CSRFTokenField />
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <div className="relative">
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="First name"
              required
              disabled={isPending || csrfLoading}
              className="pl-10"
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Last name"
            required
            disabled={isPending || csrfLoading}
          />
        </div>
      </div>
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email address"
            required
            disabled={isPending || csrfLoading}
            className="pl-10"
          />
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      {/* Phone Field (optional) */}
      {includePhone && (
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Phone number"
              disabled={isPending || csrfLoading}
              className="pl-10"
            />
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}
      {/* Business Info (for salon owners) */}
      {includeBusinessInfo && (
        <>
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              name="businessName"
              type="text"
              placeholder="Salon Name"
              required
              disabled={isPending || csrfLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessAddress">Business Address</Label>
            <Input
              id="businessAddress"
              name="businessAddress"
              type="text"
              placeholder="123 Main St, City, State"
              required
              disabled={isPending || csrfLoading}
            />
          </div>
        </>
      )}
      {/* Password Fields */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
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
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
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
      </div>
      {/* Terms and Marketing */}
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="terms" 
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            disabled={isPending || csrfLoading}
            className="mt-0.5"
          />
          <Label 
            htmlFor="terms" 
            className="text-sm font-normal cursor-pointer leading-relaxed"
          >
            I agree to the{' '}
            <a href="/terms" className="text-primary" target="_blank">
              Terms and Conditions
            </a>
            {' '}and{' '}
            <a href="/privacy" className="text-primary" target="_blank">
              Privacy Policy
            </a>
          </Label>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="marketing" 
            checked={agreedToMarketing}
            onCheckedChange={(checked) => setAgreedToMarketing(checked as boolean)}
            disabled={isPending || csrfLoading}
            className="mt-0.5"
          />
          <Label 
            htmlFor="marketing" 
            className="text-sm font-normal cursor-pointer leading-relaxed"
          >
            I would like to receive promotional emails and special offers
          </Label>
        </div>
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isPending || csrfLoading || !agreedToTerms}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : csrfLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading security...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  )
}