'use client'

import { Skeleton } from '@/components/ui/skeleton'
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
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
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  )
}