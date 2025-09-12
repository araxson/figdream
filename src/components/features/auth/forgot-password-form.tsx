'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Mail, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setError(null)
    setLoading(true)
    
    try {
      // Send OTP for password reset
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          shouldCreateUser: false,
          data: {
            type: 'password-reset'
          }
        }
      })

      if (error) {
        // If user doesn't exist, still show success for security
        if (error.message.includes('User not found')) {
          sessionStorage.setItem('reset-email', values.email)
          router.push('/verify-otp?type=password-reset')
        } else {
          setError(error.message)
        }
        setLoading(false)
        return
      }

      // Store email in session storage for OTP verification
      sessionStorage.setItem('reset-email', values.email)
      
      // Redirect to OTP verification page
      router.push('/verify-otp?type=password-reset')
    } catch {
      setError('An unexpected error occurred')
      setLoading(false)
    }
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative flex">
                    <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div className="absolute right-0 top-1/4 h-1/2 w-px bg-border" />
                    </div>
                    <Input 
                      placeholder="email@example.com" 
                      type="email" 
                      className="pl-12 bg-muted/30 hover:bg-muted/40 transition-colors"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending code...
              </>
            ) : (
              'Send verification code'
            )}
          </Button>
          
          <p className="text-sm text-center text-muted-foreground">
            Remember your password?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </Form>
    </>
  )
}