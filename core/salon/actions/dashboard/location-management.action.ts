'use server';

import { revalidatePath } from 'next/cache';
import {
  createLocation,
  updateLocation,
  deleteLocation,
  type CreateLocationInput,
  type UpdateLocationInput
} from '../dal/locations-mutations';

export async function createLocationAction(data: CreateLocationInput) {
  try {
    const location = await createLocation(data);
    revalidatePath('/dashboard/locations');
    return { success: true, data: location };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create location'
    };
  }
}

export async function updateLocationAction(id: string, data: UpdateLocationInput) {
  try {
    const location = await updateLocation(id, data);
    revalidatePath('/dashboard/locations');
    revalidatePath(`/dashboard/locations/${id}`);
    return { success: true, data: location };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update location'
    };
  }
}

export async function deleteLocationAction(id: string) {
  try {
    await deleteLocation(id);
    revalidatePath('/dashboard/locations');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete location'
    };
  }
}