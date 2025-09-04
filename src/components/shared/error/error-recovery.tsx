'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  WifiOff, RefreshCw, Settings, 
  CheckCircle, XCircle, AlertTriangle, Loader2,
  HelpCircle, Mail, MessageSquare
} from 'lucide-react'
import { NetworkError, NetworkErrorType, networkMonitor, waitForNetwork } from '@/lib/utils/errors/network'
import { ApiError, isStatusCode } from '@/lib/utils/errors/api-errors'
/**
 * Network recovery component
 */
export interface NetworkRecoveryProps {
  error: NetworkError
  onRetry?: () => Promise<void>
  onCancel?: () => void
}
export function NetworkRecovery({ error, onRetry, onCancel }: NetworkRecoveryProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [networkStatus, setNetworkStatus] = useState(networkMonitor.getStatus())
  const [countdown, setCountdown] = useState(0)
  useEffect(() => {
    const unsubscribe = networkMonitor.subscribe(setNetworkStatus)
    return unsubscribe
  }, [])
  useEffect(() => {
    // Auto-retry when network comes back online
    if (networkStatus === 'online' && countdown === 0) {
      setCountdown(3)
    }
  }, [networkStatus, countdown])
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
        if (countdown === 1 && onRetry) {
          handleRetry()
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, handleRetry, onRetry])
  const handleRetry = useCallback(async () => {
    if (onRetry) {
      setIsRetrying(true)
      try {
        await onRetry()
      } finally {
        setIsRetrying(false)
        setCountdown(0)
      }
    }
  }, [onRetry])
  const getStatusColor = () => {
    switch (networkStatus) {
      case 'online': return 'text-green-600'
      case 'offline': return 'text-red-600'
      case 'slow': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <WifiOff className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle>Network Connection Issue</CardTitle>
        <CardDescription>
          {error.message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network status indicator */}
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span className="font-medium">Network Status:</span>
            <span className={`font-medium ${getStatusColor()}`}>
              {networkStatus.charAt(0).toUpperCase() + networkStatus.slice(1)}
            </span>
          </AlertDescription>
        </Alert>
        {/* Auto-retry countdown */}
        {countdown > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Network connection restored! Retrying in {countdown} seconds...
            </AlertDescription>
          </Alert>
        )}
        {/* Recovery suggestions */}
        {error.type === NetworkErrorType.OFFLINE && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Try these steps:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li className="list-disc">Check your internet connection</li>
              <li className="list-disc">Disable airplane mode if enabled</li>
              <li className="list-disc">Restart your router or modem</li>
              <li className="list-disc">Try connecting to a different network</li>
            </ul>
          </div>
        )}
        {error.type === NetworkErrorType.SLOW_NETWORK && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your connection is slow. The page may take longer to load.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          onClick={handleRetry}
          disabled={isRetrying || networkStatus === 'offline'}
          className="flex-1"
        >
          {isRetrying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </>
          )}
        </Button>
        {onCancel && (
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
/**
 * API error recovery component
 */
export interface ApiErrorRecoveryProps {
  error: ApiError
  onRetry?: () => Promise<void>
  onGoBack?: () => void
  onGoHome?: () => void
}
export function ApiErrorRecovery({ error, onRetry, onGoBack, onGoHome }: ApiErrorRecoveryProps) {
  const router = useRouter()
  const [isRetrying, setIsRetrying] = useState(false)
  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true)
      try {
        await onRetry()
      } finally {
        setIsRetrying(false)
      }
    }
  }
  const getRecoveryOptions = () => {
    if (isStatusCode(error, 401)) {
      return {
        title: 'Authentication Required',
        description: 'Please sign in to continue',
        actions: [
          { label: 'Sign In', onClick: () => router.push('/login'), primary: true }
        ]
      }
    }
    if (isStatusCode(error, 403)) {
      return {
        title: 'Access Denied',
        description: 'You don\'t have permission to access this resource',
        actions: [
          { label: 'Go Back', onClick: onGoBack || (() => router.back()) },
          { label: 'Home', onClick: onGoHome || (() => router.push('/')) }
        ]
      }
    }
    if (isStatusCode(error, 404)) {
      return {
        title: 'Not Found',
        description: 'The requested resource could not be found',
        actions: [
          { label: 'Go Back', onClick: onGoBack || (() => router.back()) },
          { label: 'Home', onClick: onGoHome || (() => router.push('/')), primary: true }
        ]
      }
    }
    if (isStatusCode(error, 429)) {
      return {
        title: 'Too Many Requests',
        description: 'Please wait a moment before trying again',
        actions: [
          { label: 'Try Again', onClick: handleRetry, disabled: isRetrying }
        ]
      }
    }
    if (error.statusCode >= 500) {
      return {
        title: 'Server Error',
        description: 'Something went wrong on our end. Please try again later.',
        actions: [
          { label: 'Try Again', onClick: handleRetry, disabled: isRetrying },
          { label: 'Go Back', onClick: onGoBack || (() => router.back()) }
        ]
      }
    }
    return {
      title: 'Error',
      description: error.message,
      actions: [
        { label: 'Try Again', onClick: handleRetry, disabled: isRetrying },
        { label: 'Go Back', onClick: onGoBack || (() => router.back()) }
      ]
    }
  }
  const recovery = getRecoveryOptions()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{recovery.title}</CardTitle>
        <CardDescription>{recovery.description}</CardDescription>
      </CardHeader>
      {error.details !== undefined && error.details !== null && (
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {typeof error.details === 'string' 
                ? error.details 
                : typeof error.details === 'object'
                ? JSON.stringify(error.details, null, 2)
                : String(error.details)}
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
      <CardFooter className="flex gap-2">
        {recovery.actions.map((action, index) => (
          <Button
            key={index}
            onClick={action.onClick}
            variant={'primary' in action && action.primary ? 'default' : 'outline'}
            disabled={'disabled' in action ? action.disabled : undefined}
            className="flex-1"
          >
            {action.label}
          </Button>
        ))}
      </CardFooter>
    </Card>
  )
}
/**
 * Progressive error recovery with multiple strategies
 */
export interface ProgressiveRecoveryProps {
  error: unknown
  strategies?: Array<{
    name: string
    description: string
    action: () => Promise<void>
    icon?: React.ElementType
  }>
  onSuccess?: () => void
  onFailure?: () => void
}
export function ProgressiveRecovery({ 
  error: _error, 
  strategies = [], 
  onSuccess, 
  onFailure 
}: ProgressiveRecoveryProps) {
  const [currentStrategy, setCurrentStrategy] = useState(0)
  const [isRecovering, setIsRecovering] = useState(false)
  const [attempts, setAttempts] = useState<Record<number, boolean>>({})
  const [progress, setProgress] = useState(0)
  const defaultStrategies = [
    {
      name: 'Retry Operation',
      description: 'Try the operation again',
      action: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
      },
      icon: RefreshCw
    },
    {
      name: 'Check Network',
      description: 'Wait for network connection',
      action: async () => {
        await waitForNetwork(10000)
      },
      icon: WifiOff
    },
    {
      name: 'Clear Cache',
      description: 'Clear local cache and retry',
      action: async () => {
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
        }
        await new Promise(resolve => setTimeout(resolve, 500))
      },
      icon: Settings
    }
  ]
  const allStrategies = strategies.length > 0 ? strategies : defaultStrategies
  const tryStrategy = async (index: number) => {
    if (index >= allStrategies.length) {
      onFailure?.()
      return
    }
    setCurrentStrategy(index)
    setIsRecovering(true)
    setProgress((index / allStrategies.length) * 100)
    try {
      await allStrategies[index].action()
      setAttempts({ ...attempts, [index]: true })
      onSuccess?.()
    } catch {
      setAttempts({ ...attempts, [index]: false })
      // Try next strategy
      setTimeout(() => tryStrategy(index + 1), 1000)
    } finally {
      setIsRecovering(false)
    }
  }
  const handleStartRecovery = () => {
    setAttempts({})
    tryStrategy(0)
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attempting Recovery</CardTitle>
        <CardDescription>
          We&apos;re trying different methods to resolve the issue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-2" />
        <div className="space-y-2">
          {allStrategies.map((strategy, index) => {
            const Icon = strategy.icon || HelpCircle
            const attempted = attempts[index]
            const isCurrent = index === currentStrategy && isRecovering
            return (
              <Alert
                key={index}
                className={isCurrent ? 'border-primary bg-primary/5' : ''}
              >
                <AlertDescription className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {isCurrent ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : attempted === true ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : attempted === false ? (
                    <XCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{strategy.name}</p>
                  <p className="text-xs text-muted-foreground">{strategy.description}</p>
                </div>
                </AlertDescription>
              </Alert>
            )
          })}
        </div>
      </CardContent>
      <CardFooter>
        {!isRecovering && Object.keys(attempts).length === 0 && (
          <Button onClick={handleStartRecovery} className="w-full">
            Start Recovery
          </Button>
        )}
        {Object.keys(attempts).length === allStrategies.length && (
          <div className="w-full space-y-3">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Recovery attempts failed. Please contact support.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" asChild>
                <a href="mailto:support@figdream.com">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Support
                </a>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <a href="/contact">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Form
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}