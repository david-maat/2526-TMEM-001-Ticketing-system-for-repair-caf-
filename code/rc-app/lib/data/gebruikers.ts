import prisma from '@/lib/prisma'
import { cache } from 'react'

// GET all gebruikers - cached for request deduplication
export const getGebruikers = cache(async () => {
  try {
    const gebruikers = await prisma.gebruiker.findMany({
      include: {
        gebruikerType: true,
      },
    })
    return gebruikers
  } catch (error) {
    console.error('Error fetching gebruikers:', error)
    throw new Error('Failed to fetch gebruikers')
  }
})
