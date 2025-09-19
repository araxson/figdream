import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/database.types'

export function useSession() {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }

    router.push('/login')
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  }
}