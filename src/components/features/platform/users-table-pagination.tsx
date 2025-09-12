'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function UsersPagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange
}: PaginationProps) {
  const startItem = ((currentPage - 1) * itemsPerPage) + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className={cn("flex items-center justify-between px-2 py-4")}>
      <div className={cn("text-sm text-muted-foreground")}>
        Showing {startItem} to {endItem} of {totalItems} users
      </div>
      <div className={cn("flex items-center gap-2")}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className={cn("h-4 w-4")} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className={cn("h-4 w-4")} />
        </Button>
        <div className={cn("flex items-center gap-1")}>
          <Input
            type="number"
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value)
              if (page >= 1 && page <= totalPages) {
                onPageChange(page)
              }
            }}
            className={cn("h-8 w-12 text-center")}
            min={1}
            max={totalPages}
          />
          <span className={cn("text-sm text-muted-foreground")}>
            of {totalPages}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className={cn("h-4 w-4")} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className={cn("h-4 w-4")} />
        </Button>
      </div>
    </div>
  )
}