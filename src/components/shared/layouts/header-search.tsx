'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function HeaderSearch() {
  return (
    <div className="hidden md:flex flex-1 max-w-md mx-8">
      <div className="relative w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search salons, services..."
          className="pl-10"
        />
      </div>
    </div>
  )
}