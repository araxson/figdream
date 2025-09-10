'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Scissors, Sparkles } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useEffect, useState } from 'react'

export default function Loading() {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Loading')
  
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90
        return prev + 10
      })
    }, 200)
    
    const loadingMessages = [
      'Loading your experience',
      'Preparing your dashboard',
      'Getting things ready',
      'Almost there',
      'Setting up your workspace'
    ]
    
    const textInterval = setInterval(() => {
      setLoadingText(loadingMessages[Math.floor(Math.random() * loadingMessages.length)])
    }, 2000)
    
    return () => {
      clearInterval(progressInterval)
      clearInterval(textInterval)
    }
  }, [])
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-md w-full space-y-8 animate-in fade-in duration-500">
        {/* Logo Animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
            <div className="relative bg-background/80 backdrop-blur-sm p-6 rounded-2xl border shadow-lg">
              <Scissors className="h-16 w-16 text-primary animate-pulse" />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary/60 animate-ping" />
              <Sparkles className="absolute -bottom-1 -left-1 h-4 w-4 text-primary/40 animate-ping animation-delay-200" />
            </div>
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center space-y-3">
          <h2 className="text-xl font-semibold text-foreground animate-pulse">
            {loadingText}
          </h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare everything for you
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            {progress}% complete
          </p>
        </div>
        
        {/* Skeleton Preview */}
        <div className="space-y-3 opacity-50">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  )
}