'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, DollarSign, Calendar, Star, Users } from 'lucide-react';
import { SalonActionsDropdown } from './salon-actions-dropdown';
import { formatAddress, formatCurrency, formatDate, getStatusBadge, getSubscriptionBadge } from './salon-utils';
import type { PlatformSalon } from '../types';

interface SalonTableRowProps {
  salon: PlatformSalon;
  isActionLoading: boolean;
  onAction: (type: 'activate' | 'deactivate' | 'verify' | 'feature' | 'unfeature', salon: PlatformSalon) => void;
}

export function SalonTableRow({ salon, isActionLoading, onAction }: SalonTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={salon.logo_url || undefined} />
            <AvatarFallback>
              {salon.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{salon.name}</div>
            <div className="text-sm text-muted-foreground truncate">
              {salon.business_name || salon.business_type}
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {salon.email}
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {salon.phone}
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {formatAddress(salon.address)}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {getStatusBadge(salon)}
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          {getSubscriptionBadge(salon)}
          {salon.subscription_expires_at && (
            <div className="text-xs text-muted-foreground">
              Expires: {formatDate(salon.subscription_expires_at)}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-green-600" />
              {formatCurrency(salon.stats.total_revenue)}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-blue-600" />
              {salon.stats.total_bookings}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              {salon.stats.rating_average.toFixed(1)} ({salon.stats.rating_count})
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-purple-600" />
              {salon.stats.employee_count} staff
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {formatDate(salon.created_at)}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <SalonActionsDropdown
          salon={salon}
          isLoading={isActionLoading}
          onAction={onAction}
        />
      </TableCell>
    </TableRow>
  );
}