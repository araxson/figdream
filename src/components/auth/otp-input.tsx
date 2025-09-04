'use client'

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  length?: number
  value?: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  className?: string
  autoFocus?: boolean
}

export function OTPInput({ 
  length = 6, 
  value = '',
  onChange,
  onComplete,
  disabled = false,
  className,
  autoFocus = true
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(value ? value.split('') : Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (value) {
      const newOtp = value.split('').slice(0, length)
      while (newOtp.length < length) {
        newOtp.push('')
      }
      setOtp(newOtp)
    }
  }, [value, length])

  const handleChange = (index: number, val: string) => {
    if (disabled) return
    
    const newVal = val.replace(/[^0-9]/g, '')
    
    if (newVal.length <= 1) {
      const newOtp = [...otp]
      newOtp[index] = newVal
      setOtp(newOtp)
      
      const otpString = newOtp.join('')
      onChange(otpString)
      
      // Move to next input
      if (newVal && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
      
      // Check if complete
      if (otpString.length === length && onComplete) {
        onComplete(otpString)
      }
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (disabled) return
    
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length)
    const newOtp = pasteData.split('')
    
    while (newOtp.length < length) {
      newOtp.push('')
    }
    
    setOtp(newOtp)
    const otpString = newOtp.join('')
    onChange(otpString)
    
    // Focus last filled input or last input
    const lastFilledIndex = newOtp.findLastIndex(val => val !== '')
    const focusIndex = lastFilledIndex < length - 1 ? lastFilledIndex + 1 : length - 1
    inputRefs.current[focusIndex]?.focus()
    
    if (otpString.length === length && onComplete) {
      onComplete(otpString)
    }
  }

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(ref) => { inputRefs.current[index] = ref }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={otp[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          className={cn(
            'w-12 h-12 text-center text-lg font-medium border rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200',
            otp[index] ? 'border-primary' : 'border-gray-300'
          )}
        />
      ))}
    </div>
  )
}