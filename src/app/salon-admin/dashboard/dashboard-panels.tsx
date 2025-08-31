'use client'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users, Package } from "lucide-react"

interface DashboardPanelsProps {
  stats: {
    todayAppointments: number
    pendingAppointments: number
    activeStaff: number
    activeServices: number
  }
  salonName: string
}

export function DashboardPanels({ stats, salonName }: DashboardPanelsProps) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[400px] rounded-lg border"
    >
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Today's Overview</h3>
              <p className="text-sm text-muted-foreground">Real-time status for {salonName}</p>
            </div>
            
            <div className="space-y-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Today's Appointments
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayAppointments}</div>
                  <p className="text-xs text-muted-foreground">Scheduled for today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Confirmations
                  </CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingAppointments}</div>
                  <p className="text-xs text-muted-foreground">Awaiting response</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={50} minSize={30}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={50}>
            <div className="h-full p-6">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Staff
                  </CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeStaff}</div>
                  <p className="text-xs text-muted-foreground">Currently working</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Available</span>
                      <span className="font-medium">{Math.floor(stats.activeStaff * 0.6)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Busy</span>
                      <span className="font-medium">{Math.ceil(stats.activeStaff * 0.4)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={50}>
            <div className="h-full p-6">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Services
                  </CardTitle>
                  <Package className="h-4 w-4 text-pink-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeServices}</div>
                  <p className="text-xs text-muted-foreground">Available to book</p>
                  <div className="mt-4 space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Most popular today:
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm">• Haircut & Style</div>
                      <div className="text-sm">• Hair Color</div>
                      <div className="text-sm">• Manicure</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}