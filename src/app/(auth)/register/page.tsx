import { Suspense } from 'react'
import Link from 'next/link'
import { RegisterForm } from '@/components/features/auth/register/register-form'
import { Scissors } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Link href="/" className="flex items-center gap-2 font-medium mb-4">
        <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-md">
          <Scissors className="h-6 w-6" />
        </div>
        <span className="text-2xl font-bold">FigDream</span>
      </Link>
      <Suspense fallback={
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  )
}