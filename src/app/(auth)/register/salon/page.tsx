'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Building, User, Mail, Phone, MapPin, Lock, Loader2, CheckCircle, Info, ArrowRight } from 'lucide-react'

export default function SalonRegistrationPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Salon Info
    salonName: '',
    salonType: '',
    employeeCount: '',
    // Step 2: Location
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    // Step 3: Owner Info
    ownerFirstName: '',
    ownerLastName: '',
    email: '',
    phone: '',
    // Step 4: Account Setup
    password: '',
    confirmPassword: '',
  })

  const salonTypes = [
    'Hair Salon',
    'Nail Salon',
    'Spa & Wellness',
    'Barbershop',
    'Beauty Salon',
    'Multi-Service Salon',
  ]

  const employeeCounts = [
    '1-3 employees',
    '4-10 employees',
    '11-25 employees',
    '26-50 employees',
    '50+ employees',
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        if (!formData.salonName || !formData.salonType || !formData.employeeCount) {
          toast.error('Please fill in all salon information')
          return false
        }
        break
      case 2:
        if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
          toast.error('Please fill in all location details')
          return false
        }
        break
      case 3:
        if (!formData.ownerFirstName || !formData.ownerLastName || !formData.email || !formData.phone) {
          toast.error('Please fill in all owner information')
          return false
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast.error('Please enter a valid email address')
          return false
        }
        break
      case 4:
        if (!formData.password || !formData.confirmPassword) {
          toast.error('Please enter and confirm your password')
          return false
        }
        if (formData.password.length < 8) {
          toast.error('Password must be at least 8 characters')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match')
          return false
        }
        if (!agreedToTerms) {
          toast.error('Please agree to the terms and conditions')
          return false
        }
        break
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(4)) return

    setIsLoading(true)

    try {
      // Simulate registration
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Registration successful! Check your email to verify your account.')
      router.push('/auth/verify-email')
    } catch (error) {
      toast.error('Registration failed. Please try again.')
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                i <= step
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < step ? <CheckCircle className="h-5 w-5" /> : i}
            </div>
            {i < 4 && (
              <div
                className={`w-24 h-1 ${
                  i < step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Register Your Salon</CardTitle>
          </div>
          <CardDescription>
            {step === 1 && 'Tell us about your salon business'}
            {step === 2 && 'Where is your salon located?'}
            {step === 3 && 'Owner information'}
            {step === 4 && 'Create your account'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Step 1: Salon Information */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="salonName">Salon Name</Label>
                  <Input
                    id="salonName"
                    placeholder="Enter your salon name"
                    value={formData.salonName}
                    onChange={(e) => handleInputChange('salonName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salonType">Salon Type</Label>
                  <Select
                    value={formData.salonType}
                    onValueChange={(value) => handleInputChange('salonType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select salon type" />
                    </SelectTrigger>
                    <SelectContent>
                      {salonTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeCount">Number of Employees</Label>
                  <Select
                    value={formData.employeeCount}
                    onValueChange={(value) => handleInputChange('employeeCount', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee count" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeCounts.map((count) => (
                        <SelectItem key={count} value={count}>
                          {count}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <div className="relative">
                    <Input
                      id="address"
                      placeholder="123 Main Street"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="pl-10"
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="San Francisco"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="CA"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      maxLength={2}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="94105"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => handleInputChange('country', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Owner Information */}
            {step === 3 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerFirstName">First Name</Label>
                    <div className="relative">
                      <Input
                        id="ownerFirstName"
                        placeholder="John"
                        value={formData.ownerFirstName}
                        onChange={(e) => handleInputChange('ownerFirstName', e.target.value)}
                        className="pl-10"
                      />
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerLastName">Last Name</Label>
                    <Input
                      id="ownerLastName"
                      placeholder="Doe"
                      value={formData.ownerLastName}
                      onChange={(e) => handleInputChange('ownerLastName', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="owner@yoursalon.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
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
              </>
            )}

            {/* Step 4: Account Setup */}
            {step === 4 && (
              <>
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
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Your plan includes:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• 14-day free trial (no credit card required)</li>
                      <li>• Unlimited bookings and staff members</li>
                      <li>• Marketing tools and analytics</li>
                      <li>• 24/7 customer support</li>
                    </ul>
                  </AlertDescription>
                </Alert>

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
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            {step === 1 && (
              <Link href="/auth/register">
                <Button variant="outline">Back to Options</Button>
              </Link>
            )}
            
            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="ml-auto"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="ml-auto"
                disabled={isLoading || !agreedToTerms}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>

      {/* Help Links */}
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login/salon-owner" className="text-primary hover:underline">
          Sign in here
        </Link>
        {' • '}
        <Link href="/contact" className="text-primary hover:underline">
          Need help?
        </Link>
      </div>
    </div>
  )
}