'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCw, ArrowLeft, Bug, HelpCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    console.error(error)
  }, [error])

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }


  const getErrorType = () => {
    if (error.message?.includes('network')) return 'Network Error'
    if (error.message?.includes('permission')) return 'Permission Error'
    if (error.message?.includes('auth')) return 'Authentication Error'
    if (error.message?.includes('404')) return 'Page Not Found'
    return 'Application Error'
  }

  const getErrorSuggestion = () => {
    const errorType = getErrorType()
    switch (errorType) {
      case 'Network Error':
        return 'Please check your internet connection and try again.'
      case 'Permission Error':
        return 'You may not have permission to access this resource.'
      case 'Authentication Error':
        return 'Please try logging in again.'
      case 'Page Not Found':
        return 'The page you are looking for does not exist.'
      default:
        return 'Try refreshing the page or contact support if the problem persists.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <Card className="max-w-lg w-full shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-xl">{getErrorType()}</CardTitle>
                <CardDescription className="mt-1">
                  {getErrorSuggestion()}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert className="border-muted">
            <HelpCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Quick fixes to try:</strong>
              <ul className="mt-2 ml-4 list-disc text-sm space-y-1">
                <li>Refresh the page</li>
                <li>Clear your browser cache</li>
                <li>Check your internet connection</li>
                <li>Try again in a few moments</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Technical Details
                </span>
                <span className="text-xs text-muted-foreground">
                  {showDetails ? 'Hide' : 'Show'}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="p-3 bg-muted/50 rounded-md space-y-2">
                <p className="text-xs font-mono break-all">
                  <strong>Error:</strong> {error.message || 'Unknown error'}
                </p>
                {error.digest && (
                  <p className="text-xs font-mono">
                    <strong>Error ID:</strong> {error.digest}
                  </p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={reset} 
            className="flex-1 sm:flex-initial"
            variant="default"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button 
            variant="outline" 
            onClick={handleGoBack}
            className="flex-1 sm:flex-initial"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="flex-1 sm:flex-initial"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}