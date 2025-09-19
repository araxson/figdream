/**
 * Schedule Mutations - Main coordinator for all schedule operations
 * This file imports and re-exports all schedule mutation functions
 */

// Re-export all mutation functions from specialized modules
export * from './basic-crud.mutations';
export * from './conflict-resolution.mutations';
export * from './optimization.mutations';
export * from './auto-assignment.mutations';