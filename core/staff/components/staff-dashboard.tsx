"use client"

import { useState, useTransition, useOptimistic } from "react"
import {
  Users,
  Calendar,
  TrendingUp,
  Clock,
  Star,
  DollarSign,
  BarChart3,
  Grid3x3,
  List,
  Filter,
  Download,
  UserPlus,
  Settings
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  getStaffAction,
  updateStaffMemberAction,
  toggleStaffAvailabilityAction,
  assignServicesToStaffAction,
  updateStaffStatusAction
} from "../actions/staff-actions"
import { StaffGrid } from "./grid"
import { StaffList } from "./list"
import { StaffFilters } from "./filters"
import { StaffStats } from "./stats"
import { StaffScheduleManager } from "./staff-schedule-manager"
import { StaffProfileView } from "./staff-profile-view"
import { StaffOnboarding } from "./staff-onboarding"
import { StaffAnalytics } from "./staff-analytics"
import type { StaffProfile } from "../dal/staff-types"

interface StaffDashboardProps {
  initialData?: StaffProfile[]
  salonId?: string
  role?: "admin" | "owner" | "manager"
}

export function StaffDashboard({
  initialData = [],
  salonId,
  role = "manager"
}: StaffDashboardProps) {
  const [isPending, startTransition] = useTransition()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Filters state
  const [filters, setFilters] = useState({
    status: "all",
    availability: "all",
    service: "all",
    search: ""
  })

  // Optimistic updates
  const [optimisticStaff, updateOptimisticStaff] = useOptimistic(
    initialData,
    (state: StaffProfile[], update: { id: string, changes: Partial<StaffProfile> }) => {
      return state.map(staff =>
        staff.id === update.id
          ? { ...staff, ...update.changes }
          : staff
      )
    }
  )

  // Calculate stats
  const stats = {
    total: optimisticStaff.length,
    available: optimisticStaff.filter(s => s.status === "available").length,
    busy: optimisticStaff.filter(s => s.status === "busy").length,
    onBreak: optimisticStaff.filter(s => s.status === "break").length,
    offline: optimisticStaff.filter(s => s.status === "offline").length,
    utilization: Math.round(
      (optimisticStaff.filter(s => s.status === "busy").length /
       optimisticStaff.filter(s => s.is_bookable).length) * 100
    ) || 0,
    avgRating:
      optimisticStaff.reduce((acc, s) => acc + (s.rating_average || 0), 0) /
      optimisticStaff.length || 0,
    totalRevenue: optimisticStaff.reduce((acc, s) => acc + (s.total_revenue || 0), 0),
    topPerformer: optimisticStaff.sort((a, b) =>
      (b.rating_average || 0) - (a.rating_average || 0)
    )[0]
  }

  // Toggle staff availability
  const handleToggleAvailability = async (staffId: string) => {
    const staff = optimisticStaff.find(s => s.id === staffId)
    if (!staff) return

    updateOptimisticStaff({
      id: staffId,
      changes: { is_bookable: !staff.is_bookable }
    })

    startTransition(async () => {
      const result = await toggleStaffAvailabilityAction(staffId)
      if (!result.success) {
        toast.error(result.error || "Failed to toggle availability")
        // Revert optimistic update
        updateOptimisticStaff({
          id: staffId,
          changes: { is_bookable: staff.is_bookable }
        })
      } else {
        toast.success(result.message)
      }
    })
  }

  // Update staff status
  const handleStatusUpdate = async (staffId: string, status: string) => {
    updateOptimisticStaff({
      id: staffId,
      changes: { status: status as any }
    })

    startTransition(async () => {
      const result = await updateStaffStatusAction(staffId, status)
      if (!result.success) {
        toast.error(result.error || "Failed to update status")
      } else {
        toast.success(result.message)
      }
    })
  }

  // Quick actions menu
  const QuickActionsMenu = ({ staff }: { staff: StaffProfile }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setSelectedStaff(staff)}>
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToggleAvailability(staff.id)}>
          {staff.is_bookable ? "Make Unavailable" : "Make Available"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Set Status</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleStatusUpdate(staff.id, "available")}>
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          Available
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusUpdate(staff.id, "busy")}>
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
          Busy
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusUpdate(staff.id, "break")}>
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
          On Break
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusUpdate(staff.id, "offline")}>
          <span className="w-2 h-2 bg-gray-500 rounded-full mr-2" />
          Offline
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team, schedules, and performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Export Schedule</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setShowOnboarding(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.available} available now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.utilization}%</div>
            <Progress value={stats.utilization} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgRating.toFixed(1)}
            </div>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.round(stats.avgRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <StaffFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          {activeTab === "overview" && (
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="overview" className="space-y-4">
          {/* Real-time Status Board */}
          <Card>
            <CardHeader>
              <CardTitle>Live Status</CardTitle>
              <CardDescription>Real-time staff availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm">
                    Available ({stats.available})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-sm">
                    Busy ({stats.busy})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm">
                    Break ({stats.onBreak})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-gray-500 rounded-full" />
                  <span className="text-sm">
                    Offline ({stats.offline})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Grid/List */}
          {viewMode === "grid" ? (
            <StaffGrid
              staff={optimisticStaff}
              onStaffClick={setSelectedStaff}
              QuickActionsMenu={QuickActionsMenu}
              isPending={isPending}
            />
          ) : (
            <StaffList
              staff={optimisticStaff}
              onStaffClick={setSelectedStaff}
              QuickActionsMenu={QuickActionsMenu}
              isPending={isPending}
            />
          )}
        </TabsContent>

        <TabsContent value="schedule">
          <StaffScheduleManager
            staff={optimisticStaff}
            salonId={salonId}
          />
        </TabsContent>

        <TabsContent value="performance">
          <StaffAnalytics
            staff={optimisticStaff}
            salonId={salonId}
          />
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Assignments</CardTitle>
              <CardDescription>
                Manage which services each staff member can perform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceAssignmentMatrix
                staff={optimisticStaff}
                onAssign={async (staffId, serviceIds) => {
                  const result = await assignServicesToStaffAction(staffId, {
                    service_ids: serviceIds,
                    can_modify_price: false
                  })
                  if (result.success) {
                    toast.success("Services updated successfully")
                  } else {
                    toast.error(result.error || "Failed to update services")
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedStaff && (
            <StaffProfileView
              staff={selectedStaff}
              onClose={() => setSelectedStaff(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <StaffOnboarding
            onComplete={() => {
              setShowOnboarding(false)
              toast.success("Staff member added successfully")
            }}
            onCancel={() => setShowOnboarding(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Service Assignment Matrix Component
function ServiceAssignmentMatrix({
  staff,
  onAssign
}: {
  staff: StaffProfile[]
  onAssign: (staffId: string, serviceIds: string[]) => Promise<void>
}) {
  return (
    <div className="space-y-4">
      {staff.map(member => (
        <div key={member.id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {member.display_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{member.display_name}</p>
                <p className="text-sm text-muted-foreground">{member.title}</p>
              </div>
            </div>
            <Badge variant={member.is_bookable ? "default" : "secondary"}>
              {member.is_bookable ? "Bookable" : "Not Bookable"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {member.services?.map(service => (
              <Badge key={service.id} variant="outline">
                {service.name}
              </Badge>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              // TODO: Open service selection dialog
            }}
          >
            Manage Services
          </Button>
        </div>
      ))}
    </div>
  )
}