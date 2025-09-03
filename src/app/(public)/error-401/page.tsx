'use client'
import Link from 'next/link'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, HoverCard, HoverCardContent, HoverCardTrigger, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Badge, Separator, Alert, AlertDescription, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui'
import { Lock, Home, LogIn, HelpCircle, Mail, Phone, ArrowLeft, Search, Settings, User, KeyRound, Shield, UserPlus } from 'lucide-react'
export default function Unauthorized() {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-muted/20">
        <div className="w-full max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="p-4 rounded-full bg-orange-100 dark:bg-orange-900/20 cursor-help">
                      <Lock className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        HTTP 401 Error
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        This error occurs when you need to be authenticated to access this resource. 
                        You either need to sign in or your session may have expired.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge variant="secondary" className="text-lg px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                  401
                </Badge>
                <Separator orientation="vertical" className="h-6" />
                <Badge variant="outline">Unauthorized</Badge>
              </div>
              <CardTitle className="text-2xl font-semibold mb-2">Authentication Required</CardTitle>
              <CardDescription className="text-base">
                Please sign in to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  You need to be logged in to view this content. This protects your personal information 
                  and ensures you only see content meant for you.
                </AlertDescription>
              </Alert>
              <div className="space-y-4">
                <h3 className="font-medium text-center">Authentication Options</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild className="w-full">
                        <Link href="/auth/login" className="flex items-center gap-2">
                          <LogIn className="h-4 w-4" />
                          Sign In
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sign in to your existing account</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/auth/register" className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Sign Up
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create a new account</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" onClick={() => window.history.back()} className="flex-1">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Return to the previous page</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" asChild className="flex-1">
                        <Link href="/" className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Home
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Go to homepage</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-medium text-center">Account Types</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="p-3 border rounded-lg cursor-help">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Customer</span>
                        </div>
                        <p className="text-muted-foreground text-xs">Book appointments</p>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <p className="text-sm">Customer accounts let you book appointments, manage favorites, and earn loyalty rewards.</p>
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="p-3 border rounded-lg cursor-help">
                        <div className="flex items-center gap-2 mb-1">
                          <Settings className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Business</span>
                        </div>
                        <p className="text-muted-foreground text-xs">Manage your salon</p>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <p className="text-sm">Business accounts provide salon management tools, staff scheduling, and analytics.</p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-center">Need Help?</h3>
                <div className="flex justify-center">
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="secondary" className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4" />
                            Get Support
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Authentication Support</AlertDialogTitle>
                            <AlertDialogDescription>
                              If you&apos;re having trouble signing in or need help with your account, 
                              our support team is here to help. We can assist with password resets, 
                              account recovery, and technical issues.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogAction>
                              <Mail className="h-4 w-4 mr-2" />
                              Contact Support
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Email Support
                      </ContextMenuItem>
                      <ContextMenuItem>
                        <Phone className="mr-2 h-4 w-4" />
                        Phone Support
                      </ContextMenuItem>
                      <ContextMenuItem>
                        <Search className="mr-2 h-4 w-4" />
                        Search Help
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </div>
              </div>
              <Command className="rounded-lg border">
                <CommandInput placeholder="Search for help or navigate..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Quick Actions">
                    <CommandItem>
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>Customer Sign In</span>
                    </CommandItem>
                    <CommandItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Business Sign In</span>
                    </CommandItem>
                    <CommandItem>
                      <UserPlus className="mr-2 h-4 w-4" />
                      <span>Create Account</span>
                    </CommandItem>
                    <CommandItem>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help Center</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}