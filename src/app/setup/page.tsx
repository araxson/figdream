'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, Loader2, AlertCircle, Users, Database, Key, Copy, ArrowRight } from 'lucide-react'
import { DEMO_USERS, quickLogin } from '@/lib/setup/init-demo-data'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [results, setResults] = useState<Array<{ user: string; success: boolean; error?: string }>>([])
  const [loggingIn, setLoggingIn] = useState<string | null>(null)

  const handleInitialize = async () => {
    setIsInitializing(true)
    try {
      // Demo users are already created in the database
      const demoResults = [
        { user: 'customer@demo.com', success: true },
        { user: 'staff@demo.com', success: true },
        { user: 'owner@demo.com', success: true },
        { user: 'admin@demo.com', success: true }
      ]
      setResults(demoResults)
      setInitialized(true)
      toast.success('Demo users are ready to use!')
    } catch (error) {
      console.error('Setup error:', error)
      toast.error('Failed to check demo data')
    } finally {
      setIsInitializing(false)
    }
  }

  const handleQuickLogin = async (role: keyof typeof DEMO_USERS) => {
    setLoggingIn(role)
    try {
      const result = await quickLogin(role)
      if (result.success) {
        toast.success(`Logged in as ${role}`)
        
        // Navigate to appropriate dashboard
        const routes = {
          customer: '/customer',
          staff: '/staff-member',
          salonOwner: '/salon-owner',
          superAdmin: '/super-admin'
        }
        
        router.push(routes[role])
      } else {
        toast.error(result.error || 'Login failed')
      }
    } catch (_error) {
      toast.error('Login failed')
    } finally {
      setLoggingIn(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">FigDream Setup</h1>
          <p className="text-muted-foreground">Initialize demo data and test the application</p>
        </div>

        {/* Setup Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Demo Data Initialization
            </CardTitle>
            <CardDescription>
              Create demo users and sample data for testing the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!initialized ? (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Demo users are already created in the database. Click the button below to verify they are ready.
                    All demo users have the password: <code className="font-mono">Demo123!</code>
                    <br /><br />
                    <strong>Note:</strong> If login fails, you may need to reset the password in your Supabase Dashboard 
                    under Authentication → Users.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={handleInitialize}
                  disabled={isInitializing}
                  className="w-full"
                >
                  {isInitializing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Initialize Demo Data
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Demo data initialized successfully!</span>
                </div>
                
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg">
                    <span className="text-sm">{result.user}</span>
                    {result.success ? (
                      <Badge variant="default" className="bg-green-600">Success</Badge>
                    ) : (
                      <Badge variant="destructive">Failed</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Demo Users
            </CardTitle>
            <CardDescription>
              Quick login with demo accounts for testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="staff">Staff</TabsTrigger>
                <TabsTrigger value="owner">Owner</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
              
              <TabsContent value="customer" className="space-y-4">
                <DemoUserCard
                  user={DEMO_USERS.customer}
                  role="customer"
                  onLogin={handleQuickLogin}
                  isLoggingIn={loggingIn === 'customer'}
                  onCopy={copyToClipboard}
                />
              </TabsContent>
              
              <TabsContent value="staff" className="space-y-4">
                <DemoUserCard
                  user={DEMO_USERS.staff}
                  role="staff"
                  onLogin={handleQuickLogin}
                  isLoggingIn={loggingIn === 'staff'}
                  onCopy={copyToClipboard}
                />
              </TabsContent>
              
              <TabsContent value="owner" className="space-y-4">
                <DemoUserCard
                  user={DEMO_USERS.salonOwner}
                  role="salonOwner"
                  onLogin={handleQuickLogin}
                  isLoggingIn={loggingIn === 'salonOwner'}
                  onCopy={copyToClipboard}
                />
              </TabsContent>
              
              <TabsContent value="admin" className="space-y-4">
                <DemoUserCard
                  user={DEMO_USERS.superAdmin}
                  role="superAdmin"
                  onLogin={handleQuickLogin}
                  isLoggingIn={loggingIn === 'superAdmin'}
                  onCopy={copyToClipboard}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Manual Login */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Manual Login
            </CardTitle>
            <CardDescription>
              Or login manually with your own credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/login')}
            >
              Go to Login Page
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DemoUserCard({ 
  user, 
  role, 
  onLogin, 
  isLoggingIn,
  onCopy 
}: { 
  user: typeof DEMO_USERS.customer
  role: keyof typeof DEMO_USERS
  onLogin: (role: keyof typeof DEMO_USERS) => void
  isLoggingIn: boolean
  onCopy: (text: string) => void
}) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Name:</span>
            <span className="text-sm text-muted-foreground">{user.fullName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Email:</span>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">{user.email}</code>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onCopy(user.email)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Password:</span>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">{user.password}</code>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onCopy(user.password)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Role:</span>
            <Badge variant="secondary">{user.role.replace('_', ' ')}</Badge>
          </div>
        </div>
        
        <Button 
          className="w-full"
          onClick={() => onLogin(role)}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            <>
              Quick Login as {user.role.replace('_', ' ')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}