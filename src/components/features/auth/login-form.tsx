'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Chrome, Github } from 'lucide-react'
import { toast } from 'sonner'
import { signInWithEmail, signInWithOAuth } from '@/lib/actions/auth'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean(),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    try {
      const result = await signInWithEmail(data.email, data.password)
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      if (result.success && result.role) {
        toast.success('Welcome back!')
        
        // Role-based redirect logic
        const roleRedirects = {
          'super_admin': '/admin',
          'salon_owner': '/dashboard',
          'salon_manager': '/dashboard',
          'location_manager': '/dashboard',
          'staff': '/staff',
          'customer': '/customer'
        }
        
        const redirectPath = roleRedirects[result.role] || '/dashboard'
        router.push(redirectPath)
        router.refresh() // Force refresh to update auth state
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleOAuthLogin(provider: 'google' | 'github') {
    setIsLoading(true)
    try {
      const result = await signInWithOAuth(provider)
      if (result?.error) {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('OAuth error:', error)
      toast.error('Failed to sign in with ' + provider)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-2 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                        type="email"
                        placeholder="you@example.com"
                        className="pl-12 bg-muted/30 hover:bg-muted/40 transition-colors"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative flex">
                      <div className="absolute left-0 top-0 h-full w-10 flex items-center justify-center z-10">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <div className="absolute right-0 top-1/4 h-1/2 w-px bg-border" />
                      </div>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-12 pr-10 bg-muted/30 hover:bg-muted/40 transition-colors"
                        disabled={isLoading}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-7 w-7 hover:bg-muted/60"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
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
            
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
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
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                type="button" 
                disabled={isLoading}
                onClick={() => handleOAuthLogin('google')}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button 
                variant="outline" 
                type="button" 
                disabled={isLoading}
                onClick={() => handleOAuthLogin('github')}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <p className="text-center text-sm text-muted-foreground w-full">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}