/**
 * Production Polish Components
 * Reusable components for professional UX
 */

import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Empty State Component
 */
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <Card className={cn("p-12 text-center", className)}>
      <CardContent className="space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {description}
            </p>
          )}
        </div>
        {action && (
          <Button onClick={action.onClick} size="sm">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Loading State Patterns
 */
export const LoadingPatterns = {
  // Table loading state
  Table: ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  ),

  // Card grid loading state
  CardGrid: ({ count = 6 }: { count?: number }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2 mb-4" />
          <Skeleton className="h-20 w-full" />
        </Card>
      ))}
    </div>
  ),

  // List loading state
  List: ({ items = 5 }: { items?: number }) => (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  ),

  // Form loading state
  Form: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  ),

  // Stats loading state
  Stats: ({ count = 4 }: { count?: number }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-8 w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </Card>
      ))}
    </div>
  )
};

/**
 * Success Animation Component
 */
export function SuccessAnimation({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-background/95 backdrop-blur-sm rounded-lg p-8 shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <svg
              className="h-10 w-10 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold">{message}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Data Loading Wrapper
 */
interface DataLoadingWrapperProps<T> {
  loading: boolean;
  error?: Error | null;
  data?: T;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => React.ReactNode;
}

export function DataLoadingWrapper<T>({
  loading,
  error,
  data,
  loadingComponent,
  errorComponent,
  emptyComponent,
  isEmpty = (d) => Array.isArray(d) && d.length === 0,
  children
}: DataLoadingWrapperProps<T>) {
  if (loading) {
    return <>{loadingComponent || <LoadingPatterns.List />}</>;
  }

  if (error) {
    return (
      <>
        {errorComponent || (
          <Card className="p-6 text-center">
            <p className="text-destructive">Error: {error.message}</p>
          </Card>
        )}
      </>
    );
  }

  if (!data || isEmpty(data)) {
    return (
      <>
        {emptyComponent || (
          <EmptyState
            icon={() => <div />}
            title="No data available"
            description="There's nothing to display at the moment."
          />
        )}
      </>
    );
  }

  return <>{children(data)}</>;
}

/**
 * Optimistic Update Hook
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (current: T, update: any) => T
) {
  const [optimisticData, setOptimisticData] = React.useState(initialData);
  const [isPending, setIsPending] = React.useState(false);

  React.useEffect(() => {
    setOptimisticData(initialData);
  }, [initialData]);

  const updateOptimistic = React.useCallback(
    async (update: any, serverAction: () => Promise<void>) => {
      setIsPending(true);
      setOptimisticData((current) => updateFn(current, update));

      try {
        await serverAction();
      } catch (error) {
        // Rollback on error
        setOptimisticData(initialData);
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [initialData, updateFn]
  );

  return {
    data: optimisticData,
    isPending,
    updateOptimistic
  };
}

/**
 * Keyboard Shortcuts Hook
 */
export function useKeyboardShortcuts(
  shortcuts: Array<{
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    handler: () => void;
  }>
) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : true;
        const shiftMatch = shortcut.shift ? e.shiftKey : true;
        const altMatch = shortcut.alt ? e.altKey : true;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          shortcut.handler();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

import React from 'react';