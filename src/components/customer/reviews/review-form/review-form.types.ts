import { Database } from '@/types/database.types'
import { CreateReviewInput } from '@/lib/validations/review-schema'

export interface ReviewFormProps {
  bookingId?: string
  salonId: string
  locationId?: string
  serviceId?: string
  staffId?: string
  onSuccess?: (review: Database['public']['Tables']['reviews']['Row']) => void
  onCancel?: () => void
  className?: string
  disabled?: boolean
  defaultValues?: Partial<CreateReviewInput>
  trigger?: React.ReactNode
}

export interface PhotoUpload {
  file?: File
  url: string
  caption: string
}

export interface StarRatingProps {
  value: number
  onChange: (rating: number) => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  allowHalf?: boolean
  disabled?: boolean
}

export interface RatingCategory {
  key: string
  label: string
  description: string
}