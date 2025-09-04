'use client'

import { ErrorGeneric } from '@/components/shared/ui-components/error-page'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorGeneric error={error} reset={reset} />
}