import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'
import { USER_ROLES, type UserRole } from '@/lib/auth/constants'

export type UserDTO = {
  id: string
  email: string
  role: string
  created_at: string
}

export type SessionDTO = {
  user: UserDTO
  session_id: string
}

/**
 * Create a Supabase client that can handle both cookie and Bearer token auth
 */
export async function createAuthClient(request?: NextRequest) {
  // If request has Authorization header with Bearer token, use it
  if (request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      // Create a client with the bearer token using anon key
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      return createSupabaseClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        }
      )
    }
  }
  
  // Otherwise use the regular cookie-based client
  return createClient()
}

/**
 * Get user role from profiles table using service client
 */
async function getUserRole(userId: string): Promise<string> {
  try {
    // Use service client to bypass RLS for role fetching
    const serviceClient = createServiceClient()
    
    const { data: profile, error } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user role:', error)
      return USER_ROLES.CUSTOMER
    }
    
    if (profile?.role && Object.values(USER_ROLES).includes(profile.role as UserRole)) {
      return profile.role as UserRole
    }
  } catch (err) {
    console.error('Error in getUserRole:', err)
  }
  
  return USER_ROLES.CUSTOMER
}

/**
 * Verify session from either cookies or Bearer token
 */
export async function verifyApiSession(request?: NextRequest): Promise<SessionDTO | null> {
  try {
    const supabase = await createAuthClient(request)
    
    // Get user from token/cookies
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      console.error('No user found:', error)
      return null
    }
    
    // Get the actual role from the database using service client
    const role = await getUserRole(user.id)
    
    return {
      user: {
        id: user.id,
        email: user.email!,
        role: role,
        created_at: user.created_at!,
      },
      session_id: user.id
    }
  } catch (error) {
    console.error('Error verifying session:', error)
    return null
  }
}