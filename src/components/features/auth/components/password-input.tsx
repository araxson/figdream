'use client'

import { forwardRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, placeholder = "••••••••", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className={cn("relative")}>
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          className={cn("pr-10", className)}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent")}
          onClick={() => setShowPassword(!showPassword)}
          disabled={props.disabled}
        >
          {showPassword ? (
            <EyeOff className={cn("h-4 w-4")} />
          ) : (
            <Eye className={cn("h-4 w-4")} />
          )}
        </Button>
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'