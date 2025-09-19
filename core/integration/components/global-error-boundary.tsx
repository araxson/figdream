'use client'

// Global error boundary for graceful error handling across the application
import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to monitoring service
    console.error('Global error boundary caught:', error, errorInfo)

    // Report to error tracking service
    this.reportError(error, errorInfo)

    // Update state with error info
    this.setState({
      error,
      errorInfo
    })
  }

  async reportError(error: Error, errorInfo: any) {
    try {
      const { reportErrorAction } = await import('@/core/monitoring/actions/error-actions')
      await reportErrorAction({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development'

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Something went wrong</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We apologize for the inconvenience. An unexpected error has occurred.
                Our team has been notified and is working on a fix.
              </p>

              {isDevelopment && this.state.error && (
                <div className="space-y-2">
                  <div className="p-4 rounded-md bg-muted/50 border">
                    <h4 className="font-semibold text-sm mb-2">Error Details:</h4>
                    <p className="text-sm font-mono text-destructive">
                      {this.state.error.message}
                    </p>
                  </div>

                  {this.state.error.stack && (
                    <details className="p-4 rounded-md bg-muted/50 border">
                      <summary className="font-semibold text-sm cursor-pointer">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs overflow-auto max-h-64 font-mono">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}

                  {this.state.errorInfo?.componentStack && (
                    <details className="p-4 rounded-md bg-muted/50 border">
                      <summary className="font-semibold text-sm cursor-pointer">
                        Component Stack
                      </summary>
                      <pre className="mt-2 text-xs overflow-auto max-h-64 font-mono">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button
                onClick={this.handleReset}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}