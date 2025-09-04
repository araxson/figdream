/**
 * Error Message Components for FigDream
 */
import { AlertCircle, XCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}
export function ErrorMessage({
  title = 'Error',
  message,
  onRetry,
  className = '',
}: ErrorMessageProps) {
  return (
    <Alert variant="destructive" className={className}>
      <XCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-4"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
interface EmptyStateProps {
  title?: string
  message?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}
export function EmptyState({
  title = 'No data found',
  message = 'There is nothing to display here.',
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      {icon || <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">{message}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
interface WarningMessageProps {
  title?: string
  message: string
  className?: string
}
export function WarningMessage({
  title = 'Warning',
  message,
  className = '',
}: WarningMessageProps) {
  return (
    <Alert variant="warning" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  )
}
interface SuccessMessageProps {
  title?: string
  message: string
  className?: string
}
export function SuccessMessage({
  title = 'Success',
  message,
  className = '',
}: SuccessMessageProps) {
  return (
    <Alert variant="success" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  )
}
interface InfoMessageProps {
  title?: string
  message: string
  className?: string
}
export function InfoMessage({
  title = 'Information',
  message,
  className = '',
}: InfoMessageProps) {
  return (
    <Alert variant="info" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  )
}