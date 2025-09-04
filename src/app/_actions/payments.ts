'use server'

import { 
  createPaymentRecord as createPaymentRecordDb,
  getCustomerPaymentHistory as getCustomerPaymentHistoryDb
} from '@/lib/data-access/payments/payment-records'
import { requireAuth, requireAnyRole } from '@/lib/data-access/auth/dal-security'

export async function createPaymentRecord(data: Parameters<typeof createPaymentRecordDb>[0]) {
  // CRITICAL: Use secure DAL auth pattern for CVE-2025-29927
  await requireAnyRole(['super_admin', 'salon_owner', 'location_manager', 'staff'])
  return createPaymentRecordDb(data)
}

export async function getCustomerPaymentHistory(
  customerId: string, 
  options?: Parameters<typeof getCustomerPaymentHistoryDb>[1]
) {
  // CRITICAL: Use secure DAL auth pattern for CVE-2025-29927
  const context = await requireAuth()
  
  // Customers can only view their own payment history
  if (context.role === 'customer' && context.profile.id !== customerId) {
    throw new Error('Access denied: Cannot view other customer payment history')
  }
  
  return getCustomerPaymentHistoryDb(customerId, options)
}