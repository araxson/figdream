export const getRatingLabel = (rating: number): string => {
  switch (rating) {
    case 1: return 'Poor'
    case 2: return 'Fair'
    case 3: return 'Good'
    case 4: return 'Very Good'
    case 5: return 'Excellent'
    default: return ''
  }
}

export const getRatingColor = (rating: number): string => {
  switch (rating) {
    case 1: return 'text-red-500'
    case 2: return 'text-orange-500'
    case 3: return 'text-yellow-500'
    case 4: return 'text-blue-500'
    case 5: return 'text-green-500'
    default: return 'text-gray-400'
  }
}

export const getStarSizeClass = (size: 'sm' | 'md' | 'lg' | 'xl'): string => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  }
  return sizeClasses[size]
}