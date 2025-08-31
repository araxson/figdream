'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Users, Mail, Lock, User, Phone, Calendar, Briefcase, MapPin, CheckCircle, Info, Loader2 } from 'lucide-react'

export default function StaffRegistrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [invitationValid, setInvitationValid] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  
  // Get invitation token from URL
  const invitationToken = searchParams.get('token')
  
  // Mock invitation data (would come from API based on token)
  const [invitationData, setInvitationData] = useState({
    salonName: '',
    locationName: '',
    inviterName: '',
    role: '',
    email: '',
  })

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    emergencyContact: '',
    emergencyPhone: '',
  })

  useEffect(() => {
    // Simulate verifying invitation token
    const verifyInvitation = async () => {
      if (!invitationToken) {
        setIsVerifying(false)
        return
      }

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock invitation data
        setInvitationData({
          salonName: 'Glamour Studio',
          locationName: 'Downtown Location',
          inviterName: 'Sarah Johnson',
          role: 'Senior Stylist',
          email: 'newstaff@glamourstudio.com',
        })
        setFormData(prev => ({ ...prev, email: 'newstaff@glamourstudio.com' }))
        setInvitationValid(true)
      } catch (error) {
        console.error('Invitation verification error:', error)
        toast.error('Invalid or expired invitation')
      } finally {
        setIsVerifying(false)
      }
    }

    verifyInvitation()
  }, [invitationToken])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!formData.password || formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }

    setIsLoading(true)

    try {
      // Simulate registration
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Account created successfully! Welcome to the team!')
      router.push('/staff')
    } catch (error) {
      toast.error('Registration failed. Please try again.')
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while verifying invitation
  if (isVerifying) {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Verifying invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No invitation or invalid invitation
  if (!invitationToken || !invitationValid) {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <Users className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">Staff Registration</CardTitle>
            <CardDescription>
              An invitation is required to create a staff account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Staff accounts can only be created through an invitation from your salon manager. 
                If you believe you should have received an invitation, please contact your manager 
                or salon administrator.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold">How it works:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your salon manager sends you an invitation email</li>
                <li>Click the link in the email to access this registration page</li>
                <li>Complete your profile to activate your account</li>
                <li>Start managing your schedule and appointments</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" variant="outline" asChild>
              <Link href="/auth/login/staff">
                Already have an account? Sign in
              </Link>
            </Button>
            <Button className="w-full" variant="ghost" asChild>
              <Link href="/contact">
                Contact Support
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Valid invitation - show registration form
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Invitation Details */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Invitation Verified</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Salon</p>
              <p className="font-medium">{invitationData.salonName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium">{invitationData.locationName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Invited by</p>
              <p className="font-medium">{invitationData.inviterName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Position</p>
              <Badge variant="secondary">{invitationData.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          </div>
          <CardDescription>
            Set up your staff account to start managing your schedule
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Personal Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="pl-10"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="pl-10 bg-muted"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  This email was provided in your invitation
                </p>
              </div>

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
              </div>
            </div>

            <Separator />

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="font-semibold">Emergency Contact</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    placeholder="Jane Doe"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    placeholder="(555) 987-6543"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Account Security */}
            <div className="space-y-4">
              <h3 className="font-semibold">Set Your Password</h3>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with a mix of letters and numbers
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="terms"
                  className="text-sm font-normal cursor-pointer"
                >
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                  ,{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  , and staff code of conduct
                </Label>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              asChild
            >
              <Link href="/auth/login/staff">
                Cancel
              </Link>
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !agreedToTerms}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Features Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">What you&apos;ll get access to:</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Personal schedule management</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Client appointment booking</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <span>Commission tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Multi-location access</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}