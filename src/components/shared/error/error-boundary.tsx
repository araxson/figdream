'use client'
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { logError } from '@/lib/data-access/monitoring/error-logs'
interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}
interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}
export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }
  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo
    })
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    // Log to error reporting service
    this.logErrorToService(error, errorInfo)
  }
  private async logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Log to database using error logging DAL
    try {
      await logError(
        error.message,
        'ui', // UI errors
        'high', // High severity for production errors
        {
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          componentStack: errorInfo.componentStack,
          errorName: error.name,
        },
        error.stack
      )
    } catch (_logErr) {
      // Fallback to console if DAL fails
    }
  }
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }
  public render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }
      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An unexpected error occurred. We apologize for the inconvenience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-sm">Error Details:</h4>
                  <pre className="text-xs overflow-auto">
                    {this.state.error.message}
                  </pre>
                  {this.state.error.stack && (
                    <Accordion type="single" collapsible className="text-xs">
                      <AccordionItem value="stack-trace">
                        <AccordionTrigger className="text-muted-foreground text-xs py-2">
                          Stack trace
                        </AccordionTrigger>
                        <AccordionContent>
                          <pre className="overflow-auto text-xs">
                            {this.state.error.stack}
                          </pre>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
              )}
              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={this.handleReset} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Link>
                </Button>
              </div>
              {/* Support message */}
              <p className="text-sm text-muted-foreground text-center">
                If this problem persists, please contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }
    return this.props.children
  }
}