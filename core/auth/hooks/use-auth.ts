import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'

type AuthState = {
  user: User | null
  profile: Database['public']['Views']['profiles']['Row'] | null
  loading: boolean
  error: string | null
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  })

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: error.message
          }))
          return
        }

        if (session?.user) {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setAuthState({
            user: session.user,
            profile: profileError ? null : profile,
            loading: false,
            error: profileError?.message || null
          })
        } else {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setAuthState({
            user: session.user,
            profile: profile || null,
            loading: false,
            error: null
          })
        } else {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: null
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return authState
}