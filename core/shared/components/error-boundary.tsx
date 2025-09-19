"use client";

import { Component, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
  componentName?: string;
  className?: string;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: { componentStack: string };
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error("ErrorBoundary caught error:", error, errorInfo);

    // Log to external service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to security audit
    if (typeof window !== "undefined") {
      fetch("/api/security/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      }).catch(console.error);
    }

    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, showDetails: false });
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className={cn("min-h-[400px] flex items-center justify-center p-6", this.props.className)}>
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>{this.props.componentName ? `${this.props.componentName} Error` : 'Something went wrong'}</CardTitle>
              </div>
              <CardDescription>
                An unexpected error occurred. The issue has been reported and we'll look into it.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Message</AlertTitle>
                <AlertDescription className="mt-2 font-mono text-sm">
                  {this.state.error?.message || 'An unknown error occurred'}
                </AlertDescription>
              </Alert>

              {this.props.showDetails !== false && this.state.error && (
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.toggleDetails}
                    className="mb-2"
                  >
                    {this.state.showDetails ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Show Details
                      </>
                    )}
                  </Button>

                  {this.state.showDetails && this.state.errorInfo && (
                    <div className="rounded-lg bg-muted p-4 overflow-auto max-h-64">
                      <p className="text-sm font-semibold mb-2">Component Stack:</p>
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {this.state.errorInfo.componentStack}
                      </pre>
                      {this.state.error.stack && (
                        <>
                          <p className="text-sm font-semibold mb-2 mt-4">Error Stack:</p>
                          <pre className="text-xs whitespace-pre-wrap font-mono">
                            {this.state.error.stack}
                          </pre>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button onClick={this.handleReset} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Feature-specific error boundary with custom styling
 */
export function FeatureErrorBoundary({
  children,
  featureName,
}: {
  children: ReactNode;
  featureName: string;
}) {
  return (
    <ErrorBoundary
      componentName={featureName}
      onError={(error) => {
        console.error(`Error in ${featureName}:`, error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Table-specific error boundary
 */
export function TableErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      componentName="Table"
      fallback={
        <div className="rounded-md border p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-4" />
            <h3 className="text-lg font-semibold">Failed to load table data</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              An error occurred while loading the table
            </p>
            <Button onClick={() => window.location.reload()} size="sm">
              Reload Table
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Form-specific error boundary
 */
export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      componentName="Form"
      fallback={
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Form Error</AlertTitle>
          <AlertDescription>
            The form could not be loaded due to an error.
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              variant="outline"
              className="mt-2 block"
            >
              Reload Form
            </Button>
          </AlertDescription>
        </Alert>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Async Error Boundary for Suspense components
 */
export function AsyncErrorBoundary({
  children,
  fallback
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Loading Error</AlertTitle>
              <AlertDescription>
                Failed to load this section. Please try again.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              size="sm"
            >
              Try Again
            </Button>
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
}