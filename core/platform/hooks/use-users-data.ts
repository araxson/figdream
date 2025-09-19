'use client'

import { useState, useCallback, useTransition } from 'react'
import { toast } from 'sonner'
import type { ProfileWithRelations, UserFilters, UserManagementStats } from '../dal/users-types'
import { getUsersAction, getUserStatsAction } from '../actions'

interface UseUsersDataProps {
  initialUsers?: ProfileWithRelations[]
  initialStats?: UserManagementStats
}

export function useUsersData({ initialUsers = [], initialStats }: UseUsersDataProps = {}) {
  const [, startTransition] = useTransition()
  const [users, setUsers] = useState<ProfileWithRelations[]>(initialUsers)
  const [stats, setStats] = useState<UserManagementStats | undefined>(initialStats)
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all'
  })

  // Fetch users with filters
  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await getUsersAction(filters)
      setUsers(result)
    } catch (_error) {
      toast.error('Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const result = await getUserStatsAction()
      setStats(result)
    } catch (_error) {
      console.error('Failed to fetch stats:', _error)
    }
  }, [])

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    startTransition(() => {
      fetchUsers()
    })
  }, [fetchUsers])

  // Handle filter change
  const handleFilterChange = useCallback((key: keyof UserFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    startTransition(() => {
      fetchUsers()
    })
  }, [fetchUsers])

  // Refresh data
  const refreshData = useCallback(() => {
    fetchUsers()
    fetchStats()
  }, [fetchUsers, fetchStats])

  return {
    users,
    stats,
    filters,
    isLoading,
    fetchUsers,
    fetchStats,
    handleSearch,
    handleFilterChange,
    refreshData,
    setUsers,
    setStats
  }
}