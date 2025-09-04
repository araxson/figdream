'use client';
import { useCSRFToken } from '@/hooks/use-csrf-token';
/**
 * Component to render hidden CSRF input field
 */
export function CSRFTokenField() {
  const { token, loading } = useCSRFToken();
  if (loading) return null;
  return (
    <input 
      type="hidden" 
      name="csrf_token" 
      value={token}
      required
    />
  );
}