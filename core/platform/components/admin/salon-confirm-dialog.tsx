'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { PlatformSalon } from '../types';

interface SalonConfirmDialogProps {
  confirmAction: {
    type: 'activate' | 'deactivate' | 'verify' | 'feature' | 'unfeature';
    salon: PlatformSalon;
  } | null;
  onConfirm: (type: string, salonId: string) => void;
  onCancel: () => void;
}

export function SalonConfirmDialog({ confirmAction, onConfirm, onCancel }: SalonConfirmDialogProps) {
  if (!confirmAction) return null;

  const titles = {
    activate: 'Activate Salon',
    deactivate: 'Deactivate Salon',
    verify: 'Verify Salon',
    feature: 'Feature Salon',
    unfeature: 'Remove Featured Status'
  };

  const descriptions = {
    activate: `Are you sure you want to activate ${confirmAction.salon.name}? This will allow them to accept bookings.`,
    deactivate: `Are you sure you want to deactivate ${confirmAction.salon.name}? This will suspend their operations.`,
    verify: `Are you sure you want to verify ${confirmAction.salon.name}? This will mark them as a verified business.`,
    feature: `Are you sure you want to feature ${confirmAction.salon.name}? This will promote them on the platform.`,
    unfeature: `Are you sure you want to remove featured status from ${confirmAction.salon.name}?`
  };

  const buttonTexts = {
    activate: 'Activate',
    deactivate: 'Deactivate',
    verify: 'Verify',
    feature: 'Feature',
    unfeature: 'Remove Featured'
  };

  return (
    <AlertDialog open={true} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titles[confirmAction.type]}</AlertDialogTitle>
          <AlertDialogDescription>
            {descriptions[confirmAction.type]}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(confirmAction.type, confirmAction.salon.id)}
            className={confirmAction.type === 'deactivate' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {buttonTexts[confirmAction.type]}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}