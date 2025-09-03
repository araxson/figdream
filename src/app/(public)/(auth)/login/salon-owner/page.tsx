import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Button, Separator, HoverCard, HoverCardContent, HoverCardTrigger, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Avatar, AvatarFallback, AvatarImage, Collapsible, CollapsibleContent, CollapsibleTrigger, AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, Alert, AlertDescription, ScrollArea, ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, Progress } from '@/components/ui'
import { LoginForm } from '@/components/auth/login-form'
import { Building, Users, TrendingUp, BarChart, Crown, Shield, Info, ChevronDown, Settings, Phone, Mail, Search } from 'lucide-react'
export default function SalonOwnerLoginPage() {
  return (
    <TooltipProvider>
      <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Avatar className="h-16 w-16 cursor-help">
                <AvatarImage src="/avatars/salon-owner-avatar.png" alt="Salon Owner" />
                <AvatarFallback className="bg-green-100 dark:bg-green-900/20">
                  <Building className="h-8 w-8 text-green-600 dark:text-green-400" />
                </AvatarFallback>
              </Avatar>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <Avatar>
                  <AvatarImage src="/avatars/salon-owner-avatar.png" />
                  <AvatarFallback>SO</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Salon Owner Portal</h4>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive business management platform for salon owners. Manage staff, track revenue, and grow your business.
                  </p>
                  <div className="flex items-center pt-2">
                    <Crown className="mr-2 h-4 w-4 opacity-70" />
                    <span className="text-xs text-muted-foreground">
                      Business management tools
                    </span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            Salon Owner Portal
            <Tooltip>
              <TooltipTrigger asChild>
                <Crown className="h-5 w-5 text-green-600" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Professional business management</p>
              </TooltipContent>
            </Tooltip>
          </h1>
          <p className="text-muted-foreground">
            Sign in to manage your salon business
          </p>
        </div>
        {/* Business Progress */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Sign In</span>
            <span>Dashboard</span>
            <span>Manage</span>
          </div>
          <Progress value={33} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">Step 1 of 3 - Business Access</p>
        </div>
      </div>
      {/* Business Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your business data is protected with bank-level security. All management actions are logged for audit purposes.
        </AlertDescription>
      </Alert>
      {/* Login Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Sign In
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Use your business account credentials</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>
                Access your salon dashboard and management tools
              </CardDescription>
            </div>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Business Support
                </ContextMenuItem>
                <ContextMenuItem>
                  <Phone className="mr-2 h-4 w-4" />
                  Call Sales Team
                </ContextMenuItem>
                <ContextMenuItem>
                  <Search className="mr-2 h-4 w-4" />
                  Setup Guide
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-96">
            <LoginForm role="salon_owner" redirectTo="/salon-owner" />
            <div className="mt-6">
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
              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" type="button" disabled>
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
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Business Google sign-in (Coming Soon)</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" type="button" disabled>
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      GitHub
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>GitHub for Business (Coming Soon)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex items-center justify-between w-full text-sm">
            <div>
              Don&apos;t have a business account?{' '}
              <Link href="/register/salon" className="text-primary">
                Register your salon
              </Link>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  Forgot password?
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Business Account Recovery</AlertDialogTitle>
                  <AlertDialogDescription>
                    For business account security, password resets require additional verification. 
                    We&apos;ll send recovery instructions to your business email and may require identity verification.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction asChild>
                    <Link href="/forgot-password">
                      Start Recovery Process
                    </Link>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>
      {/* Features Section */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Salon Management Features
                </div>
                <ChevronDown className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex items-start space-x-3 p-3 rounded-lg cursor-help">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Staff Management</p>
                        <p className="text-sm text-muted-foreground">
                          Manage your team, schedules, and services
                        </p>
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Team Management
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive staff management with scheduling, performance tracking, and commission management.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex items-start space-x-3 p-3 rounded-lg cursor-help">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Business Analytics</p>
                        <p className="text-sm text-muted-foreground">
                          Track revenue, appointments, and growth metrics
                        </p>
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Advanced Analytics
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Real-time business insights with revenue tracking, customer analytics, and predictive forecasting.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex items-start space-x-3 p-3 rounded-lg cursor-help">
                      <BarChart className="h-5 w-5 text-primary mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Performance Reports</p>
                        <p className="text-sm text-muted-foreground">
                          Detailed insights into your business performance
                        </p>
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <BarChart className="h-4 w-4" />
                        Performance Intelligence
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Automated reporting with profit optimization suggestions and competitive analysis.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
      {/* Other Login Options */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-3">Different account type?</p>
            <div className="flex justify-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/login/customer" className="text-primary font-medium">
                    Customer
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Book appointments and manage bookings</p>
                </TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="h-4" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/login/staff" className="text-primary font-medium">
                    Staff Member
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Access your schedule and client appointments</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </TooltipProvider>
  )
}
