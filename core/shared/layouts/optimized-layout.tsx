import { Suspense, ReactNode } from "react";
import { ErrorBoundary } from "../components/error-boundary";
import { Loader2 } from "lucide-react";

interface OptimizedLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

/**
 * Loading fallback for layout sections
 */
function LayoutSkeleton({ area }: { area: string }) {
  return (
    <div className="animate-pulse bg-muted/50 rounded-lg p-4">
      <div className="flex items-center justify-center h-full min-h-[100px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading {area}...
        </span>
      </div>
    </div>
  );
}

/**
 * Optimized layout with Suspense boundaries and error handling
 */
export function OptimizedLayout({
  children,
  sidebar,
  header,
  footer,
}: OptimizedLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with error boundary and suspense */}
      {header && (
        <ErrorBoundary
          fallback={
            <div className="h-16 bg-destructive/10 flex items-center justify-center">
              <span className="text-sm text-destructive">
                Header failed to load
              </span>
            </div>
          }
        >
          <Suspense fallback={<LayoutSkeleton area="header" />}>
            <header className="sticky top-0 z-50 bg-background border-b">
              {header}
            </header>
          </Suspense>
        </ErrorBoundary>
      )}

      <div className="flex-1 flex">
        {/* Sidebar with error boundary and suspense */}
        {sidebar && (
          <ErrorBoundary
            fallback={
              <div className="w-64 bg-muted/20 p-4">
                <span className="text-sm text-muted-foreground">
                  Sidebar unavailable
                </span>
              </div>
            }
          >
            <Suspense fallback={<LayoutSkeleton area="sidebar" />}>
              <aside className="w-64 border-r bg-muted/10">
                {sidebar}
              </aside>
            </Suspense>
          </ErrorBoundary>
        )}

        {/* Main content with error boundary and suspense */}
        <main className="flex-1 overflow-auto">
          <ErrorBoundary
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h2 className="text-lg font-semibold mb-2">
                    Content failed to load
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Please refresh the page to try again
                  </p>
                </div>
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }
            >
              {children}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Footer with error boundary and suspense */}
      {footer && (
        <ErrorBoundary fallback={null}>
          <Suspense fallback={<LayoutSkeleton area="footer" />}>
            <footer className="border-t bg-muted/5">
              {footer}
            </footer>
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}

/**
 * Feature layout with optimized loading
 */
export function FeatureLayout({
  children,
  title,
  actions,
}: {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="container mx-auto p-6">
      {(title || actions) && (
        <div className="mb-6 flex items-center justify-between">
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          {actions && (
            <Suspense fallback={<div className="w-32 h-10 bg-muted animate-pulse rounded" />}>
              {actions}
            </Suspense>
          )}
        </div>
      )}

      <ErrorBoundary
        fallback={
          <div className="bg-destructive/10 rounded-lg p-6 text-center">
            <p className="text-destructive">
              This feature encountered an error. Please try again.
            </p>
          </div>
        }
      >
        <Suspense
          fallback={
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          }
        >
          {children}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}