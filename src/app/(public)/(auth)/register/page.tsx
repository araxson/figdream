'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Building, Users, User, Loader2, Sparkles, ArrowRight, Mail, Lock, Eye, EyeOff, UserPlus, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/database/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        toast.error(error.message || 'Registration failed. Please try again.')
        return
      }

      if (data?.user) {
        toast.success('Account created successfully! Please check your email to verify.')
        router.push('/verify-email')
      }
    } catch (_error) {
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/oauth-callback`,
        },
      })
      
      if (error) {
        toast.error('Google sign-up failed. Please try again.')
      }
    } catch (_error) {
      toast.error('Google sign-up failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const roleOptions = [
    {
      title: 'Customer',
      description: 'Book appointments and manage your beauty routine',
      icon: User,
      href: '/register/customer',
    },
    {
      title: 'Staff Member',
      description: 'Join a salon and manage your work schedule',
      icon: Users,
      href: '/register/staff',
    },
    {
      title: 'Salon Owner',
      description: 'Register your salon and grow your business',
      icon: Building,
      href: '/register/salon',
    },
  ]

  const features = [
    'Online booking system',
    'Appointment reminders',
    'Loyalty rewards program',
    'Staff management tools',
    'Real-time analytics',
    'Secure payments',
  ]

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Column - Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-muted/30 p-12">
        <div className="max-w-md space-y-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-3xl font-bold">FigDream</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Start your beauty business journey
          </h1>
          <p className="text-lg text-muted-foreground">
            Join thousands of salons and beauty professionals using FigDream to grow their business.
          </p>
          
          {/* Features List */}
          <div className="space-y-3 pt-4">
            <p className="text-sm font-medium text-muted-foreground">Everything you need:</p>
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Role Options */}
          <div className="pt-6 space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Register as:</p>
            <div className="space-y-2">
              {roleOptions.map((role) => (
                <Link
                  key={role.href}
                  href={role.href}
                  className="group flex items-start space-x-3 p-3 rounded-lg border bg-background/60 backdrop-blur hover:bg-background/80 transition-all hover:shadow-sm"
                >
                  <role.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{role.title}</p>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Register Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center space-x-2 lg:hidden">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">FigDream</span>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>
                Enter your information to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-9"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-9 pr-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
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

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-9"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRegister()
                    }}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignup}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-center w-full space-y-2">
                <p className="text-muted-foreground">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </p>
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardFooter>
          </Card>

          {/* Mobile Role Options */}
          <div className="lg:hidden pt-4 space-y-3">
            <p className="text-sm font-medium text-muted-foreground text-center">Or register as:</p>
            <div className="space-y-2">
              {roleOptions.map((role) => (
                <Link
                  key={role.href}
                  href={role.href}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <role.icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{role.title}</p>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}