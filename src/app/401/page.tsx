'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, ArrowLeft, LogIn, Home, 
  AlertTriangle, HelpCircle, Mail
} from 'lucide-react'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Main Card */}
        <Card className="border-orange-200 dark:border-orange-900/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <Shield className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">401 - Authentication Required</CardTitle>
            <CardDescription className="text-base mt-2">
              You need to sign in to access this page
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className="border-orange-200 dark:border-orange-900/50">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <AlertDescription>
                This page requires authentication. Please sign in with your account to continue.
                If you don&apos;t have an account yet, you can create one for free.
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-muted rounded-lg space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Why am I seeing this?
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-6">
                <li className="list-disc">Your session may have expired</li>
                <li className="list-disc">You haven&apos;t signed in yet</li>
                <li className="list-disc">You signed out from another tab</li>
                <li className="list-disc">Your account needs verification</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => router.push('/auth/login')}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In to Continue
            </Button>
            
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/')}
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Quick Links */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <p className="text-sm font-medium mb-3">Quick Actions:</p>
              
              <Link href="/auth/register" className="block">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-accent transition-colors">
                  <div>
                    <p className="text-sm font-medium">New to FigDream?</p>
                    <p className="text-xs text-muted-foreground">
                      Create a free account
                    </p>
                  </div>
                  <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/auth/forgot-password" className="block">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-accent transition-colors">
                  <div>
                    <p className="text-sm font-medium">Forgot Password?</p>
                    <p className="text-xs text-muted-foreground">
                      Reset your password
                    </p>
                  </div>
                  <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/contact" className="block">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Need Help?</p>
                      <p className="text-xs text-muted-foreground">
                        Contact support
                      </p>
                    </div>
                  </div>
                  <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>If you continue to have issues, please contact our support team</p>
        </div>
      </div>
    </div>
  )
}