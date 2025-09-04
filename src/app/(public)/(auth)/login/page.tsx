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
import { Building, Shield, Users, User, Loader2, Sparkles, ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/database/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter your email and password')
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message || 'Login failed. Please try again.')
        return
      }

      if (data?.user) {
        // Get user role to determine redirect
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('is_active', true)
          .maybeSingle()
        
        const role = roleData?.role || 'customer'
        toast.success('Welcome back!')
        
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
    } catch (_error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/oauth-callback`,
        },
      })
      
      if (error) {
        toast.error('Google sign-in failed. Please try again.')
      }
    } catch (_error) {
      toast.error('Google sign-in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const roleLinks = [
    {
      title: 'Customer',
      description: 'Book appointments',
      icon: User,
      href: '/login/customer',
    },
    {
      title: 'Staff',
      description: 'Manage schedule',
      icon: Users,
      href: '/login/staff',
    },
    {
      title: 'Salon Owner',
      description: 'Run your business',
      icon: Building,
      href: '/login/salon-owner',
    },
    {
      title: 'Admin',
      description: 'Platform control',
      icon: Shield,
      href: '/login/super-admin',
    },
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
            Welcome back to your beauty journey
          </h1>
          <p className="text-lg text-muted-foreground">
            Access your personalized dashboard, manage appointments, and grow your beauty business.
          </p>
          
          {/* Quick Role Links */}
          <div className="pt-8 space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Quick access by role:</p>
            <div className="grid grid-cols-2 gap-3">
              {roleLinks.map((role) => (
                <Link
                  key={role.href}
                  href={role.href}
                  className="group flex flex-col p-3 rounded-lg border bg-background/60 backdrop-blur hover:bg-background/80 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <role.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium">{role.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{role.description}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center space-x-2 lg:hidden">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">FigDream</span>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLogin()
                    }}
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

              <Button
                className="w-full"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
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
                onClick={handleGoogleLogin}
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
              <p className="text-sm text-center w-full text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>

          {/* Mobile Role Links */}
          <div className="lg:hidden pt-4 space-y-3">
            <p className="text-sm font-medium text-muted-foreground text-center">Or select your role:</p>
            <div className="grid grid-cols-2 gap-2">
              {roleLinks.map((role) => (
                <Link
                  key={role.href}
                  href={role.href}
                  className="flex items-center justify-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <role.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{role.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}