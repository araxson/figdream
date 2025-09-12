'use client'

import { useState, useCallback, useMemo } from 'react'

interface UsePaginationStateOptions {
  defaultPage?: number
  defaultPageSize?: number
  totalItems?: number
  pageSizeOptions?: number[]
}

export function usePaginationState(options: UsePaginationStateOptions = {}) {
  const {
    defaultPage = 1,
    defaultPageSize = 10,
    totalItems = 0,
    pageSizeOptions = [10, 20, 30, 50, 100]
  } = options

  const [currentPage, setCurrentPage] = useState(defaultPage)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize)
  }, [totalItems, pageSize])

  const hasNextPage = useMemo(() => {
    return currentPage < totalPages
  }, [currentPage, totalPages])

  const hasPreviousPage = useMemo(() => {
    return currentPage > 1
  }, [currentPage])

  const paginationRange = useMemo(() => {
    const delta = 2
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []
    let l: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }, [currentPage, totalPages])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages))
  }, [totalPages])

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1)
    }
  }, [hasNextPage])

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1)
    }
  }, [hasPreviousPage])

  const firstPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages)
  }, [totalPages])

  const changePageSize = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }, [])

  const offset = useMemo(() => {
    return (currentPage - 1) * pageSize
  }, [currentPage, pageSize])

  const pageInfo = useMemo(() => {
    const start = offset + 1
    const end = Math.min(offset + pageSize, totalItems)
    return {
      start,
      end,
      total: totalItems
    }
  }, [offset, pageSize, totalItems])

  return {
    currentPage,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    paginationRange,
    pageSizeOptions,
    offset,
    pageInfo,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    changePageSize
  }
}