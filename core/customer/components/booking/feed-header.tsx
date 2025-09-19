'use client'

import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Bell,
  BellOff,
  RefreshCw,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
} from 'lucide-react'

interface BookingFeedHeaderProps {
  connected: boolean
  reconnecting: boolean
  soundEnabled: boolean
  notificationsEnabled: boolean
  feedItemsLength: number
  onSoundToggle: () => void
  onNotificationsToggle: () => void
  onClearFeed: () => void
}

export function BookingFeedHeader({
  connected,
  reconnecting,
  soundEnabled,
  notificationsEnabled,
  feedItemsLength,
  onSoundToggle,
  onNotificationsToggle,
  onClearFeed
}: BookingFeedHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              Live Booking Feed
              {connected ? (
                <Badge variant="outline" className="gap-1">
                  <Wifi className="h-3 w-3" />
                  Connected
                </Badge>
              ) : reconnecting ? (
                <Badge variant="secondary" className="gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Reconnecting
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <WifiOff className="h-3 w-3" />
                  Offline
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Real-time booking updates and notifications
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSoundToggle}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNotificationsToggle}
                >
                  {notificationsEnabled ? (
                    <Bell className="h-4 w-4" />
                  ) : (
                    <BellOff className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="outline"
            size="sm"
            onClick={onClearFeed}
            disabled={feedItemsLength === 0}
          >
            Clear
          </Button>
        </div>
      </div>
    </CardHeader>
  )
}