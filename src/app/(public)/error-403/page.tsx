'use client'

import Link from 'next/link'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, HoverCard, HoverCardContent, HoverCardTrigger, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Badge, Separator, Alert, AlertDescription, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui'
import { ShieldX, Home, LogIn, RefreshCw, HelpCircle, Mail, Phone, ArrowLeft, Search, Settings } from 'lucide-react'

export default function Forbidden() {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-muted/20">
        <div className="w-full max-w-2xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="p-4 rounded-full bg-destructive/10 cursor-help">
                      <ShieldX className="h-12 w-12 text-destructive" />
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <ShieldX className="h-4 w-4" />
                        HTTP 403 Error
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        This error occurs when the server understands your request but refuses to authorize it. 
                        This could be due to insufficient permissions or authentication requirements.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge variant="destructive" className="text-lg px-3 py-1">
                  403
                </Badge>
                <Separator orientation="vertical" className="h-6" />
                <Badge variant="outline">Forbidden</Badge>
              </div>
              
              <CardTitle className="text-2xl font-semibold mb-2">Access Forbidden</CardTitle>
              <CardDescription className="text-base">
                You don&apos;t have permission to access this resource.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert>
                <HelpCircle className="h-4 w-4" />
                <AlertDescription>
                  This might happen if you&apos;re not logged in, don&apos;t have the right permissions, 
                  or the resource requires special access rights.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <h3 className="font-medium text-center">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild className="w-full">
                        <Link href="/" className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Go Home
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Return to the homepage</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/auth/login" className="flex items-center gap-2">
                          <LogIn className="h-4 w-4" />
                          Sign In
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sign in to access protected resources</p>
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
                      <Button variant="ghost" onClick={() => window.location.reload()} className="flex-1">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reload the current page</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              <Separator />
              
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
                            <AlertDialogTitle>Contact Support</AlertDialogTitle>
                            <AlertDialogDescription>
                              If you believe you should have access to this resource, please contact our support team. 
                              Include the error code (403) and the URL you were trying to access.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogAction>
                              <Mail className="h-4 w-4 mr-2" />
                              Email Support
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
                  <CommandGroup heading="Suggestions">
                    <CommandItem>
                      <Home className="mr-2 h-4 w-4" />
                      <span>Go to Homepage</span>
                    </CommandItem>
                    <CommandItem>
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>Sign In</span>
                    </CommandItem>
                    <CommandItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Account Settings</span>
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