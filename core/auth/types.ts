/**
 * Auth Module Types
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface OTPVerification {
  code: string;
  email?: string;
  phone?: string;
}

export interface PasswordReset {
  email: string;
}

export interface PasswordUpdate {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}
