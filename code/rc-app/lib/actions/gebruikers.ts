'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface CreateGebruikerInput {
  gebruikerNaam: string
  naam: string
  wachtwoord: string
  gebruikerTypeId: number
}

export async function createGebruiker(data: CreateGebruikerInput) {
  try {
    const gebruiker = await prisma.gebruiker.create({
      data: {
        gebruikerNaam: data.gebruikerNaam,
        naam: data.naam,
        wachtwoord: data.wachtwoord, // In production, hash this password!
        gebruikerTypeId: data.gebruikerTypeId,
      },
      include: {
        gebruikerType: true,
      },
    })

    revalidatePath('/admin/gebruikers')
    
    return { success: true, gebruiker }
  } catch (error) {
    console.error('Error creating gebruiker:', error)
    return { success: false, error: 'Failed to create gebruiker' }
  }
}
