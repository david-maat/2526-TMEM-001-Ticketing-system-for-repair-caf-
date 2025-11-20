'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface CreateVoorwerpInput {
  voorwerpNummer: string
  klantId: number
  voorwerpStatusId?: number
  afdelingId: number
  beschrijving: string
}

export async function createVoorwerp(data: CreateVoorwerpInput) {
  try {
    const voorwerp = await prisma.voorwerp.create({
      data: {
        voorwerpNummer: data.voorwerpNummer,
        klantId: data.klantId,
        aanmeldingsDuur: new Date(),
        voorwerpStatusId: data.voorwerpStatusId || 1, // Default to "Geregistreerd"
        afdelingId: data.afdelingId,
        beschrijving: data.beschrijving,
      },
      include: {
        klant: true,
        voorwerpStatus: true,
        afdeling: true,
      },
    })

    revalidatePath('/counter')
    revalidatePath('/admin/voorwerpen')
    
    return { success: true, voorwerp }
  } catch (error) {
    console.error('Error creating voorwerp:', error)
    return { success: false, error: 'Failed to create voorwerp' }
  }
}

interface UpdateVoorwerpStatusInput {
  voorwerpNummer: string
  voorwerpStatusId: number
}

export async function updateVoorwerpStatus(data: UpdateVoorwerpStatusInput) {
  try {
    const voorwerp = await prisma.voorwerp.update({
      where: { voorwerpNummer: data.voorwerpNummer },
      data: { voorwerpStatusId: data.voorwerpStatusId },
      include: {
        klant: true,
        voorwerpStatus: true,
        afdeling: true,
      },
    })

    // Broadcast update to all connected clients via WebSocket
    try {
      const { broadcastVoorwerpenUpdate } = await import('@/lib/broadcast')
      await broadcastVoorwerpenUpdate()
    } catch (error) {
      console.error('Error broadcasting update:', error)
    }

    revalidatePath('/student')
    revalidatePath('/counter')
    revalidatePath('/admin/voorwerpen')
    
    return { success: true, voorwerp }
  } catch (error) {
    console.error('Error updating voorwerp status:', error)
    return { success: false, error: 'Failed to update voorwerp status' }
  }
}

interface RegisterVoorwerpInput {
  customerName: string
  customerPhone?: string
  customerType: string
  problemDescription: string
  itemDescription: string
  departmentId?: string
}

export async function registerVoorwerp(data: RegisterVoorwerpInput) {
  try {
    // Validate required fields
    if (!data.customerName || !data.customerType || !data.problemDescription || !data.itemDescription) {
      return { success: false, error: 'Verplichte velden ontbreken' }
    }

    // Find or create customer
    let klant = await prisma.klant.findFirst({
      where: {
        klantnaam: data.customerName,
        telNummer: data.customerPhone || null,
      },
    })

    if (!klant) {
      // Find customer type
      const klantType = await prisma.klantType.findFirst({
        where: { naam: data.customerType },
      })

      if (!klantType) {
        return { success: false, error: 'Klanttype niet gevonden' }
      }

      // Create new customer
      klant = await prisma.klant.create({
        data: {
          klantnaam: data.customerName,
          telNummer: data.customerPhone || null,
          klantTypeId: klantType.klantTypeId,
        },
      })
    }

    // Generate unique tracking number
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    const voorwerpNummer = `RC-${timestamp}-${random}`

    // Get "Geregistreerd" status
    const geregistreerdStatus = await prisma.voorwerpStatus.findFirst({
      where: { naam: 'Geregistreerd' },
    })

    if (!geregistreerdStatus) {
      return { success: false, error: 'Status "Geregistreerd" niet gevonden in database' }
    }

    // Use provided department or default to first one
    let afdelingId = data.departmentId ? parseInt(data.departmentId) : null
    if (!afdelingId) {
      const defaultAfdeling = await prisma.afdeling.findFirst()
      afdelingId = defaultAfdeling?.afdelingId || 1
    }

    // Create the item
    const voorwerp = await prisma.voorwerp.create({
      data: {
        voorwerpNummer,
        klantId: klant.klantId,
        aanmeldingsDuur: new Date(),
        voorwerpStatusId: geregistreerdStatus.voorwerpStatusId,
        afdelingId: afdelingId,
        beschrijving: `${data.itemDescription}\n\nProbleem: ${data.problemDescription}`,
      },
      include: {
        klant: {
          include: {
            klantType: true,
          },
        },
        voorwerpStatus: true,
        afdeling: true,
      },
    })

    // Broadcast update to all connected clients via WebSocket
    try {
      const { broadcastVoorwerpenUpdate } = await import('@/lib/broadcast')
      await broadcastVoorwerpenUpdate()
    } catch (error) {
      console.error('Error broadcasting update:', error)
    }

    revalidatePath('/counter')
    revalidatePath('/admin/voorwerpen')

    return { success: true, voorwerp, trackingNumber: voorwerpNummer }
  } catch (error) {
    console.error('Error registering item:', error)
    return { success: false, error: 'Er is een fout opgetreden bij het registreren' }
  }
}

export async function deliverVoorwerp(voorwerpNummer: string) {
  try {
    if (!voorwerpNummer) {
      return { success: false, error: 'Volgnummer is verplicht' }
    }

    // Find the item
    const voorwerp = await prisma.voorwerp.findUnique({
      where: { voorwerpNummer },
      include: {
        klant: true,
        voorwerpStatus: true,
      },
    })

    if (!voorwerp) {
      return { success: false, error: 'Voorwerp niet gevonden' }
    }

    // Check if item is ready for delivery (status should be "Klaar")
    if (voorwerp.voorwerpStatus.naam !== 'Klaar') {
      return { 
        success: false, 
        error: `Voorwerp is nog niet klaar voor uitlevering. Status: ${voorwerp.voorwerpStatus.naam}` 
      }
    }

    // Update status to "Afgeleverd" (delivered)
    const afgeleverdStatus = await prisma.voorwerpStatus.findFirst({
      where: { naam: 'Afgeleverd' },
    })

    if (!afgeleverdStatus) {
      return { success: false, error: 'Status "Afgeleverd" niet gevonden in database' }
    }

    const updatedVoorwerp = await prisma.voorwerp.update({
      where: { voorwerpNummer },
      data: {
        voorwerpStatusId: afgeleverdStatus.voorwerpStatusId,
        klaarDuur: new Date(),
      },
      include: {
        klant: true,
        voorwerpStatus: true,
        afdeling: true,
      },
    })

    // Broadcast update to all connected clients via WebSocket
    try {
      const { broadcastVoorwerpenUpdate } = await import('@/lib/broadcast')
      await broadcastVoorwerpenUpdate()
    } catch (error) {
      console.error('Error broadcasting update:', error)
    }

    revalidatePath('/counter')
    revalidatePath('/admin/voorwerpen')

    return { success: true, voorwerp: updatedVoorwerp }
  } catch (error) {
    console.error('Error delivering item:', error)
    return { success: false, error: 'Er is een fout opgetreden bij het uitleveren' }
  }
}

export async function updateVoorwerp(voorwerpNummer: string, data: any) {
  try {
    const voorwerp = await prisma.voorwerp.update({
      where: { voorwerpNummer },
      data: data,
      include: {
        klant: true,
        voorwerpStatus: true,
        afdeling: true,
      },
    })

    // Broadcast update to all connected clients via WebSocket
    try {
      const { broadcastVoorwerpenUpdate } = await import('@/lib/broadcast')
      await broadcastVoorwerpenUpdate()
    } catch (error) {
      console.error('Error broadcasting update:', error)
    }

    revalidatePath('/student')
    revalidatePath('/counter')
    revalidatePath('/admin/voorwerpen')

    return { success: true, voorwerp }
  } catch (error) {
    console.error('Error updating voorwerp:', error)
    return { success: false, error: 'Er is een fout opgetreden bij het bijwerken' }
  }
}
