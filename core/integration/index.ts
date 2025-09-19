// Main integration module exports
export * from './components'
export * from './hooks'
export * from './types'
export { featureRegistry } from './lib/feature-registry'
export { checkRouteAccess, getAccessibleRoute, isPublicRoute, validateSession } from './lib/route-guards'