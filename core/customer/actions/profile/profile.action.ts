'use server'

import { updateCustomerProfile } from '../dal/mutations'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  preferences: z.record(z.any()).optional()
})

export async function updateProfileAction(customerId: string, formData: FormData) {
  try {
    const data = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      phone: formData.get('phone') as string || null,
    }

    const validatedData = profileSchema.parse(data)

    const result = await updateCustomerProfile(customerId, validatedData)

    if (result.success) {
      revalidatePath('/customer/profile')
      return { success: true }
    }

    return { success: false, error: result.error }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}