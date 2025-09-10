import { toast as sonnerToast } from 'sonner'

export const useToast = () => {
  const toast = {
    success: (message: string, description?: string) => {
      sonnerToast.success(message, {
        description,
        duration: 4000,
      })
    },
    error: (message: string, description?: string) => {
      sonnerToast.error(message, {
        description,
        duration: 5000,
      })
    },
    info: (message: string, description?: string) => {
      sonnerToast.info(message, {
        description,
        duration: 4000,
      })
    },
    warning: (message: string, description?: string) => {
      sonnerToast.warning(message, {
        description,
        duration: 4000,
      })
    },
    loading: (message: string) => {
      return sonnerToast.loading(message)
    },
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: Error) => string)
      }
    ) => {
      return sonnerToast.promise(promise, messages)
    },
    dismiss: (toastId?: string | number) => {
      sonnerToast.dismiss(toastId)
    },
  }

  return toast
}

// Export a singleton instance for non-component usage
export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 4000,
    })
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 5000,
    })
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 4000,
    })
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 4000,
    })
  },
  loading: (message: string) => {
    return sonnerToast.loading(message)
  },
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    }
  ) => {
    return sonnerToast.promise(promise, messages)
  },
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId)
  },
}