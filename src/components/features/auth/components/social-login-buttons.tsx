'use client'

import { Button } from '@/components/ui/button'
import { Chrome, Github } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SocialLoginButtonsProps {
  isLoading?: boolean
  onGoogleLogin?: () => void
  onGithubLogin?: () => void
}

export function SocialLoginButtons({ 
  isLoading = false,
  onGoogleLogin,
  onGithubLogin 
}: SocialLoginButtonsProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-4")}>
      <Button 
        variant="outline" 
        type="button" 
        disabled={isLoading}
        onClick={onGoogleLogin}
      >
        <Chrome className={cn("mr-2 h-4 w-4")} />
        Google
      </Button>
      <Button 
        variant="outline" 
        type="button" 
        disabled={isLoading}
        onClick={onGithubLogin}
      >
        <Github className={cn("mr-2 h-4 w-4")} />
        GitHub
      </Button>
    </div>
  )
}