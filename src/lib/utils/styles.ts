import { cn } from '@/lib/utils'

// Common flex patterns
export const flexCenter = 'flex items-center justify-center'
export const flexBetween = 'flex items-center justify-between'
export const flexStart = 'flex items-start'
export const flexEnd = 'flex items-end justify-end'
export const flexCol = 'flex flex-col'
export const flexColCenter = 'flex flex-col items-center justify-center'

// Common spacing patterns
export const sectionPadding = 'py-16 md:py-20'
export const containerPadding = 'px-4 sm:px-6 lg:px-8'

// Common text styles
export const headingBase = 'font-bold tracking-tight'
export const heading1 = cn(headingBase, 'text-4xl md:text-5xl lg:text-6xl')
export const heading2 = cn(headingBase, 'text-3xl md:text-4xl')
export const heading3 = cn(headingBase, 'text-2xl md:text-3xl')
export const heading4 = cn(headingBase, 'text-xl md:text-2xl')

// Common transitions
export const transitionBase = 'transition-all duration-300'
export const transitionFast = 'transition-all duration-150'
export const transitionSlow = 'transition-all duration-500'

// Common hover states
export const hoverScale = 'hover:scale-105'
export const hoverShadow = 'hover:shadow-lg'
export const hoverBorder = 'hover:border-primary'

// Combine commonly used patterns
export const cardHover = cn(transitionBase, hoverScale, hoverShadow)
export const buttonHover = cn(transitionBase, 'hover:opacity-90')
export const linkHover = cn(transitionFast, 'hover:text-primary')