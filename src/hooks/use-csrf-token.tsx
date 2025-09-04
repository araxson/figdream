'use client';
import { useState, useEffect } from 'react';
/**
 * Hook to get CSRF token for forms
 * @returns {Object} Object containing token and loading state
 */
export function useCSRFToken() {
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    async function fetchToken() {
      try {
        const response = await fetch('/api/csrf');
        if (!response.ok) {
          throw new Error('Failed to fetch CSRF token');
        }
        const data = await response.json();
        if (mounted) {
          setToken(data.token);
          setError(null);
        }
      } catch (_err) {
        if (mounted) {
          setError('Failed to initialize security token');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    fetchToken();
    return () => {
      mounted = false;
    };
  }, []);
  return { token, loading, error };
}
/**
 * Hidden input field component for CSRF token
 */
export function CSRFTokenField({ token }: { token: string }) {
  return <input type="hidden" name="csrf_token" value={token} />;
}