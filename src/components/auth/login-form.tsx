'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Label, Checkbox } from '@/components/ui'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { signInAction } from '@/app/_actions/auth'
import { useCSRFToken, CSRFTokenField } from '@/lib/hooks/use-csrf-token'

interface LoginFormProps {
  role?: 'customer' | 'staff' | 'salon_owner' | 'location_manager' | 'super_admin'
  redirectTo?: string
}

export function LoginForm({ role = 'customer', redirectTo }: LoginFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { token: csrfToken, loading: csrfLoading, error: csrfError } = useCSRFToken()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!csrfToken) {
      toast.error('Security token not loaded. Please refresh the page.')
      return
    }

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        const result = await signInAction(formData)
        
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
                  router.push('/staff')
                  break
                default:
                  router.push('/customer')
              }
            }
          }, 1000)
        }
      } catch (error) {
        console.error('Login error:', error)
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
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            required
            disabled={isPending || csrfLoading}
            className="pl-10"
          />
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

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
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto p-1"
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

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="remember" 
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            disabled={isPending || csrfLoading}
          />
          <Label 
            htmlFor="remember" 
            className="text-sm font-normal cursor-pointer"
          >
            Remember me
          </Label>
        </div>
        <a
          href="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot password?
        </a>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || csrfLoading}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : csrfLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading security...
          </>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  )
}