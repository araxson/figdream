/**
 * Data Access Layer (DAL) - Central point for all database operations
 * This implements the security patterns required by rules.md
 * All database operations MUST go through this layer
 */

export * from './auth';
export * from './profiles';
export * from './salons';
export * from './appointments';
export * from './services';
export * from './staff';
export * from './customers';
export * from './reviews';
export * from './notifications';