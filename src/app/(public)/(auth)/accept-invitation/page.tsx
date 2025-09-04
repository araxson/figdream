import { Suspense } from 'react'
import { AcceptInvitationForm } from '@/components/auth/accept-invitation-form'

function AcceptInvitationContent() {
  return <AcceptInvitationForm />
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AcceptInvitationContent />
    </Suspense>
  )
}