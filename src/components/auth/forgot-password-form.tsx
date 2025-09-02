'use client'

import { useState, useTransition } from 'react'
import { Button, Input, Label } from '@/components/ui'
import { toast } from 'sonner'
import { Loader2, Mail, CheckCircle } from 'lucide-react'
import { resetPasswordAction } from '@/app/_actions/auth'
import { useCSRFToken, CSRFTokenField } from '@/lib/hooks/use-csrf-token'

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const { token: csrfToken, loading: csrfLoading, error: csrfError } = useCSRFToken()

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
          setEmailSent(true)
          toast.success(result.message || 'Password reset email sent!')
        }
      } catch (error) {
        console.error('Password reset error:', error)
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

  if (emailSent) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Check Your Email</h3>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to:
          </p>
          <p className="font-medium">{email}</p>
        </div>
        <div className="pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setEmailSent(false)
              setEmail('')
            }}
            className="w-full"
          >
            Send Another Email
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
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
            Sending reset email...
          </>
        ) : csrfLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading security...
          </>
        ) : (
          'Send Reset Email'
        )}
      </Button>
    </form>
  )
}