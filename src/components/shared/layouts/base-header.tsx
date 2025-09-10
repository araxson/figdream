'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

interface BaseHeaderProps {
  title?: string
  actions?: React.ReactNode
  breadcrumb?: React.ReactNode
  className?: string
  showSidebarTrigger?: boolean
  children?: React.ReactNode
}

export function BaseHeader({
  title,
  actions,
  breadcrumb,
  className,
  showSidebarTrigger = true,
  children
}: BaseHeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="flex h-14 items-center px-4 gap-4">
        {showSidebarTrigger && (
          <>
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
          </>
        )}
        
        {breadcrumb && (
          <>
            {breadcrumb}
            <Separator orientation="vertical" className="h-6" />
          </>
        )}
        
        {title && (
          <h1 className="font-semibold">{title}</h1>
        )}
        
        {children}
        
        {actions && (
          <div className="ml-auto flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}