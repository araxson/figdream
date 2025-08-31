'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  User, Mail, Lock, Phone, Calendar, MapPin, Heart, 
  Star, Gift, Sparkles, Info, Loader2, 
  Facebook, Instagram, Twitter 
} from 'lucide-react'

export default function CustomerRegistrationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSocial, setIsLoadingSocial] = useState<string | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToMarketing, setAgreedToMarketing] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthMonth: '',
    birthDay: '',
    zipCode: '',
    referralCode: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSocialAuth = async (provider: string) => {
    setIsLoadingSocial(provider)
    
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.info(`Redirecting to ${provider} for authentication...`)
      // In production, this would redirect to OAuth provider
      setTimeout(() => {
        router.push('/auth/oauth-callback')
      }, 1000)
    } catch (error) {
      toast.error(`Failed to connect with ${provider}`)
      console.error('Social auth error:', error)
    } finally {
      setIsLoadingSocial(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error('Please enter a valid email address')
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
      
      toast.success('Welcome to FigDream! Check your email to verify your account.')
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
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-none">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/50 dark:bg-black/50 backdrop-blur rounded-full">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Join FigDream</CardTitle>
          <CardDescription className="text-base">
            Discover salons, book appointments, and earn rewards
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-muted/50">
          <CardContent className="pt-6 text-center">
            <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Easy Booking</p>
            <p className="text-xs text-muted-foreground">24/7 online</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="pt-6 text-center">
            <Gift className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Earn Rewards</p>
            <p className="text-xs text-muted-foreground">Every visit</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="pt-6 text-center">
            <Star className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">VIP Access</p>
            <p className="text-xs text-muted-foreground">Exclusive deals</p>
          </CardContent>
        </Card>
      </div>

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>
            Sign up in seconds with your favorite social account or email
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Social Auth Options */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleSocialAuth('Google')}
              disabled={isLoadingSocial !== null}
            >
              {isLoadingSocial === 'Google' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleSocialAuth('Facebook')}
              disabled={isLoadingSocial !== null}
            >
              {isLoadingSocial === 'Facebook' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Facebook className="mr-2 h-4 w-4" />
              )}
              Continue with Facebook
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleSocialAuth('Apple')}
              disabled={isLoadingSocial !== null}
            >
              {isLoadingSocial === 'Apple' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              )}
              Continue with Apple
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <Input
                    id="firstName"
                    placeholder="Jane"
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

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Phone (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-muted-foreground">(optional)</span>
              </Label>
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
              <p className="text-xs text-muted-foreground">
                Get SMS reminders and exclusive offers
              </p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                At least 8 characters
              </p>
            </div>

            {/* Confirm Password */}
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

            <Separator />

            {/* Optional Info for Personalization */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Optional: Help us personalize your experience</h3>
              
              {/* Birthday */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthMonth">
                    Birthday Month
                  </Label>
                  <div className="relative">
                    <Input
                      id="birthMonth"
                      placeholder="MM"
                      maxLength={2}
                      value={formData.birthMonth}
                      onChange={(e) => handleInputChange('birthMonth', e.target.value)}
                      className="pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDay">
                    Birthday Day
                  </Label>
                  <Input
                    id="birthDay"
                    placeholder="DD"
                    maxLength={2}
                    value={formData.birthDay}
                    onChange={(e) => handleInputChange('birthDay', e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Get a special birthday treat!
              </p>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="zipCode">
                  ZIP Code
                </Label>
                <div className="relative">
                  <Input
                    id="zipCode"
                    placeholder="94105"
                    maxLength={10}
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="pl-10"
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Find salons near you
                </p>
              </div>

              {/* Referral Code */}
              <div className="space-y-2">
                <Label htmlFor="referralCode">
                  Referral Code
                </Label>
                <div className="relative">
                  <Input
                    id="referralCode"
                    placeholder="Enter code"
                    value={formData.referralCode}
                    onChange={(e) => handleInputChange('referralCode', e.target.value)}
                    className="pl-10"
                  />
                  <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Have a referral code? Both you and your friend get rewards!
                </p>
              </div>
            </div>

            <Separator />

            {/* Terms and Marketing */}
            <div className="space-y-3">
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
                    {' '}and{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="marketing"
                  checked={agreedToMarketing}
                  onCheckedChange={(checked) => setAgreedToMarketing(checked as boolean)}
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="marketing"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Send me exclusive offers, beauty tips, and reminders
                  </Label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !agreedToTerms}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login/customer" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Heart className="h-3 w-3" />
          <span>Loved by 50K+ customers</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          <span>4.9 star rating</span>
        </div>
      </div>
    </div>
  )
}