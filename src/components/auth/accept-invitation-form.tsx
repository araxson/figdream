'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, CheckCircle, XCircle, UserPlus, Mail, Lock } from 'lucide-react'
import { createClient } from '@/lib/database/supabase/client'

export function AcceptInvitationForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [loading, setLoading] = useState(true)
  interface StaffInvitation {
    id: string
    email: string
    role: string
    salon_id: string
    expires_at: string
    invited_by: string
    salons?: { name: string }
  }

  const [invitation, setInvitation] = useState<StaffInvitation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')

  // Validate invitation token on load
  useEffect(() => {
    const validateInvitation = async () => {
      if (!token) {
        setError('No invitation token provided')
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('staff_invitations')
          .select(`
            *,
            salons (
              name,
              logo_url
            )
          `)
          .eq('invitation_token', token)
          .is('accepted_at', null)
          .gte('expires_at', new Date().toISOString())
          .single()

        if (fetchError || !data) {
          setError('Invalid or expired invitation')
        } else {
          setInvitation(data)
          setEmail(data.email)
        }
      } catch (_err) {
        setError('Failed to validate invitation')
      } finally {
        setLoading(false)
      }
    }

    validateInvitation()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    // Validate password strength
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Step 1: Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
            phone,
            invited_by: invitation.invited_by,
            salon_id: invitation.salon_id
          }
        }
      })

      if (signUpError) {
        toast.error(signUpError.message)
        setIsSubmitting(false)
        return
      }

      if (!authData.user) {
        toast.error('Failed to create account')
        setIsSubmitting(false)
        return
      }

      // Step 2: Accept invitation (this will create role and profile via database function)
      const { data: acceptData, error: acceptError } = await supabase
        .rpc('accept_staff_invitation', {
          p_invitation_token: token,
          p_user_id: authData.user.id
        })

      if (acceptError) {
        toast.error('Failed to accept invitation')
        setIsSubmitting(false)
        return
      }

      if (!acceptData?.success) {
        toast.error(acceptData?.error || 'Failed to accept invitation')
        setIsSubmitting(false)
        return
      }

      // Success!
      toast.success('Account created successfully! Please check your email to verify your account.')
      
      // Redirect based on role
      if (invitation.role === 'location_manager') {
        router.push('/login/staff?registered=true')
      } else {
        router.push('/login/staff?registered=true')
      }
    } catch (_err) {
      toast.error('An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-center">Invalid Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Please contact your salon owner for a new invitation.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <a href="/login">Go to Login</a>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
            <UserPlus className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Accept Staff Invitation</h1>
        <p className="text-muted-foreground">
          You&apos;ve been invited to join {invitation.salons?.name}
        </p>
      </div>

      {/* Invitation Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invitation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Salon:</span>
              <span className="font-medium">{invitation.salons?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Role:</span>
              <span className="font-medium capitalize">{invitation.role.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{invitation.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>
            Complete your registration to accept the invitation
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Email (pre-filled and disabled) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="pl-10"
                />
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Password Fields */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="pl-10"
                  placeholder="Minimum 8 characters"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept Invitation & Create Account
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              By accepting, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}