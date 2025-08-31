'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, RefreshCw, Home, ArrowLeft, 
  Bug, FileWarning, HelpCircle, Mail 
} from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showDetails?: boolean
  resetButtonText?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }))

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo)
    }
  }

  logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // This would send to Sentry, LogRocket, etc.
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    }
    
    console.error('Error logged to service:', errorData)
    // In production, send to actual error service
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    }
  }

  render() {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      const { error, errorInfo, errorCount } = this.state
      const { showDetails = process.env.NODE_ENV === 'development' } = this.props

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
          <div className="max-w-2xl w-full space-y-6">
            {/* Main Error Card */}
            <Card className="border-destructive/50">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-destructive/10 rounded-full">
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Something went wrong</CardTitle>
                <CardDescription>
                  An unexpected error occurred. We apologize for the inconvenience.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Error message */}
                {error && (
                  <Alert variant="destructive">
                    <Bug className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Error:</strong> {error.message || 'Unknown error occurred'}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Multiple errors warning */}
                {errorCount > 1 && (
                  <Alert>
                    <FileWarning className="h-4 w-4" />
                    <AlertDescription>
                      This error has occurred {errorCount} times. The application may be experiencing issues.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error details (dev mode) */}
                {showDetails && errorInfo && (
                  <div className="space-y-2">
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium flex items-center gap-2 hover:text-primary">
                        <FileWarning className="h-4 w-4" />
                        Technical Details
                        <span className="text-xs text-muted-foreground ml-auto">
                          (Click to expand)
                        </span>
                      </summary>
                      <div className="mt-3 space-y-3">
                        {/* Stack trace */}
                        {error?.stack && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs font-mono text-muted-foreground mb-2">Stack Trace:</p>
                            <pre className="text-xs overflow-auto max-h-40 font-mono">
                              {error.stack}
                            </pre>
                          </div>
                        )}
                        
                        {/* Component stack */}
                        {errorInfo.componentStack && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs font-mono text-muted-foreground mb-2">Component Stack:</p>
                            <pre className="text-xs overflow-auto max-h-40 font-mono">
                              {errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                )}

                {/* Help text */}
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    What can you try?
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li className="list-disc">Refresh the page to try again</li>
                    <li className="list-disc">Go back to the previous page</li>
                    <li className="list-disc">Return to the homepage</li>
                    <li className="list-disc">Contact support if the issue persists</li>
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button onClick={this.handleReset} variant="default">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {this.props.resetButtonText || 'Try Again'}
                  </Button>
                  <Button onClick={this.handleReload} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reload Page
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button onClick={this.handleGoBack} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                  </Button>
                  <Button onClick={this.handleGoHome} variant="outline">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Support Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Still having trouble?
              </p>
              <a 
                href="/contact" 
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                <Mail className="h-3 w-3" />
                Contact Support Team
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}