import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { 
  AlertCircle, 
  FileQuestion, 
  Lock, 
  ServerCrash,
  WifiOff,
  RefreshCw,
  Home,
  ArrowLeft,
  ChevronRight
} from 'lucide-react'

export interface ErrorPageProps {
  code?: string | number
  title: string
  description: string
  icon?: React.ComponentType<{ className?: string }>
  actions?: Array<{
    label: string
    href?: string
    onClick?: () => void
    variant?: 'default' | 'outline' | 'ghost'
    icon?: React.ComponentType<{ className?: string }>
  }>
  showDetails?: boolean
  details?: string
  className?: string
}

export function ErrorPage({
  code,
  title,
  description,
  icon: Icon = AlertCircle,
  actions = [],
  showDetails = false,
  details,
  className
}: ErrorPageProps) {
  const defaultActions = actions.length === 0 ? [
    {
      label: 'Go Home',
      href: '/',
      icon: Home
    },
    {
      label: 'Go Back',
      onClick: () => window.history.back(),
      variant: 'outline' as const,
      icon: ArrowLeft
    }
  ] : actions

  return (
    <div className={cn("flex min-h-[60vh] flex-col items-center justify-center px-4 py-16", className)}>
      <div className="w-full max-w-md">
        <div className="text-center space-y-6">
          {/* Icon with animation */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
            <div className="relative flex items-center justify-center h-full">
              <Icon className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Error Code */}
          {code && (
            <div className="inline-flex items-center justify-center">
              <span className="text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
                {code}
              </span>
            </div>
          )}

          {/* Title and Description */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>

          {/* Error Details */}
          {showDetails && details && (
            <Card className="p-4 bg-muted/50 border-muted text-left">
              <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap break-words">
                {details}
              </pre>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {defaultActions.map((action, index) => {
              const ActionIcon = action.icon
              
              if (action.href) {
                return (
                  <Button
                    key={index}
                    variant={action.variant || 'default'}
                    asChild
                    className="group"
                  >
                    <Link href={action.href}>
                      {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
                      {action.label}
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                )
              }
              
              return (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  onClick={action.onClick}
                  className="group"
                >
                  {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
                  {action.label}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Preset error pages
export function Error404() {
  return (
    <ErrorPage
      code={404}
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      icon={FileQuestion}
      actions={[
        {
          label: 'Go Home',
          href: '/',
          icon: Home
        },
        {
          label: 'Book Appointment',
          href: '/book',
          variant: 'outline'
        }
      ]}
    />
  )
}

export function Error401() {
  return (
    <ErrorPage
      code={401}
      title="Authentication Required"
      description="Please sign in to access this page."
      icon={Lock}
      actions={[
        {
          label: 'Sign In',
          href: '/login',
          icon: Lock
        },
        {
          label: 'Go Home',
          href: '/',
          variant: 'outline',
          icon: Home
        }
      ]}
    />
  )
}

export function Error403() {
  return (
    <ErrorPage
      code={403}
      title="Access Denied"
      description="You don't have permission to access this resource."
      icon={Lock}
      actions={[
        {
          label: 'Go Back',
          onClick: () => window.history.back(),
          icon: ArrowLeft
        },
        {
          label: 'Go Home',
          href: '/',
          variant: 'outline',
          icon: Home
        }
      ]}
    />
  )
}

export function Error500() {
  return (
    <ErrorPage
      code={500}
      title="Server Error"
      description="Something went wrong on our end. Please try again later."
      icon={ServerCrash}
      actions={[
        {
          label: 'Try Again',
          onClick: () => window.location.reload(),
          icon: RefreshCw
        },
        {
          label: 'Go Home',
          href: '/',
          variant: 'outline',
          icon: Home
        }
      ]}
    />
  )
}

export function ErrorOffline() {
  return (
    <ErrorPage
      title="You're Offline"
      description="Please check your internet connection and try again."
      icon={WifiOff}
      actions={[
        {
          label: 'Try Again',
          onClick: () => window.location.reload(),
          icon: RefreshCw
        }
      ]}
    />
  )
}

export function ErrorGeneric({ 
  error, 
  reset 
}: { 
  error?: Error & { digest?: string }
  reset?: () => void 
}) {
  return (
    <ErrorPage
      title="Something Went Wrong"
      description={error?.message || "An unexpected error occurred. Please try again."}
      icon={AlertCircle}
      actions={[
        {
          label: 'Try Again',
          onClick: reset || (() => window.location.reload()),
          icon: RefreshCw
        },
        {
          label: 'Go Home',
          href: '/',
          variant: 'outline',
          icon: Home
        }
      ]}
      showDetails={process.env.NODE_ENV === 'development'}
      details={error?.stack}
    />
  )
}