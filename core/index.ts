/**
 * Core Module Exports - Actor-Centric Architecture
 *
 * All business logic is organized by actor/user type.
 * Each module contains complete feature domains for that actor.
 */

// Platform Administrators
export * from './platform';

// Salon Owners & Managers
export * from './salon';

// Customer-Facing Features
export * from './customer';

// Staff Members
export * from './staff';

// Authentication
export * from './auth';

// Public/Unauthenticated
export * from './public';

// Shared Utilities
export * from './shared';