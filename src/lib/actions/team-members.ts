'use server'

import { revalidatePath } from 'next/cache'
import { 
  createTeamMember as createTeamMemberDAL,
  updateTeamMember as updateTeamMemberDAL,
  deleteTeamMember as deleteTeamMemberDAL
} from '@/lib/api/dal/team-members'
import { Database } from '@/types/database.types'

type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert']
type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update']

export async function createTeamMemberAction(member: TeamMemberInsert) {
  try {
    const result = await createTeamMemberDAL(member)
    revalidatePath('/admin/team')
    revalidatePath('/about') // Revalidate public about page
    return { success: true, data: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create team member' 
    }
  }
}

export async function updateTeamMemberAction(id: string, updates: TeamMemberUpdate) {
  try {
    const result = await updateTeamMemberDAL(id, updates)
    revalidatePath('/admin/team')
    revalidatePath('/about')
    return { success: true, data: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update team member' 
    }
  }
}

export async function deleteTeamMemberAction(id: string) {
  try {
    await deleteTeamMemberDAL(id)
    revalidatePath('/admin/team')
    revalidatePath('/about')
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete team member' 
    }
  }
}