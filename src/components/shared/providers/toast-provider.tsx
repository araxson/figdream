"use client"

import { Toaster } from "@/components/ui/sonner"

export function ToastProvider() {
  return (
    <Toaster 
      position="bottom-right"
      toastOptions={{
        classNames: {
          error: 'bg-destructive text-destructive-foreground',
          success: 'bg-green-600 text-white',
          warning: 'bg-yellow-600 text-white',
          info: 'bg-blue-600 text-white',
        },
      }}
    />
  )
}