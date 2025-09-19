/**
 * Shared Module - Public API
 * Central utilities and components shared across all modules
 *
 * CONSOLIDATED STRUCTURE:
 * - actions/     (shared server actions if any)
 * - components/  (truly shared UI components)
 * - dal/         (shared database utilities & security)
 * - hooks/       (shared hooks)
 * - types/       (shared types & enums)
 * - utils.ts     (consolidated utilities)
 */

// Database utilities and security
export {
  databaseAdapters,
  SecurityGuardian,
  verifySession,
  checkPermission,
  sanitizeInput,
  createSecureDTO
} from './dal';

// Common types
export type {
  BaseEntity,
  PaginatedResult,
  ApiResponse,
  ErrorResponse,
  UserRole,
  AppointmentStatus,
  PaymentStatus,
  VerifiedSession,
  ResourceContext,
  PermissionLevel
} from './types';

// Shared UI components
export {
  ErrorBoundary,
  FeatureErrorBoundary,
  TableErrorBoundary,
  FormErrorBoundary,
  AsyncErrorBoundary,
  EmptyState,
  LoadingState,
  ErrorState,
  SuccessState,
  InfoState,
  LazyComponent,
  DashboardLayout,
  Header,
  Footer,
  MobileNav,
  Sidebar
} from './components';

// Common hooks
export {
  useDebounce,
  useLocalStorage,
  useMediaQuery,
  usePagination,
  useToast
} from './hooks';

// Utility functions (consolidated)
export {
  // Error handling
  handleActionError,
  withErrorHandler,
  validateAndExecute,
  type ActionResponse,

  // Formatting
  formatCurrency,
  formatDate,
  formatPhoneNumber,

  // String utilities
  generateSlug,
  validateEmail,
  truncateText,

  // Validation
  isEmpty,
  debounce,

  // Array utilities
  unique,
  groupBy,
  sortBy,

  // Dynamic imports
  dynamicImport,
  preloadModules
} from './utils';