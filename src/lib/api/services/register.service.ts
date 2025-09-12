// Converted to use API routes instead of direct client access
import { USER_ROLES } from "@/lib/auth/constants"
import { RegisterFormValues } from "@/components/features/auth/register/register-schema"

export async function registerUser(values: RegisterFormValues) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: values.email,
      password: values.password,
      fullName: values.fullName,
      phone: values.phone,
      role: USER_ROLES.CUSTOMER
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create account. Please try again.')
  }

  const data = await response.json()
  return data
}

export async function signInWithGoogle() {
  const response = await fetch('/api/auth/oauth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      redirectTo: `${window.location.origin}/auth/callback`
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to sign in with Google')
  }

  const data = await response.json()
  
  // Redirect to the OAuth URL if provided
  if (data.url) {
    window.location.href = data.url
  }
}