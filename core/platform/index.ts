/**
 * Platform Module - Public API
 * Platform administration and analytics functionality
 * Now follows Core Module Pattern with co-located files
 */

// Platform Actions - All server actions for platform management
export * from './actions';

// Platform Data Access Layer - All database operations
export * from './dal';

// Platform Components - All React UI components
export * from './components';

// Platform Hooks - All React hooks for data fetching and state
export * from './hooks';

// Note: Types are exported directly from DAL to avoid circular dependencies