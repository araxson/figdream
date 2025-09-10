import * as React from "react"
import { toast as sonnerToast } from "sonner"

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

interface ToastState {
  toasts: Toast[]
}

const listeners: Array<(state: ToastState) => void> = []
let memoryState: ToastState = { toasts: [] }

function dispatch(action: { type: "ADD_TOAST" | "UPDATE_TOAST" | "DISMISS_TOAST" | "REMOVE_TOAST"; toast?: Toast }) {
  switch (action.type) {
    case "ADD_TOAST":
      if (action.toast) {
        memoryState = {
          ...memoryState,
          toasts: [action.toast, ...memoryState.toasts],
        }
      }
      break
    case "DISMISS_TOAST":
      if (action.toast) {
        memoryState = {
          ...memoryState,
          toasts: memoryState.toasts.map((t) =>
            t.id === action.toast!.id ? { ...t, open: false } : t
          ),
        }
      }
      break
    case "REMOVE_TOAST":
      if (action.toast) {
        memoryState = {
          ...memoryState,
          toasts: memoryState.toasts.filter((t) => t.id !== action.toast!.id),
        }
      }
      break
  }
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

export function toast({ title, description, variant = "default", ...props }: Omit<Toast, "id">) {
  const id = Math.random().toString(36).substr(2, 9)
  
  // Use sonner for notifications
  if (variant === "destructive") {
    sonnerToast.error(title, {
      description,
    })
  } else {
    sonnerToast.success(title, {
      description,
    })
  }
  
  const newToast = {
    ...props,
    id,
    title,
    description,
    variant,
  }
  
  dispatch({
    type: "ADD_TOAST",
    toast: newToast,
  })
  
  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toast: newToast }),
  }
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => {
      const toastToDismiss = state.toasts.find((t) => t.id === toastId)
      if (toastToDismiss) {
        dispatch({ type: "DISMISS_TOAST", toast: toastToDismiss })
      }
    },
  }
}