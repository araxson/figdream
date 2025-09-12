import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/api/dal/auth'
import { Database } from '@/types/database.types'

export type FAQCategoryDTO = Database['public']['Tables']['faq_categories']['Row']
export type FAQQuestionDTO = Database['public']['Tables']['faq_questions']['Row'] & {
  category?: FAQCategoryDTO | null
}

export const getFAQCategories = cache(async (): Promise<FAQCategoryDTO[]> => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('faq_categories')
    .select('*')
    .order('display_order')
  
  if (error) {
    console.error('Error fetching FAQ categories:', error)
    return []
  }
  
  return data || []
})

export const getFAQQuestions = cache(async (): Promise<FAQQuestionDTO[]> => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('faq_questions')
    .select('*, category:faq_categories(*)')
    .order('display_order')
  
  if (error) {
    console.error('Error fetching FAQ questions:', error)
    return []
  }
  
  return data || []
})

export async function createFAQQuestion(
  data: Database['public']['Tables']['faq_questions']['Insert']
): Promise<boolean> {
  const session = await verifySession()
  if (!session) return false
  
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('faq_questions')
    .insert(data)
  
  if (error) {
    console.error('Error creating FAQ question:', error)
    return false
  }
  
  return true
}

export async function updateFAQQuestion(
  id: string,
  data: Database['public']['Tables']['faq_questions']['Update']
): Promise<boolean> {
  const session = await verifySession()
  if (!session) return false
  
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('faq_questions')
    .update(data)
    .eq('id', id)
  
  if (error) {
    console.error('Error updating FAQ question:', error)
    return false
  }
  
  return true
}

export async function deleteFAQQuestion(id: string): Promise<boolean> {
  const session = await verifySession()
  if (!session) return false
  
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('faq_questions')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting FAQ question:', error)
    return false
  }
  
  return true
}