import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldX } from 'lucide-react'

export default function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <ShieldX className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h1 className="mb-2 text-4xl font-bold">403</h1>
        <h2 className="mb-2 text-2xl font-semibold">Access Forbidden</h2>
        <p className="mb-6 text-muted-foreground">
          You don&apos;t have permission to access this resource.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}