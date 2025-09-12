'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, CheckCircle, Lock, Loader2 } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export function ResetPasswordForm() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    // Check if user has verified OTP
    const hasSession = sessionStorage.getItem('password-reset-session')
    if (!hasSession) {
      router.push('/forgot-password')
    }
  }, [router])

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password
      })

      if (error) {
        setError(error.message)
        return
      }

      // Clear the session storage
      sessionStorage.removeItem('password-reset-session')
      sessionStorage.removeItem('reset-email')
      
      setSuccess(true)
      
      // Sign out the user to force them to login with new password
      await supabase.auth.signOut()
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch {
      setError('An unexpected error occurred')
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Password reset successful! Redirecting to login...
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <div className="relative flex">
                    <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center z-10">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <div className="absolute right-0 top-1/4 h-1/2 w-px bg-border" />
                    </div>
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      className="pl-12 pr-10 bg-muted/30 hover:bg-muted/40 transition-colors"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-7 w-7 hover:bg-muted/60"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Must be at least 8 characters with uppercase, lowercase, number and special character
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <div className="relative flex">
                    <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center z-10">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <div className="absolute right-0 top-1/4 h-1/2 w-px bg-border" />
                    </div>
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      className="pl-12 pr-10 bg-muted/30 hover:bg-muted/40 transition-colors"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-7 w-7 hover:bg-muted/60"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </Form>
    </>
  )
}