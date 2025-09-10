'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    async function handleLogout() {
      try {
        // In production, this would call your auth signout API
        // For now, we'll simulate a logout
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        toast.success('Logged out successfully')
        router.push('/login')
      } catch {
        toast.error('Failed to log out')
        router.push('/')
      }
    }

    handleLogout()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Logging out...</p>
      </div>
    </div>
  )
}