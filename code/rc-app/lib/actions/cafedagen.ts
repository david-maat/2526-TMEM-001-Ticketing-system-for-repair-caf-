'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface CreateCafedagInput {
  cafeId: number
  startDatum: Date
  eindDatum: Date
}

// Create a new cafedag
export async function createCafedag(data: CreateCafedagInput) {
  try {
    const cafedag = await prisma.cafedag.create({
      data: {
        cafeId: data.cafeId,
        startDatum: data.startDatum,
        eindDatum: data.eindDatum,
      },
      include: {
        cafe: true,
      },
    })

    revalidatePath('/admin/cafedagen')
    return { success: true, cafedag }
  } catch (error) {
    console.error('Error creating cafedag:', error)
    return { success: false, error: 'Failed to create cafedag' }
  }
}

// Update an existing cafedag
export async function updateCafedag(
  cafedagId: number,
  data: Partial<CreateCafedagInput>
) {
  try {
    const cafedag = await prisma.cafedag.update({
      where: { cafedagId },
      data: {
        ...(data.cafeId && { cafeId: data.cafeId }),
        ...(data.startDatum && { startDatum: data.startDatum }),
        ...(data.eindDatum && { eindDatum: data.eindDatum }),
      },
      include: {
        cafe: true,
      },
    })

    revalidatePath('/admin/cafedagen')
    return { success: true, cafedag }
  } catch (error) {
    console.error('Error updating cafedag:', error)
    return { success: false, error: 'Failed to update cafedag' }
  }
}

// Delete a cafedag
export async function deleteCafedag(cafedagId: number) {
  try {
    await prisma.cafedag.delete({
      where: { cafedagId },
    })

    revalidatePath('/admin/cafedagen')
    return { success: true }
  } catch (error) {
    console.error('Error deleting cafedag:', error)
    return { success: false, error: 'Failed to delete cafedag' }
  }
}

// Create a new cafe
export async function createCafe(
  naam: string,
  locatie: string,
  cafePatroon: string
) {
  try {
    const cafe = await prisma.cafe.create({
      data: {
        naam,
        locatie,
        cafePatroon,
      },
    })

    revalidatePath('/admin/cafedagen')
    return { success: true, cafe }
  } catch (error) {
    console.error('Error creating cafe:', error)
    return { success: false, error: 'Failed to create cafe' }
  }
}

// Update an existing cafe
export async function updateCafe(
  cafeId: number,
  naam: string,
  locatie: string,
  cafePatroon: string
) {
  try {
    const cafe = await prisma.cafe.update({
      where: { cafeId },
      data: {
        naam,
        locatie,
        cafePatroon,
      },
    })

    revalidatePath('/admin/cafedagen')
    return { success: true, cafe }
  } catch (error) {
    console.error('Error updating cafe:', error)
    return { success: false, error: 'Failed to update cafe' }
  }
}

// Delete a cafe
export async function deleteCafe(cafeId: number) {
  try {
    await prisma.cafe.delete({
      where: { cafeId },
    })

    revalidatePath('/admin/cafedagen')
    return { success: true }
  } catch (error) {
    console.error('Error deleting cafe:', error)
    return { success: false, error: 'Failed to delete cafe' }
  }
}
