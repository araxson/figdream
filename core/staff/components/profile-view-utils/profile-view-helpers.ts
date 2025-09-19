import type { StaffProfile } from "../../dal/staff-types"
import type { ProfileFormData, PerformanceData, FavoriteCustomer, Review } from "./profile-view-types"

export function createInitialFormData(staff: StaffProfile): ProfileFormData {
  return {
    display_name: staff.display_name || "",
    first_name: staff.first_name || "",
    last_name: staff.last_name || "",
    title: staff.title || "",
    email: staff.email || "",
    phone: staff.phone || "",
    bio: staff.bio || "",
    experience_years: staff.experience_years || 0,
    specializations: staff.specializations || [],
    languages: staff.languages || [],
    commission_rate: staff.commission_rate || 0,
    hourly_rate: staff.hourly_rate || 0,
    employment_type: staff.employment_type || "full_time",
    is_bookable: staff.is_bookable || true,
    is_featured: staff.is_featured || false
  }
}

export function getMockPerformanceData(): PerformanceData {
  return {
    appointments: {
      total: 156,
      completed: 148,
      cancelled: 5,
      noShow: 3
    },
    revenue: {
      total: 15600,
      services: 12800,
      tips: 2800,
      growth: 12.5
    },
    ratings: {
      average: 4.8,
      total: 89,
      distribution: [
        { stars: 5, count: 68 },
        { stars: 4, count: 15 },
        { stars: 3, count: 4 },
        { stars: 2, count: 1 },
        { stars: 1, count: 1 }
      ]
    },
    utilization: {
      current: 78,
      target: 80,
      trend: "up"
    }
  }
}

export function getMockFavoriteCustomers(): FavoriteCustomer[] {
  return [
    { id: "1", name: "Sarah Johnson", visits: 24, lastVisit: "2024-01-15" },
    { id: "2", name: "Michael Chen", visits: 18, lastVisit: "2024-01-12" },
    { id: "3", name: "Emily Davis", visits: 15, lastVisit: "2024-01-10" },
    { id: "4", name: "James Wilson", visits: 12, lastVisit: "2024-01-08" },
    { id: "5", name: "Lisa Anderson", visits: 10, lastVisit: "2024-01-05" }
  ]
}

export function getMockRecentReviews(): Review[] {
  return [
    {
      id: "1",
      customer: "Sarah J.",
      rating: 5,
      comment: "Amazing service as always! Very professional.",
      date: "2024-01-15"
    },
    {
      id: "2",
      customer: "Michael C.",
      rating: 5,
      comment: "Best experience I've had. Highly recommend!",
      date: "2024-01-12"
    },
    {
      id: "3",
      customer: "Emily D.",
      rating: 4,
      comment: "Great service, though had to wait a bit.",
      date: "2024-01-10"
    }
  ]
}

export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}