"use client"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Bell,
  Calendar,
  Gift,
  Star,
  TrendingUp,
  MoreVertical,
  Check,
  Trash2,
  Eye,
} from "lucide-react"
import type { Database } from "@/types/database.types"
type Notification = Database["public"]["Tables"]["notifications"]["Row"]
interface NotificationCardProps {
  notification: Notification
  selected: boolean
  onToggleSelection: () => void
  onMarkAsRead: () => void
  onDelete: () => void
}
const notificationIcons = {
  appointment_reminder: Calendar,
  appointment_confirmed: Calendar,
  appointment_cancelled: Calendar,
  promotion: Gift,
  review_request: Star,
  loyalty_points: TrendingUp,
  general: Bell,
}
const notificationColors = {
  appointment_reminder: "blue",
  appointment_confirmed: "green",
  appointment_cancelled: "red",
  promotion: "purple",
  review_request: "yellow",
  loyalty_points: "orange",
  general: "gray",
}
export function NotificationCard({
  notification,
  selected,
  onToggleSelection,
  onMarkAsRead,
  onDelete,
}: NotificationCardProps) {
  const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || Bell
  const color = notificationColors[notification.type as keyof typeof notificationColors] || "gray"
  const isRead = !!notification.read_at
  return (
    <Card className={`${!isRead ? "bg-accent/50" : ""} ${selected ? "ring-2 ring-primary" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggleSelection}
            className="mt-1"
          />
          <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
            <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{notification.title}</p>
                  {!isRead && (
                    <Badge variant="secondary">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isRead && (
                    <DropdownMenuItem onClick={onMarkAsRead}>
                      <Check className="mr-2 h-4 w-4" />
                      Mark as Read
                    </DropdownMenuItem>
                  )}
                  {notification.data?.link && (
                    <DropdownMenuItem asChild>
                      <a href={notification.data.link as string}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {notification.data?.action && (
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                >
                  <a href={notification.data.action as string}>
                    {notification.data.actionText as string || "View"}
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}