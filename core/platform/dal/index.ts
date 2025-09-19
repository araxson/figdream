// Platform Data Access Layer - Public API
// Organized into logical subfolders for better maintainability

// Consolidated types using database as source of truth
export * from './platform.types';

// Core DAL patterns
export * from './queries';
export * from './mutations';
export * from './platform.queries';

// Admin DAL
export * from './admin';

// Analytics DAL
export * from './analytics';

// Roles DAL
export * from './roles';

// Users DAL
export * from './users';