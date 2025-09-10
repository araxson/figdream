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
} from "@/components/ui/alert-dialog"
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StaffDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staffName: string
  onConfirm: () => void
}

export function StaffDeleteDialog({ 
  open, 
  onOpenChange, 
  staffName, 
  onConfirm 
}: StaffDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn("max-w-md")}>
        <AlertDialogHeader>
          <div className={cn("flex items-center gap-3")}>
            <div className={cn(
              "rounded-full bg-destructive/10 p-3",
              "flex items-center justify-center"
            )}>
              <AlertTriangle className={cn("h-6 w-6 text-destructive")} />
            </div>
            <AlertDialogTitle className={cn("text-xl")}>Delete Staff Member?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className={cn("mt-4 space-y-2")}>
            <p>
              You are about to permanently delete <span className={cn("font-semibold")}>{staffName}</span> from your staff list.
            </p>
            <div className={cn(
              "rounded-lg border border-destructive/20 bg-destructive/5 p-3",
              "space-y-2"
            )}>
              <p className={cn("text-sm font-medium text-destructive")}>
                This action will:
              </p>
              <ul className={cn("text-sm space-y-1 ml-4")}>
                <li className={cn("flex items-start gap-2")}>
                  <span className={cn("text-destructive mt-0.5")}>•</span>
                  <span>Remove all staff member data</span>
                </li>
                <li className={cn("flex items-start gap-2")}>
                  <span className={cn("text-destructive mt-0.5")}>•</span>
                  <span>Cancel all upcoming appointments</span>
                </li>
                <li className={cn("flex items-start gap-2")}>
                  <span className={cn("text-destructive mt-0.5")}>•</span>
                  <span>Remove access to the system</span>
                </li>
              </ul>
            </div>
            <p className={cn("text-sm font-medium")}>
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={cn("gap-2")}>
          <AlertDialogCancel className={cn("gap-2")}>
            <X className={cn("h-4 w-4")} />
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={cn(
              "gap-2 bg-destructive text-destructive-foreground",
              "hover:bg-destructive/90"
            )}
          >
            <Trash2 className={cn("h-4 w-4")} />
            Delete Staff Member
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}