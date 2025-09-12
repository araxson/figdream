'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  variant?: 'default' | 'destructive'
  loading?: boolean
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'default',
  loading = false
}: ConfirmationModalProps) {
  const handleConfirm = async () => {
    await onConfirm()
    if (!loading) {
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
          {loading ? (
            <Button
              disabled={loading}
              variant={variant}
              onClick={handleConfirm}
              className={cn(variant === 'destructive' && 'bg-destructive text-destructive-foreground')}
            >
              <Loader2 className="mr-2 h-4 w-4" />
              {`${confirmLabel}...`}
            </Button>
          ) : (
            <AlertDialogAction
              onClick={handleConfirm}
              className={cn(variant === 'destructive' && 'bg-destructive text-destructive-foreground')}
            >
              {confirmLabel}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}