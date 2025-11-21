'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getAfdelingen } from '@/lib/data/afdelingen'

// Wrapper function to allow client components to fetch afdelingen
export async function getAfdelingenForClient() {
  return await getAfdelingen()
}

// Create a new afdeling
export async function createAfdeling(naam: string) {
  try {
    const afdeling = await prisma.afdeling.create({
      data: { naam },
    })

    revalidatePath('/admin/afdelingen')
    return { success: true, afdeling }
  } catch (error) {
    console.error('Error creating afdeling:', error)
    return { success: false, error: 'Failed to create afdeling' }
  }
}

// Update an existing afdeling
export async function updateAfdeling(afdelingId: number, naam: string) {
  try {
    const afdeling = await prisma.afdeling.update({
      where: { afdelingId },
      data: { naam },
    })

    revalidatePath('/admin/afdelingen')
    return { success: true, afdeling }
  } catch (error) {
    console.error('Error updating afdeling:', error)
    return { success: false, error: 'Failed to update afdeling' }
  }
}

// Delete an afdeling
export async function deleteAfdeling(afdelingId: number) {
  try {
    await prisma.afdeling.delete({
      where: { afdelingId },
    })

    revalidatePath('/admin/afdelingen')
    return { success: true }
  } catch (error) {
    console.error('Error deleting afdeling:', error)
    return { success: false, error: 'Failed to delete afdeling' }
  }
}
