'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { 
  Loader2, CheckCircle, XCircle, AlertTriangle, 
  ShieldCheck, User, RefreshCw, Home
} from 'lucide-react'

type OAuthProvider = 'google' | 'facebook' | 'apple' | 'github'
type AuthState = 'processing' | 'success' | 'error' | 'requires-info'

interface UserInfo {
  email?: string
  name?: string
  provider?: OAuthProvider
  needsOnboarding?: boolean
  role?: string
}

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [authState, setAuthState] = useState<AuthState>('processing')
  const [errorMessage, setErrorMessage] = useState('')
  const [userInfo, setUserInfo] = useState<UserInfo>({})
  const [countdown, setCountdown] = useState(3)
  
  // Get OAuth parameters from URL
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const provider = searchParams.get('provider') as OAuthProvider
  
  useEffect(() => {
    handleOAuthCallback()
  }, [code, error])

  useEffect(() => {
    // Countdown timer for redirect
    if (authState === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (authState === 'success' && countdown === 0) {
      redirectToDashboard()
    }
  }, [authState, countdown])

  const handleOAuthCallback = async () => {
    // Check for OAuth errors
    if (error) {
      setAuthState('error')
      setErrorMessage(errorDescription || 'Authentication failed')
      
      if (error === 'access_denied') {
        toast.error('You denied access to your account')
      } else {
        toast.error('Authentication failed')
      }
      return
    }
    
    // Verify we have required parameters
    if (!code || !state) {
      setAuthState('error')
      setErrorMessage('Invalid authentication response. Missing required parameters.')
      toast.error('Invalid authentication response')
      return
    }
    
    try {
      // Simulate OAuth token exchange and user creation/login
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate different scenarios
      const scenario = Math.random()
      
      if (scenario < 0.7) {
        // Success - existing user
        setAuthState('success')
        setUserInfo({
          email: 'user@example.com',
          name: 'John Doe',
          provider: provider || 'google',
          role: 'customer',
          needsOnboarding: false
        })
        toast.success('Welcome back!')
      } else if (scenario < 0.9) {
        // Success - new user needs onboarding
        setAuthState('requires-info')
        setUserInfo({
          email: 'newuser@example.com',
          name: 'Jane Smith',
          provider: provider || 'google',
          needsOnboarding: true
        })
      } else {
        // Error
        throw new Error('Failed to authenticate with OAuth provider')
      }
    } catch (err) {
      console.error('OAuth callback error:', err)
      setAuthState('error')
      setErrorMessage('Failed to complete authentication. Please try again.')
      toast.error('Authentication failed')
    }
  }

  const redirectToDashboard = () => {
    const role = userInfo.role || 'customer'
    const dashboardRoutes: Record<string, string> = {
      super_admin: '/admin',
      salon_admin: '/salon',
      staff: '/staff',
      customer: '/dashboard'
    }
    
    router.push(dashboardRoutes[role] || '/dashboard')
  }

  const handleCompleteProfile = () => {
    // Redirect to profile completion with OAuth data
    router.push(`/onboarding?provider=${userInfo.provider}&email=${userInfo.email}`)
  }

  const handleRetry = () => {
    // Go back to login with the provider
    router.push(`/auth/login?retry=true&provider=${provider}`)
  }

  // Processing state
  if (authState === 'processing') {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 animate-ping">
                  <ShieldCheck className="h-12 w-12 text-primary opacity-25" />
                </div>
                <ShieldCheck className="h-12 w-12 text-primary relative" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">Completing authentication...</p>
                <p className="text-sm text-muted-foreground">
                  Securely signing you in with {provider || 'your account'}
                </p>
              </div>
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (authState === 'success') {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Authentication Successful!</CardTitle>
            <CardDescription>
              Welcome {userInfo.needsOnboarding ? '' : 'back'}, {userInfo.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p>Signed in with {userInfo.provider}</p>
                  <p className="text-xs text-muted-foreground">{userInfo.email}</p>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Redirecting to your dashboard in {countdown} seconds...
              </p>
              <div className="flex justify-center">
                <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            <Button
              className="w-full"
              onClick={redirectToDashboard}
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard Now
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Requires additional info state (new user)
  if (authState === 'requires-info') {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Almost There!</CardTitle>
            <CardDescription>
              Let&apos;s complete your profile to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Account created successfully with {userInfo.provider}
              </AlertDescription>
            </Alert>
            
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <p className="text-sm font-medium">We just need a few more details:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your phone number for appointment reminders</li>
                <li>• Your location to find nearby salons</li>
                <li>• Your beauty preferences for personalized recommendations</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={handleCompleteProfile}
              >
                Complete Profile
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Skip for Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (authState === 'error') {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">Authentication Failed</CardTitle>
            <CardDescription>
              We couldn&apos;t complete the sign-in process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage || 'An unexpected error occurred during authentication'}
              </AlertDescription>
            </Alert>
            
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">Common issues:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• You cancelled the sign-in process</li>
                <li>• The authentication session expired</li>
                <li>• Your account needs additional verification</li>
                <li>• Network connection issues</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={handleRetry}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push('/auth/login')}
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}