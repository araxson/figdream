import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="mb-2 text-4xl font-bold">401</h1>
        <h2 className="mb-2 text-2xl font-semibold">Authentication Required</h2>
        <p className="mb-6 text-muted-foreground">
          Please sign in to access this page.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/register">Sign up</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}