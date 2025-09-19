"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import type { StaffProfile } from "../dal/staff-types"

// Import sub-components
import { StaffProfileHeader } from "./staff-profile-header"
import { StaffBasicInfo } from "./staff-basic-info"
import { StaffProfessionalInfo } from "./staff-professional-info"
import { StaffPerformanceMetrics } from "./staff-performance-metrics"
import { StaffReviews } from "./staff-reviews"
import { StaffCustomers } from "./staff-customers"

interface StaffProfileViewProps {
  staff: StaffProfile
  onClose?: () => void
  onUpdate?: (updates: Partial<StaffProfile>) => Promise<void>
  showActions?: boolean
}

export function StaffProfileView({
  staff,
  onClose,
  onUpdate,
  showActions = true
}: StaffProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [formData, setFormData] = useState({
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
  })

  // Mock performance data - in real app this would come from props or API
  const performanceData = {
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
      trend: "up" as const
    }
  }

  // Mock customer favorites - in real app this would come from props or API
  const favoriteCustomers = [
    { id: "1", name: "Sarah Johnson", visits: 24, lastVisit: "2024-01-15" },
    { id: "2", name: "Michael Chen", visits: 18, lastVisit: "2024-01-12" },
    { id: "3", name: "Emily Davis", visits: 15, lastVisit: "2024-01-10" },
    { id: "4", name: "James Wilson", visits: 12, lastVisit: "2024-01-08" },
    { id: "5", name: "Lisa Anderson", visits: 10, lastVisit: "2024-01-05" }
  ]

  // Mock recent reviews - in real app this would come from props or API
  const recentReviews = [
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

  const handleEdit = () => setIsEditing(true)

  const handleSave = async () => {
    if (onUpdate) {
      await onUpdate(formData)
      setIsEditing(false)
      toast.success("Profile updated successfully")
    }
  }

  const handleCancel = () => {
    setFormData({
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
    })
    setIsEditing(false)
  }

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <StaffProfileHeader
        staff={staff}
        isEditing={isEditing}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onClose={onClose}
        showActions={showActions}
      />

      <Separator />

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <StaffBasicInfo
            staff={staff}
            formData={formData}
            isEditing={isEditing}
            onFormDataChange={handleFormDataChange}
          />
          <StaffProfessionalInfo
            staff={staff}
            formData={formData}
            isEditing={isEditing}
            onFormDataChange={handleFormDataChange}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <StaffPerformanceMetrics performanceData={performanceData} />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <StaffReviews reviews={recentReviews} />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <StaffCustomers favoriteCustomers={favoriteCustomers} />
        </TabsContent>
      </Tabs>
    </div>
  )
}