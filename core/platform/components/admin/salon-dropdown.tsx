'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Shield,
  Star,
} from 'lucide-react';
import type { PlatformSalon } from '../types';

interface SalonActionsDropdownProps {
  salon: PlatformSalon;
  isLoading: boolean;
  onAction: (type: 'activate' | 'deactivate' | 'verify' | 'feature' | 'unfeature', salon: PlatformSalon) => void;
}

export function SalonActionsDropdown({ salon, isLoading, onAction }: SalonActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={isLoading}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => window.open(`/salon/${salon.slug}`, '_blank')}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Salon
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {salon.is_active ? (
          <DropdownMenuItem
            onClick={() => onAction('deactivate', salon)}
            className="text-red-600"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Deactivate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onAction('activate', salon)}
            className="text-green-600"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Activate
          </DropdownMenuItem>
        )}
        {!salon.is_verified && (
          <DropdownMenuItem
            onClick={() => onAction('verify', salon)}
            className="text-blue-600"
          >
            <Shield className="mr-2 h-4 w-4" />
            Verify Salon
          </DropdownMenuItem>
        )}
        {salon.is_featured ? (
          <DropdownMenuItem
            onClick={() => onAction('unfeature', salon)}
          >
            <Star className="mr-2 h-4 w-4" />
            Remove Featured
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onAction('feature', salon)}
            className="text-yellow-600"
          >
            <Star className="mr-2 h-4 w-4" />
            Make Featured
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}