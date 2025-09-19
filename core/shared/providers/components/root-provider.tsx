'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'

interface RootProviderProps {
  children: ReactNode
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster />
    </ThemeProvider>
  )
}