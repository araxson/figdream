'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Label, Progress, Separator, Tabs, TabsContent, TabsList, TabsTrigger, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui"
import { toast } from 'sonner'
import { Building, Shield, Users, User, Loader2, Lock, Smartphone, Mail, KeyRound } from 'lucide-react'
export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginStep, setLoginStep] = useState<'credentials' | 'otp' | 'success'>('credentials')
  const [otpValue, setOtpValue] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [otpProgress, setOtpProgress] = useState(0)
  const handleLogin = async (role: string) => {
    if (!email || !password) {
      toast.error('Please enter your email and password')
      return
    }
    setIsLoading(true)
    setSelectedRole(role)
    try {
      // Simulate initial login - In production, this would call Supabase auth
      await new Promise(resolve => setTimeout(resolve, 1500))
      // Simulate checking if user has 2FA enabled
      const has2FA = Math.random() > 0.3 // 70% chance user has 2FA enabled
      if (has2FA) {
        toast.success('Credentials verified! Please enter your verification code.')
        setLoginStep('otp')
        setOtpProgress(50)
        // Simulate sending OTP
        setTimeout(() => {
          toast.info('Verification code sent to your device')
        }, 500)
      } else {
        // Direct login without OTP
        completeLogin(role)
      }
    } catch (_error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  const handleOtpSubmit = async () => {
    if (otpValue.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }
    setIsLoading(true)
    setOtpProgress(75)
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Simulate OTP validation (90% success rate for demo)
      const isValidOtp = Math.random() > 0.1
      if (isValidOtp) {
        setOtpProgress(100)
        toast.success('Verification successful!')
        setLoginStep('success')
        setTimeout(() => {
          completeLogin(selectedRole)
        }, 1000)
      } else {
        setOtpProgress(50)
        toast.error('Invalid verification code. Please try again.')
        setOtpValue('')
      }
    } catch (_error) {
      setOtpProgress(50)
      toast.error('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  const completeLogin = (role: string) => {
    const roleRoutes: Record<string, string> = {
      'customer': '/customer',
      'staff': '/staff',
      'salon-owner': '/owner',
      'super-admin': '/admin',
    }
    toast.success(`Welcome back! Logging in as ${role}`)
    router.push(roleRoutes[role] || '/')
  }
  const handleOtpResend = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('New verification code sent!')
      setOtpValue('')
    } catch (_error) {
      toast.error('Failed to resend code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  const resetLogin = () => {
    setLoginStep('credentials')
    setOtpValue('')
    setOtpProgress(0)
    setSelectedRole('')
  }
  const roleCards = [
    {
      role: 'customer',
      title: 'Customer',
      description: 'Book appointments and manage your beauty routine',
      icon: User,
      href: '/auth/login/customer',
      color: 'text-blue-600',
    },
    {
      role: 'staff',
      title: 'Staff Member',
      description: 'Manage your appointments and schedule',
      icon: Users,
      href: '/auth/login/staff',
      color: 'text-green-600',
    },
    {
      role: 'salon-owner',
      title: 'Salon Owner',
      description: 'Manage your salon business and team',
      icon: Building,
      href: '/auth/login/salon',
      color: 'text-purple-600',
    },
    {
      role: 'super-admin',
      title: 'Super Admin',
      description: 'Platform administration and management',
      icon: Shield,
      href: '/auth/login/super-admin',
      color: 'text-red-600',
    },
  ]
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to your FigDream account
        </p>
      </div>
      {/* Authentication Progress */}
      {(loginStep === 'otp' || loginStep === 'success') && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Authentication Progress</span>
                <Badge variant="outline">
                  {loginStep === 'otp' ? 'Verification' : 'Success'}
                </Badge>
              </div>
              <Progress value={otpProgress} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Credentials ✓</span>
                <span>{loginStep === 'success' ? 'Complete ✓' : 'Verifying...'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Login Tabs */}
      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quick" disabled={loginStep !== 'credentials'}>Quick Login</TabsTrigger>
          <TabsTrigger value="role" disabled={loginStep !== 'credentials'}>Login by Role</TabsTrigger>
        </TabsList>
        {/* Quick Login Tab */}
        <TabsContent value="quick">
          {loginStep === 'credentials' && (
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-primary"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button
                  className="w-full"
                  onClick={() => handleLogin('customer')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/register" className="text-primary">
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </Card>
          )}
          {/* OTP Verification Step */}
          {loginStep === 'otp' && (
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center bg-primary/10">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Lock className="h-5 w-5" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Enter the 6-digit verification code sent to your authenticator app or device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP 
                    maxLength={6}
                    value={otpValue}
                    onChange={(value) => setOtpValue(value)}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn&apos;t receive the code?
                  </p>
                  <Button 
                    variant="link" 
                    className="h-auto p-0"
                    onClick={handleOtpResend}
                    disabled={isLoading}
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Resend code
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  className="w-full"
                  onClick={handleOtpSubmit}
                  disabled={isLoading || otpValue.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Verify & Continue
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetLogin}
                  disabled={isLoading}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </CardFooter>
            </Card>
          )}
          {/* Success Step */}
          {loginStep === 'success' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-100 mx-auto">
                    <Lock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Authentication Complete</h3>
                    <p className="text-sm text-green-700">
                      Successfully verified! Redirecting you now...
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {/* Role-Based Login Tab */}
        <TabsContent value="role">
          {loginStep === 'credentials' && (
            <>
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-center">Choose Your Role</CardTitle>
                  <CardDescription className="text-center">
                    Select your account type to continue with authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-email">Email</Label>
                    <Input
                      id="role-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="role-password">Password</Label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-primary"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="role-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-3">
                {roleCards.map((role) => (
                  <Card
                    key={role.role}
                    className="cursor-pointer"
                    onClick={() => handleLogin(role.role)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${role.color.split('-')[1]}-50 border border-${role.color.split('-')[1]}-200`}>
                            <role.icon className={`h-6 w-6 ${role.color}`} />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base">{role.title}</CardTitle>
                            <CardDescription className="text-sm">
                              {role.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {role.role.replace('-', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-primary">
                  Sign up
                </Link>
              </div>
            </>
          )}
          {/* OTP Step for Role-Based Login */}
          {loginStep === 'otp' && (
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center bg-primary/10">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Lock className="h-5 w-5" />
                  Verify Your Identity
                </CardTitle>
                <CardDescription>
                  Enter the 6-digit code from your authenticator app
                  {selectedRole && (
                    <>
                      <br />
                      <Badge variant="outline" className="mt-2">
                        Logging in as: {roleCards.find(r => r.role === selectedRole)?.title}
                      </Badge>
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP 
                    maxLength={6}
                    value={otpValue}
                    onChange={(value) => setOtpValue(value)}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn&apos;t receive the code?
                  </p>
                  <Button 
                    variant="link" 
                    className="h-auto p-0"
                    onClick={handleOtpResend}
                    disabled={isLoading}
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Resend verification code
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  className="w-full"
                  onClick={handleOtpSubmit}
                  disabled={isLoading || otpValue.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Complete Authentication
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetLogin}
                  disabled={isLoading}
                  className="w-full"
                >
                  Back to Role Selection
                </Button>
              </CardFooter>
            </Card>
          )}
          {/* Success Step for Role-Based Login */}
          {loginStep === 'success' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-100 mx-auto">
                    <Lock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Welcome!</h3>
                    <p className="text-sm text-green-700">
                      Authentication complete for {roleCards.find(r => r.role === selectedRole)?.title}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Redirecting to your dashboard...
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      {/* OAuth Options */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" disabled={isLoading}>
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
          Google
        </Button>
        <Button variant="outline" disabled={isLoading}>
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </Button>
      </div>
    </div>
  )
}