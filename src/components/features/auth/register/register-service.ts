import { createClient } from "@/lib/supabase/client"
import { USER_ROLES } from "@/lib/auth/constants"
import { RegisterFormValues } from "./register-schema"

export async function registerUser(values: RegisterFormValues) {
  const supabase = createClient()
  
  // Sign up the user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        full_name: values.fullName,
        phone: values.phone,
      },
    },
  })

  if (signUpError) {
    throw new Error(signUpError.message)
  }

  if (!authData.user) {
    throw new Error("Failed to create account. Please try again.")
  }

  // Create profile with customer role
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: crypto.randomUUID(),
      user_id: authData.user.id,
      email: values.email,
      full_name: values.fullName,
      phone: values.phone,
      role: USER_ROLES.CUSTOMER
    })

  if (profileError) {
    console.error("Profile creation error:", profileError)
  }

  return authData
}

export async function signInWithGoogle() {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }
}