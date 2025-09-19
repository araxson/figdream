/**
 * Auth Module - Public API
 * Only export what consumers actually need
 */

// Authentication actions - primary API
export {
  signIn,
  signUp,
  signOut,
  resetPassword,
  verifyOtp,
  updatePassword,
  getSession,
  requireAuth
} from './actions';

// Auth hooks for client components
export {
  useAuth,
  useSession,
  useUser
} from './hooks';

// Auth components
export {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  ResetPasswordForm
} from './components';

// Only essential types
export type {
  AuthUser,
  AuthSession,
  AuthError,
  SignInCredentials,
  SignUpData
} from './types';
