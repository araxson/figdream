// Salon DAL - Data Access Layer with authentication checks
// Organized into logical subfolders for better maintainability

// Consolidated types using database as source of truth
export * from './salon.types';

// Core DAL patterns (root level)
export * from './queries';
export * from './mutations';
export * from './salons';
export * from './salons.queries';
export * from './salons.mutations';

// Appointments DAL
export * from './appointments';

// Billing DAL
export * from './billing';

// Inventory DAL
export * from './inventory';

// Locations DAL
export * from './locations';

// Services DAL
export * from './services';