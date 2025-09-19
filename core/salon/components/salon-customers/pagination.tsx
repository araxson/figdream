'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CustomerPaginationProps {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function CustomerPagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange
}: CustomerPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const startItem = ((currentPage - 1) * itemsPerPage) + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalItems} customers
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}