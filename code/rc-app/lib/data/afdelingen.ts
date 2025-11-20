import prisma from '@/lib/prisma'
import { cache } from 'react'

// GET all afdelingen - cached for request deduplication
export const getAfdelingen = cache(async () => {
  try {
    const afdelingen = await prisma.afdeling.findMany({
      orderBy: {
        naam: 'asc',
      },
    })
    return afdelingen
  } catch (error) {
    console.error('Error fetching afdelingen:', error)
    throw new Error('Er is een fout opgetreden')
  }
})
