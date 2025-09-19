# Integration Layer Documentation

## Overview
The integration layer provides a comprehensive framework that connects all platform features into a unified, cohesive application. It handles navigation, state management, authentication, performance monitoring, and UI orchestration.

## Core Components

### 1. AppShell
The master application wrapper that provides:
- Global layout structure
- Navigation management
- Context providers
- Performance monitoring
- Error boundaries

```tsx
// In your root layout
import { AppShell } from '@/core/integration'

export default function RootLayout({ children }) {
  return (
    <AppShell role={userRole}>
      {children}
    </AppShell>
  )
}
```

### 2. NavigationManager
Dynamic navigation system with:
- Role-based menu visibility
- Active route highlighting
- Breadcrumb generation
- Expandable menu sections

### 3. ContextOrchestrator
Centralized state management providing:
- User context (authentication, profile, salon)
- Global UI state (loading, errors, modals)
- Notification management
- Theme control
- WebSocket real-time updates

### 4. PerformanceMonitor
Automatic performance tracking:
- Page load metrics
- API response times
- Resource loading
- Memory usage
- Long task detection

### 5. NotificationCenter
Unified notification system:
- System notifications dropdown
- Toast notifications
- Real-time updates
- Mark as read functionality

## Hooks

### useGlobalState
Access and manage global application state:

```tsx
import { useGlobalState } from '@/core/integration'

function MyComponent() {
  const {
    isLoading,
    error,
    showNotification,
    setLoading
  } = useGlobalState()

  // Use the state and actions
  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage />
}
```

### useAppNavigation
Navigation helpers and breadcrumb generation:

```tsx
import { useAppNavigation } from '@/core/integration'

function MyComponent() {
  const {
    breadcrumbs,
    navigateTo,
    isActive,
    canGoBack
  } = useAppNavigation()

  return (
    <nav>
      {breadcrumbs.map(crumb => (
        <Link key={crumb.path} href={crumb.path}>
          {crumb.label}
        </Link>
      ))}
    </nav>
  )
}
```

## Feature Registry
Central registry of all platform features:

```tsx
import { featureRegistry } from '@/core/integration'

// Register a new feature
featureRegistry.register({
  id: 'my-feature',
  name: 'My Feature',
  path: '/my-feature',
  roles: ['salon_owner', 'staff']
})

// Get features for a role
const features = featureRegistry.getFeaturesForRole('salon_owner')

// Check feature access
const hasAccess = featureRegistry.isFeatureAccessible('dashboard', 'staff')
```

## Route Guards
Authentication and authorization protection:

```tsx
import { checkRouteAccess, validateSession } from '@/core/integration'

// In middleware or server component
await checkRouteAccess('/dashboard/settings')

// Validate session
const session = await validateSession()
if (session.isValid) {
  // User is authenticated
}
```

## Integration Points

### 1. Authentication Flow
- Session validation in middleware
- Role-based route protection
- Automatic redirects to login
- Session context propagation

### 2. Real-time Updates
- WebSocket connection management
- Notification push
- Data synchronization
- Salon context updates

### 3. Performance Tracking
- Automatic metric collection
- Performance issue reporting
- Resource monitoring
- API latency tracking

### 4. Error Handling
- Global error boundary
- Error reporting to server
- User-friendly error messages
- Recovery mechanisms

## Usage Examples

### Complete Page Integration
```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react'
import { DashboardContent } from '@/core/salons/components'
import { LoadingSkeleton } from '@/core/shared/components'

export default function DashboardPage() {
  // Ultra-thin page - just return the component
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
```

### Feature Module Integration
```tsx
// core/my-feature/components/main.tsx
'use client'

import { useGlobalState, useAppNavigation } from '@/core/integration'

export function MyFeatureMain() {
  const { setLoading, showNotification } = useGlobalState()
  const { navigateTo } = useAppNavigation()

  const handleAction = async () => {
    setLoading(true)
    try {
      // Perform action
      await doSomething()

      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Action completed successfully'
      })

      navigateTo('/dashboard')
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    // Component JSX
  )
}
```

### Custom Notification
```tsx
import { useActions } from '@/core/integration'

function MyComponent() {
  const { showNotification } = useActions()

  const notify = () => {
    showNotification({
      type: 'info',
      title: 'New Message',
      message: 'You have a new appointment request',
      duration: 5000,
      action: {
        label: 'View',
        onClick: () => window.location.href = '/appointments'
      }
    })
  }
}
```

## Keyboard Shortcuts
The integration layer provides global keyboard shortcuts:
- `Cmd/Ctrl + K`: Open global search
- `Cmd/Ctrl + B`: Toggle sidebar
- `Cmd/Ctrl + N`: Open notifications
- `Escape`: Close modals

## Performance Optimization
- Lazy loading of feature modules
- Route-based code splitting
- Automatic performance monitoring
- Resource optimization
- Cache management

## Security Features
- Authentication enforcement
- Role-based access control
- CSRF protection
- XSS prevention
- Rate limiting support

## Best Practices

1. **Always use the AppShell wrapper** in your root layout
2. **Leverage context providers** instead of prop drilling
3. **Use the notification system** for user feedback
4. **Register features** in the feature registry
5. **Implement route guards** for protected pages
6. **Monitor performance metrics** regularly
7. **Handle errors gracefully** with error boundaries
8. **Keep pages ultra-thin** - business logic in core modules

## Troubleshooting

### Navigation not updating
Ensure feature is registered in the feature registry with correct roles.

### Context not available
Verify components are wrapped in AppShell and ContextOrchestrator.

### Performance issues
Check Performance Monitor logs in browser console and server logs.

### Authentication failures
Verify middleware is configured correctly and session is valid.

## Migration Guide

To integrate existing features:

1. Move business logic to core modules
2. Register features in feature registry
3. Update pages to be ultra-thin
4. Add role-based guards
5. Integrate with global state
6. Add performance monitoring
7. Test error boundaries

## Support

For issues or questions about the integration layer:
1. Check this documentation
2. Review example implementations
3. Check browser console for errors
4. Review server logs for API issues