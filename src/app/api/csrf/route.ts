import { NextResponse } from 'next/server'
import { getOrGenerateCSRFToken } from '@/lib/data-access/security/csrf'

export async function GET() {
  try {
    const token = await getOrGenerateCSRFToken()
    return NextResponse.json({ token })
  } catch (error) {
    console.error('Failed to generate CSRF token:', error)
    return NextResponse.json(
      { error: 'Failed to generate security token' },
      { status: 500 }
    )
  }
}