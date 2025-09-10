import { Metadata } from 'next'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sparkles, Home } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Authentication - FigDream',
  description: 'Sign in or create an account to manage your salon',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={cn("relative min-h-screen flex flex-col")}>
      {/* Header */}
      <header className={cn("relative z-10 flex items-center justify-between p-6 lg:p-8")}>
        <Link href="/" className={cn("flex items-center gap-2 text-lg font-semibold")}>
          <Sparkles className={cn("h-6 w-6 text-primary")} />
          <span>FigDream</span>
        </Link>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <Home className={cn("h-4 w-4 mr-2")} />
            Back to Home
          </Link>
        </Button>
      </header>

      {/* Background with improved gradient */}
      <div className={cn("fixed inset-0 -z-10")}>
        <div className={cn(
          "absolute inset-0",
          "bg-gradient-to-br from-violet-50 via-white to-cyan-50",
          "dark:from-violet-950/20 dark:via-background dark:to-cyan-950/20"
        )} />
        
        {/* Mesh gradient overlay */}
        <div className={cn(
          "absolute inset-0",
          "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]",
          "from-primary/5 via-transparent to-transparent",
          "opacity-40"
        )} />
        
        {/* Grid pattern - subtle */}
        <div 
          className={cn(
            "absolute inset-0",
            "bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)]",
            "bg-[size:14px_24px]",
            "[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
          )}
          aria-hidden="true"
        />
      </div>
      
      {/* Floating orbs for visual interest */}
      <div className={cn("fixed inset-0 overflow-hidden pointer-events-none")} aria-hidden="true">
        <div className={cn(
          "absolute -top-1/2 -right-1/2 h-[500px] w-[500px]",
          "rounded-full bg-gradient-to-br from-violet-400/20 to-purple-400/20",
          "blur-3xl animate-pulse"
        )} />
        <div className={cn(
          "absolute -bottom-1/2 -left-1/2 h-[500px] w-[500px]",
          "rounded-full bg-gradient-to-tr from-cyan-400/20 to-blue-400/20",
          "blur-3xl animate-pulse animation-delay-2000"
        )} />
      </div>
      
      {/* Main content */}
      <main className={cn("relative flex-1 flex items-center justify-center p-4")}>
        <div className={cn("w-full max-w-md")}>
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className={cn("relative z-10 p-6 text-center")}>
        <p className={cn("text-sm text-muted-foreground")}>
          © 2024 FigDream. All rights reserved.
        </p>
      </footer>
    </div>
  )
}