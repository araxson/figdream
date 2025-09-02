'use client'

import * as React from 'react'
import { Button } from '@/components/ui'
import { Search } from 'lucide-react'
import { CommandSearch } from './command-search'

interface CommandTriggerProps {
  userRole?: 'customer' | 'staff' | 'salon_owner' | 'super_admin'
}

export function CommandTrigger({ userRole = 'customer' }: CommandTriggerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandSearch open={open} onOpenChange={setOpen} userRole={userRole} />
    </>
  )
}