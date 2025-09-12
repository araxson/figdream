'use client'

import { Button } from '@/components/ui/button'
import { X, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AdminSalonBannerProps {
  salonName: string
  onExit?: () => void
}

export function AdminSalonBanner({ salonName, onExit }: AdminSalonBannerProps) {
  const router = useRouter()
  
  const handleExit = async () => {
    // Clear the context cookie
    await fetch('/api/admin/salon-context', { method: 'DELETE' })
    
    if (onExit) {
      onExit()
    } else {
      router.push('/admin/salons')
    }
  }
  
  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded">
              <ArrowLeft className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Super Admin Mode
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Managing: <span className="font-semibold">{salonName}</span>
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExit}
            className="text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
          >
            <X className="h-4 w-4 mr-1" />
            Exit Salon
          </Button>
        </div>
      </div>
    </div>
  )
}