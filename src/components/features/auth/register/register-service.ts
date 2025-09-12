import { createClient } from '@/lib/supabase/client'
import { RegisterFormValues } from './register-schema'

export async function registerUser(values: RegisterFormValues) {
  const supabase = createClient()
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
        phone: values.phone || null,
      }
    }
  })

  if (authError) {
    throw new Error(authError.message)
  }

  if (!authData.user) {
    throw new Error('Registration failed. Please try again.')
  }

  return authData
}

export async function signInWithGoogle() {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) {
    throw new Error(error.message)
  }
}