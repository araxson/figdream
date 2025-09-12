import {
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  CalendarX
} from 'lucide-react'

export const statusConfig = {
  pending: {
    label: 'Pending',
    icon: AlertCircle,
    variant: 'secondary' as const,
    color: 'text-yellow-600'
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle,
    variant: 'default' as const,
    color: 'text-green-600'
  },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    variant: 'default' as const,
    color: 'text-blue-600'
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    variant: 'outline' as const,
    color: 'text-blue-600'
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    variant: 'destructive' as const,
    color: 'text-red-600'
  },
  no_show: {
    label: 'No Show',
    icon: CalendarX,
    variant: 'destructive' as const,
    color: 'text-red-600'
  }
}