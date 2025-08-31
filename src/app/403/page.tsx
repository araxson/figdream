'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  ShieldX, ArrowLeft, Home, User, 
  AlertTriangle, Key, Lock, HelpCircle,
  UserX, Mail, LogOut
} from 'lucide-react'

export default function ForbiddenPage() {
  const router = useRouter()

  const handleRequestAccess = () => {
    // This would typically open a modal or redirect to a request form
    router.push('/contact?subject=access-request')
  }

  const handleSwitchAccount = () => {
    // Sign out and redirect to login
    router.push('/auth/logout?redirect=/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Main Card */}
        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                <ShieldX className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">403 - Access Denied</CardTitle>
            <CardDescription className="text-base mt-2">
              You don&apos;t have permission to access this resource
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <UserX className="h-4 w-4" />
              <AlertDescription>
                Your current account doesn&apos;t have the necessary permissions to view this page. 
                This could be because you need a different role or specific access rights.
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-muted rounded-lg space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Why can&apos;t I access this page?
              </p>
              <div className="space-y-3 ml-6">
                <div className="flex items-start gap-2">
                  <Key className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Insufficient Permissions</p>
                    <p className="text-xs text-muted-foreground">
                      This page requires special access rights that your account doesn&apos;t have.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Role Restrictions</p>
                    <p className="text-xs text-muted-foreground">
                      Some areas are restricted to specific user roles (Admin, Staff, etc.).
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Resource Protection</p>
                    <p className="text-xs text-muted-foreground">
                      You may be trying to access another user&apos;s private information.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Common restricted areas */}
            <div className="p-4 bg-background border rounded-lg space-y-2">
              <p className="text-sm font-medium">Common Restricted Areas:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Admin Dashboard</Badge>
                <Badge variant="outline">Salon Management</Badge>
                <Badge variant="outline">Staff Portal</Badge>
                <Badge variant="outline">Analytics</Badge>
                <Badge variant="outline">Billing Settings</Badge>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/')}
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleRequestAccess}
            >
              <Mail className="mr-2 h-4 w-4" />
              Request Access
            </Button>
            
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleSwitchAccount}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Switch Account
            </Button>
          </CardFooter>
        </Card>

        {/* Help Section */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <p className="text-sm font-medium mb-3">What can you do?</p>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Contact your administrator for access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Sign in with a different account</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Check if you&apos;re using the correct URL</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Verify your account role and permissions</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Still having trouble?
          </p>
          <Link 
            href="/contact" 
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <Mail className="h-3 w-3" />
            Contact Support Team
          </Link>
        </div>
      </div>
    </div>
  )
}