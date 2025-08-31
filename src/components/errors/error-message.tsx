'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  AlertCircle, AlertTriangle, Info, CheckCircle, 
  X, RefreshCw, ArrowLeft, HelpCircle 
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type ErrorType = 'error' | 'warning' | 'info' | 'success'

export interface ErrorMessageProps {
  type?: ErrorType
  title?: string
  message: string
  details?: string | string[]
  onDismiss?: () => void
  onRetry?: () => void
  onGoBack?: () => void
  showIcon?: boolean
  className?: string
  actions?: React.ReactNode
}

const typeConfig = {
  error: {
    icon: AlertCircle,
    variant: 'destructive' as const,
    iconColor: 'text-destructive'
  },
  warning: {
    icon: AlertTriangle,
    variant: 'default' as const,
    iconColor: 'text-orange-600 dark:text-orange-400'
  },
  info: {
    icon: Info,
    variant: 'default' as const,
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  success: {
    icon: CheckCircle,
    variant: 'default' as const,
    iconColor: 'text-green-600 dark:text-green-400'
  }
}

export function ErrorMessage({
  type = 'error',
  title,
  message,
  details,
  onDismiss,
  onRetry,
  onGoBack,
  showIcon = true,
  className,
  actions
}: ErrorMessageProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <Alert variant={config.variant} className={cn('relative', className)}>
      {showIcon && <Icon className={cn('h-4 w-4', config.iconColor)} />}
      
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      <div className="space-y-2">
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{message}</AlertDescription>
        
        {details && (
          <div className="mt-3 space-y-1">
            {Array.isArray(details) ? (
              <ul className="list-disc list-inside text-sm">
                {details.map((detail, index) => (
                  <li key={index} className="text-muted-foreground">
                    {detail}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{details}</p>
            )}
          </div>
        )}
        
        {(onRetry || onGoBack || actions) && (
          <div className="flex gap-2 mt-3">
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                <RefreshCw className="mr-2 h-3 w-3" />
                Try Again
              </Button>
            )}
            {onGoBack && (
              <Button size="sm" variant="outline" onClick={onGoBack}>
                <ArrowLeft className="mr-2 h-3 w-3" />
                Go Back
              </Button>
            )}
            {actions}
          </div>
        )}
      </div>
    </Alert>
  )
}

/**
 * Empty state component for when there's no data
 */
export interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon = HelpCircle,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="p-3 bg-muted rounded-full mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

/**
 * Inline error message for form fields
 */
export interface FieldErrorProps {
  message?: string
  className?: string
}

export function FieldError({ message, className }: FieldErrorProps) {
  if (!message) return null
  
  return (
    <p className={cn('text-sm text-destructive mt-1', className)}>
      {message}
    </p>
  )
}

/**
 * Error list component for displaying multiple errors
 */
export interface ErrorListProps {
  errors: Array<{
    field?: string
    message: string
  }>
  title?: string
  className?: string
}

export function ErrorList({ errors, title = 'Please fix the following errors:', className }: ErrorListProps) {
  if (errors.length === 0) return null
  
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside mt-2 space-y-1">
          {errors.map((error, index) => (
            <li key={index} className="text-sm">
              {error.field && <strong>{error.field}: </strong>}
              {error.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}