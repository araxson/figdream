'use client'

import { createContext, useContext, ReactNode } from 'react'

interface SalonContextType {
  salonId: string
  salonName: string
  isSuperAdmin: boolean
  canSwitchSalons: boolean
}

const SalonContext = createContext<SalonContextType | undefined>(undefined)

export function SalonContextProvider({
  children,
  salonId,
  salonName,
  isSuperAdmin = false
}: {
  children: ReactNode
  salonId: string
  salonName: string
  isSuperAdmin?: boolean
}) {
  return (
    <SalonContext.Provider 
      value={{
        salonId,
        salonName,
        isSuperAdmin,
        canSwitchSalons: isSuperAdmin
      }}
    >
      {children}
    </SalonContext.Provider>
  )
}

export function useSalonContext() {
  const context = useContext(SalonContext)
  if (context === undefined) {
    throw new Error('useSalonContext must be used within a SalonContextProvider')
  }
  return context
}