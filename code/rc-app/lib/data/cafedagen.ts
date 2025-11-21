import prisma from '@/lib/prisma'
import { cache } from 'react'

// GET all cafedagen with their cafe info
export const getCafedagen = cache(async () => {
  try {
    const cafedagen = await prisma.cafedag.findMany({
      include: {
        cafe: true,
      },
      orderBy: {
        startDatum: 'desc',
      },
    })
    return cafedagen
  } catch (error) {
    console.error('Error fetching cafedagen:', error)
    throw new Error('Failed to fetch cafedagen')
  }
})

// GET all cafes
export const getCafes = cache(async () => {
  try {
    const cafes = await prisma.cafe.findMany({
      orderBy: {
        naam: 'asc',
      },
    })
    return cafes
  } catch (error) {
    console.error('Error fetching cafes:', error)
    throw new Error('Failed to fetch cafes')
  }
})
