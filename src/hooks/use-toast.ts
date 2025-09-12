import { toast as sonnerToast } from 'sonner'

export function useToast() {
  const toastFn = (options: {
    title?: string
    description?: string
    variant?: 'default' | 'destructive' | 'success'
    action?: {
      label: string
      onClick: () => void
    }
  }) => {
    const { title, description, variant = 'default', action } = options
    
    const message = title || description || ''
    
    if (variant === 'destructive') {
      sonnerToast.error(message, {
        description: title ? description : undefined,
        action: action ? {
          label: action.label,
          onClick: action.onClick
        } : undefined
      })
    } else if (variant === 'success') {
      sonnerToast.success(message, {
        description: title ? description : undefined,
        action: action ? {
          label: action.label,
          onClick: action.onClick
        } : undefined
      })
    } else {
      sonnerToast(message, {
        description: title ? description : undefined,
        action: action ? {
          label: action.label,
          onClick: action.onClick
        } : undefined
      })
    }
  }

  // Add convenience methods for compatibility
  toastFn.error = (title: string, description?: string) => {
    sonnerToast.error(title, { description })
  }
  
  toastFn.success = (title: string, description?: string) => {
    sonnerToast.success(title, { description })
  }
  
  toastFn.info = (title: string, description?: string) => {
    sonnerToast.info(title, { description })
  }

  return {
    toast: toastFn,
    dismiss: sonnerToast.dismiss
  }
}

// Export a standalone toast function for direct use
export const toast = Object.assign(
  (options: {
    title?: string
    description?: string
    variant?: 'default' | 'destructive' | 'success'
    action?: {
      label: string
      onClick: () => void
    }
  }) => {
    const { title, description, variant = 'default', action } = options
    
    const message = title || description || ''
    
    if (variant === 'destructive') {
      sonnerToast.error(message, {
        description: title ? description : undefined,
        action: action ? {
          label: action.label,
          onClick: action.onClick
        } : undefined
      })
    } else if (variant === 'success') {
      sonnerToast.success(message, {
        description: title ? description : undefined,
        action: action ? {
          label: action.label,
          onClick: action.onClick
        } : undefined
      })
    } else {
      sonnerToast(message, {
        description: title ? description : undefined,
        action: action ? {
          label: action.label,
          onClick: action.onClick
        } : undefined
      })
    }
  },
  {
    error: (title: string, description?: string) => {
      sonnerToast.error(title, { description })
    },
    success: (title: string, description?: string) => {
      sonnerToast.success(title, { description })
    },
    info: (title: string, description?: string) => {
      sonnerToast.info(title, { description })
    },
    dismiss: sonnerToast.dismiss
  }
)