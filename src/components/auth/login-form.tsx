'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { signInAction } from '@/lib/actions/auth'
import { useCSRFToken } from '@/hooks/use-csrf-token'
import { CSRFTokenField } from '@/components/shared/forms/csrf-token-field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
interface LoginFormProps {
  role?: 'customer' | 'staff' | 'salon_owner' | 'location_manager' | 'super_admin'
  redirectTo?: string
}
export function LoginForm({ role = 'customer', redirectTo }: LoginFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const { token: csrfToken, loading: csrfLoading, error: csrfError } = useCSRFToken()
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    setSuccessMessage('')
    
    if (!csrfToken) {
      setFieldErrors({ general: 'Security token not loaded. Please refresh the page.' })
      return
    }
    
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        const result = await signInAction(formData)
        if (result?.error) {
          setFieldErrors({ general: result.error })
          toast.error(result.error)
        } else if (result?.errors) {
          // Show field-specific errors
          const newErrors: Record<string, string> = {}
          Object.entries(result.errors).forEach(([field, errors]) => {
            if (Array.isArray(errors) && errors.length > 0) {
              newErrors[field] = errors[0]
            }
          })
          setFieldErrors(newErrors)
        } else {
          // Success - redirect will happen automatically
          setSuccessMessage('Login successful! Redirecting...')
          toast.success('Login successful! Redirecting...')
          // Fallback redirect if server action doesn't redirect
          setTimeout(() => {
            if (redirectTo) {
              router.push(redirectTo)
            } else {
              // Redirect based on role
              switch (role) {
                case 'super_admin':
                  router.push('/super-admin')
                  break
                case 'salon_owner':
                  router.push('/salon-owner')
                  break
                case 'location_manager':
                  router.push('/location-manager')
                  break
                case 'staff':
                  router.push('/staff-member')
                  break
                default:
                  router.push('/customer')
              }
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
      <Alert variant="destructive" className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Security initialization failed. Please reload the page to continue.
        </AlertDescription>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
          className="mt-3"
        >
          Reload Page
        </Button>
      </Alert>
    )
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CSRFTokenField />
      
      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {/* General Error Message */}
      {fieldErrors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{fieldErrors.general}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address
        </Label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            disabled={isPending || csrfLoading}
            className={cn(
              "pl-10 transition-all duration-200",
              fieldErrors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
            )}
            autoComplete="email"
            autoFocus
          />
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        {fieldErrors.email && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            disabled={isPending || csrfLoading}
            className={cn(
              "pl-10 pr-10 transition-all duration-200",
              fieldErrors.password && "border-red-500 focus:border-red-500 focus:ring-red-500"
            )}
            autoComplete="current-password"
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
            tabIndex={-1}
            disabled={isPending || csrfLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">
              {showPassword ? 'Hide password' : 'Show password'}
            </span>
          </Button>
        </div>
        {fieldErrors.password && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="remember" 
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            disabled={isPending || csrfLoading}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Label 
            htmlFor="remember" 
            className="text-sm font-normal cursor-pointer select-none"
          >
            Remember me
          </Label>
        </div>
        <a
          href="/forgot-password"
          className="text-sm text-primary hover:text-primary/80 transition-colors duration-200 underline-offset-4 hover:underline"
        >
          Forgot password?
        </a>
      </div>
      <Button
        type="submit"
        className="w-full h-11 font-medium transition-all duration-200"
        disabled={isPending || csrfLoading}
        size="lg"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : csrfLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading security...</span>
          </>
        ) : (
          <span>Sign in to your account</span>
        )}
      </Button>
    </form>
  )
}