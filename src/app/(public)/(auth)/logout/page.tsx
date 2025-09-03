'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  AlertDescription,
  Separator,
} from '@/components/ui'
import { toast } from 'sonner'
import { 
  LogOut, CheckCircle, Home, ArrowLeft, 
  Shield, Heart, Star, TrendingUp, Calendar,
  Loader2, User
} from 'lucide-react'
interface SessionStats {
  duration?: string
  bookingsMade?: number
  servicesViewed?: number
  lastActivity?: string
}
export default function LogoutPage() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(true)
  const [logoutComplete, setLogoutComplete] = useState(false)
  const [sessionStats, setSessionStats] = useState<SessionStats>({})
  const [redirectCountdown, setRedirectCountdown] = useState(5)
  const [autoRedirect, setAutoRedirect] = useState(true)
  useEffect(() => {
    performLogout()
  }, [])
  useEffect(() => {
    // Auto-redirect countdown
    if (logoutComplete && autoRedirect && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (logoutComplete && autoRedirect && redirectCountdown === 0) {
      router.push('/')
    }
  }, [logoutComplete, redirectCountdown, autoRedirect, router])
  const performLogout = async () => {
    try {
      // Simulate logout process
      await new Promise(resolve => setTimeout(resolve, 1500))
      // Simulate fetching session stats
      setSessionStats({
        duration: '45 minutes',
        bookingsMade: 2,
        servicesViewed: 12,
        lastActivity: 'Viewed salon profile'
      })
      // Clear any local storage or session data
      // localStorage.removeItem('user')
      // sessionStorage.clear()
      setLogoutComplete(true)
      toast.success('You have been signed out successfully')
    } catch (_error) {
      toast.error('There was an issue signing out. Please try again.')
      setLogoutComplete(true) // Still show logout screen even if error
    } finally {
      setIsLoggingOut(false)
    }
  }
  const handleStaySignedIn = () => {
    toast.info('Returning to dashboard...')
    router.push('/dashboard')
  }
  const stopAutoRedirect = () => {
    setAutoRedirect(false)
    setRedirectCountdown(0)
  }
  // Logging out state
  if (isLoggingOut) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative">
                <LogOut className="h-12 w-12 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">Signing you out...</p>
                <p className="text-sm text-muted-foreground">
                  Please wait while we securely end your session
                </p>
              </div>
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  // Logout complete
  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Main Card */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">You&apos;ve Been Signed Out</CardTitle>
          <CardDescription>
            Thanks for using FigDream. See you again soon!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Summary */}
          {(sessionStats.duration || sessionStats.bookingsMade) && (
            <>
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Your Session Summary
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {sessionStats.duration && (
                    <div>
                      <p className="text-muted-foreground">Session Duration</p>
                      <p className="font-medium">{sessionStats.duration}</p>
                    </div>
                  )}
                  {sessionStats.bookingsMade !== undefined && sessionStats.bookingsMade > 0 && (
                    <div>
                      <p className="text-muted-foreground">Bookings Made</p>
                      <p className="font-medium">{sessionStats.bookingsMade}</p>
                    </div>
                  )}
                  {sessionStats.servicesViewed !== undefined && (
                    <div>
                      <p className="text-muted-foreground">Services Viewed</p>
                      <p className="font-medium">{sessionStats.servicesViewed}</p>
                    </div>
                  )}
                  {sessionStats.lastActivity && (
                    <div>
                      <p className="text-muted-foreground">Last Activity</p>
                      <p className="font-medium">{sessionStats.lastActivity}</p>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}
          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your session has been securely terminated. If you&apos;re using a shared device, 
              we recommend clearing your browser history for added security.
            </AlertDescription>
          </Alert>
          {/* Auto-redirect notice */}
          {autoRedirect && redirectCountdown > 0 && (
            <div className="text-center space-y-2 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Redirecting to homepage in {redirectCountdown} seconds...
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={stopAutoRedirect}
              >
                Stay on this page
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={() => router.push('/auth/login')}
          >
            <User className="mr-2 h-4 w-4" />
            Sign In Again
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => router.push('/')}
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Homepage
          </Button>
        </CardFooter>
      </Card>
      {/* Quick Actions */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm font-medium mb-4">While you&apos;re here:</p>
          <div className="grid gap-3">
            <Button asChild variant="ghost" className="h-auto p-3 justify-between group">
              <Link href="/book">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Browse Salons</p>
                    <p className="text-xs text-muted-foreground">
                      No account needed to explore
                    </p>
                  </div>
                </div>
                <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="h-auto p-3 justify-between group">
              <Link href="/features">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Explore Features</p>
                    <p className="text-xs text-muted-foreground">
                      See what FigDream offers
                    </p>
                  </div>
                </div>
                <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="h-auto p-3 justify-between group">
              <Link href="/pricing">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">View Pricing</p>
                    <p className="text-xs text-muted-foreground">
                      Plans for salons and customers
                    </p>
                  </div>
                </div>
                <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Footer Message */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Questions or concerns?</p>
        <Link href="/contact" className="text-primary">
          Contact our support team
        </Link>
      </div>
      {/* Hidden: Changed your mind? */}
      {logoutComplete && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStaySignedIn}
            className="text-xs text-muted-foreground h-auto p-1"
          >
            Changed your mind? Click here to stay signed in
          </Button>
        </div>
      )}
    </div>
  )
}