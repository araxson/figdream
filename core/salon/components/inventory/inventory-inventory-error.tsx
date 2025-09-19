import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface InventoryErrorProps {
  error: Error | string
  onRetry?: () => void
}

export function InventoryError({ error, onRetry }: InventoryErrorProps) {
  const errorMessage = typeof error === 'string' ? error : error.message

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error loading inventory data</AlertTitle>
      <AlertDescription className="mt-2 flex items-center justify-between">
        <span>{errorMessage || 'An unexpected error occurred. Please try again.'}</span>
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