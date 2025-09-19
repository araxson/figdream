'use server';

import { revalidatePath } from 'next/cache';
import {
  createSalonChain,
  updateSalonChain,
  deleteSalonChain,
  type CreateSalonChainInput,
  type UpdateSalonChainInput
} from '../dal/salon-chains-mutations';

export async function createSalonChainAction(data: CreateSalonChainInput) {
  try {
    const chain = await createSalonChain(data);
    revalidatePath('/dashboard/chains');
    return { success: true, data: chain };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create salon chain'
    };
  }
}

export async function updateSalonChainAction(id: string, data: UpdateSalonChainInput) {
  try {
    const chain = await updateSalonChain(id, data);
    revalidatePath('/dashboard/chains');
    revalidatePath(`/dashboard/chains/${id}`);
    return { success: true, data: chain };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update salon chain'
    };
  }
}

export async function deleteSalonChainAction(id: string) {
  try {
    await deleteSalonChain(id);
    revalidatePath('/dashboard/chains');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete salon chain'
    };
  }
}