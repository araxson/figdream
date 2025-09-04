import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

interface FormLayoutProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full'
}

export function FormLayout({ children, className, maxWidth = 'lg' }: FormLayoutProps) {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    full: 'w-full'
  }[maxWidth]

  return (
    <div className={cn("mx-auto", maxWidthClass, className)}>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}

interface FormCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function FormCard({ title, description, children, footer, className }: FormCardProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={!title && !description ? 'pt-6' : ''}>
        {children}
      </CardContent>
      {footer && (
        <>
          <Separator />
          <CardFooter className="pt-6">
            {footer}
          </CardFooter>
        </>
      )}
    </Card>
  )
}

interface FormRowProps {
  children: React.ReactNode
  className?: string
  columns?: 1 | 2 | 3 | 4
}

export function FormRow({ children, className, columns = 2 }: FormRowProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  }[columns]

  return (
    <div className={cn("grid gap-4", gridClass, className)}>
      {children}
    </div>
  )
}

interface FormFieldWrapperProps {
  children: React.ReactNode
  error?: string
  className?: string
  required?: boolean
}

export function FormFieldWrapper({ children, error, className, required }: FormFieldWrapperProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        {children}
        {required && (
          <span className="absolute -top-2 -right-2 text-red-500 text-xs">*</span>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive mt-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  )
}

interface FormActionsProps {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right' | 'between'
  className?: string
}

export function FormActions({ children, align = 'right', className }: FormActionsProps) {
  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  }[align]

  return (
    <div className={cn("flex items-center gap-3", alignClass, className)}>
      {children}
    </div>
  )
}

interface FormHeaderProps {
  title: string
  description?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function FormHeader({ title, description, badge, actions, className }: FormHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            {badge}
          </div>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      <Separator />
    </div>
  )
}

interface FormGroupProps {
  children: React.ReactNode
  className?: string
  label?: string
  description?: string
}

export function FormGroup({ children, className, label, description }: FormGroupProps) {
  return (
    <div className={cn("space-y-4 rounded-lg border p-4", className)}>
      {(label || description) && (
        <div className="space-y-1">
          {label && <p className="text-sm font-medium">{label}</p>}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}