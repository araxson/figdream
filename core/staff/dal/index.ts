/**
 * Staff DAL - Public API
 * Organized into logical subfolders for better maintainability
 */

// Consolidated types using database as source of truth
export * from './staff.types';

// Core staff operations (root level)
export * from './staff';
export * from './queries';
export * from './mutations';

// Salon-specific queries
export * from './salon.queries';

// Schedule operations (comprehensive scheduling system)
export * from './schedule';

// Time-off operations
export * from './timeoff.queries';
export * from './timeoff.mutations';

// Blocked time operations
export * from './blocked-time.mutations';

// Service assignment operations
export * from './services.mutations';