'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Search, ArrowLeft, HelpCircle, MessageCircle, BookOpen } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function NotFound() {
  const suggestions = [
    { href: '/', label: 'Homepage', icon: Home },
    { href: '/services', label: 'Browse Services', icon: BookOpen },
    { href: '/contact', label: 'Contact Support', icon: MessageCircle },
    { href: '/faq', label: 'Help Center', icon: HelpCircle },
  ]
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-2xl w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="relative">
              <div className="text-8xl font-bold bg-gradient-to-br from-primary/20 to-primary/5 bg-clip-text text-transparent animate-pulse">
                404
              </div>
              <Search className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-16 w-16 text-muted-foreground/30" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Oops! Page Not Found</CardTitle>
              <CardDescription className="text-base">
                We couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or the URL might be incorrect.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert className="border-primary/20 bg-primary/5">
              <HelpCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Common reasons for this error:</strong>
                <ul className="mt-2 ml-4 list-disc text-sm space-y-1">
                  <li>The page has been moved or deleted</li>
                  <li>You may have typed the URL incorrectly</li>
                  <li>You don&apos;t have permission to access this page</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-3">
              {suggestions.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-primary/5 transition-colors"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button 
              onClick={() => window.history.back()} 
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Link href="/" className="flex-1">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Error Code: 404</p>
        </div>
      </div>
    </div>
  )
}