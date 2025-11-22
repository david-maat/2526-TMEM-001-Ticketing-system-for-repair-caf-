'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface CreateVoorwerpInput {
  volgnummer: string
  klantId: number
  voorwerpStatusId?: number
  afdelingId: number
  voorwerpBeschrijving: string
  klachtBeschrijving?: string
}

export async function createVoorwerp(data: CreateVoorwerpInput) {
  try {
    const now = new Date()
    const voorwerp = await prisma.voorwerp.create({
      data: {
        volgnummer: data.volgnummer,
        klantId: data.klantId,
        aanmeldingsDatum: now,
        aanmeldingsTijd: now,
        voorwerpStatusId: data.voorwerpStatusId || 1, // Default to "Geregistreerd"
        afdelingId: data.afdelingId,
        voorwerpBeschrijving: data.voorwerpBeschrijving,
        klachtBeschrijving: data.klachtBeschrijving,
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
  volgnummer: string
  voorwerpStatusId: number
}

export async function updateVoorwerpStatus(data: UpdateVoorwerpStatusInput) {
  try {
    const voorwerp = await prisma.voorwerp.update({
      where: { volgnummer: data.volgnummer },
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

    // Generate unique 4-character tracking number (0-9 and A-Z)
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let volgnummer = ''
    let isUnique = false

    // Keep generating until we find a unique number
    while (!isUnique) {
      volgnummer = ''
      for (let i = 0; i < 4; i++) {
        volgnummer += characters.charAt(Math.floor(Math.random() * characters.length))
      }

      // Check if this number already exists
      const existing = await prisma.voorwerp.findUnique({
        where: { volgnummer }
      })

      if (!existing) {
        isUnique = true
      }
    }

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

    // Find active cafedag (current date is between start and end)
    const now = new Date()
    const activeCafedag = await prisma.cafedag.findFirst({
      where: {
        startDatum: { lte: now },
        eindDatum: { gte: now },
      },
    })

    if (!activeCafedag) {
      return { 
        success: false, 
        error: 'Er is geen actieve cafedag. Voorwerpen kunnen alleen geregistreerd worden tijdens een actieve cafedag.' 
      }
    }

    // Create the item
    const voorwerp = await prisma.voorwerp.create({
      data: {
        volgnummer,
        klantId: klant.klantId,
        aanmeldingsDatum: now,
        aanmeldingsTijd: now,
        voorwerpStatusId: geregistreerdStatus.voorwerpStatusId,
        afdelingId: afdelingId,
        voorwerpBeschrijving: data.itemDescription,
        klachtBeschrijving: data.problemDescription,
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

    // Link voorwerp to active cafedag
    await prisma.cafedagvoorwerp.create({
      data: {
        cafedagId: activeCafedag.cafedagId,
        voorwerpId: voorwerp.voorwerpId,
      },
    })

    // Broadcast update to all connected clients via WebSocket
    try {
      const { broadcastVoorwerpenUpdate } = await import('@/lib/broadcast')
      await broadcastVoorwerpenUpdate()
    } catch (error) {
      console.error('Error broadcasting update:', error)
    }

    // Send print job to connected printer
    try {
      const { sendPrintJob } = await import('@/lib/printer-broadcast')
      const printResult = await sendPrintJob({
        voorwerpId: voorwerp.voorwerpId,
        volgnummer: voorwerp.volgnummer,
        klantNaam: voorwerp.klant.klantnaam,
        klantTelefoon: voorwerp.klant.telNummer,
        afdelingNaam: voorwerp.afdeling.naam,
      })

      if (printResult.success) {
        console.log('Print job created successfully')
      } else {
        console.warn('Failed to create print job:', printResult.error)
      }
    } catch (error) {
      console.error('Error creating print job:', error)
      // Don't fail the registration if print fails
    }

    revalidatePath('/counter')
    revalidatePath('/admin/voorwerpen')

    return { success: true, voorwerp, trackingNumber: volgnummer }
  } catch (error) {
    console.error('Error registering item:', error)
    return { success: false, error: 'Er is een fout opgetreden bij het registreren' }
  }
}

export async function getVoorwerpForDelivery(volgnummer: string) {
  try {
    if (!volgnummer) {
      return { success: false, error: 'Volgnummer is verplicht' }
    }

    // Find the item
    const voorwerp = await prisma.voorwerp.findUnique({
      where: { volgnummer },
      include: {
        klant: true,
        voorwerpStatus: true,
        afdeling: true,
        gebruikteMaterialen: {
          include: {
            materiaal: true,
          },
        },
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

    return { success: true, voorwerp }
  } catch (error) {
    console.error('Error fetching item for delivery:', error)
    return { success: false, error: 'Er is een fout opgetreden bij het ophalen van het voorwerp' }
  }
}

export async function sendDeliveryPrintJob(volgnummer: string) {
  try {
    if (!volgnummer) {
      return { success: false, error: 'Volgnummer is verplicht' }
    }

    // Find the item
    const voorwerp = await prisma.voorwerp.findUnique({
      where: { volgnummer },
      include: {
        klant: true,
        voorwerpStatus: true,
        afdeling: true,
        gebruikteMaterialen: {
          include: {
            materiaal: true,
          },
        },
      },
    })

    if (!voorwerp) {
      return { success: false, error: 'Voorwerp niet gevonden' }
    }

    // Send print job for delivery receipt to connected printer with payment details
    try {
      const { sendPrintJob } = await import('@/lib/printer-broadcast')

      // Calculate payment details
      const materials = voorwerp.gebruikteMaterialen.map(gm => ({
        naam: gm.materiaal.naam,
        aantal: gm.aantal,
        prijs: gm.aantal, // Price equals amount in this system
      }))

      const subtotal = materials.reduce((sum, m) => sum + m.prijs, 0)

      const printResult = await sendPrintJob({
        voorwerpId: voorwerp.voorwerpId,
        volgnummer: voorwerp.volgnummer,
        klantNaam: voorwerp.klant.klantnaam,
        klantTelefoon: voorwerp.klant.telNummer,
        afdelingNaam: voorwerp.afdeling.naam,
        printData: {
          type: 'delivery',
          voorwerpBeschrijving: voorwerp.voorwerpBeschrijving,
          klachtBeschrijving: voorwerp.klachtBeschrijving,
          advies: voorwerp.advies,
          materials,
          subtotal,
          totalPrice: subtotal,
        },
      })

      if (printResult.success) {
        console.log('Delivery receipt print job created successfully')
      } else {
        console.warn('Failed to create delivery receipt print job:', printResult.error)
      }
    } catch (error) {
      console.error('Error creating delivery receipt print job:', error)
      return { success: false, error: 'Er is een fout opgetreden bij het versturen van de printopdracht' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending delivery print job:', error)
    return { success: false, error: 'Er is een fout opgetreden bij het versturen van de printopdracht' }
  }
}

export async function confirmDelivery(volgnummer: string) {
  try {
    if (!volgnummer) {
      return { success: false, error: 'Volgnummer is verplicht' }
    }

    // Find the "Afgeleverd" status
    const afgeleverdStatus = await prisma.voorwerpStatus.findFirst({
      where: { naam: 'Afgeleverd' },
    })

    if (!afgeleverdStatus) {
      return { success: false, error: 'Status "Afgeleverd" niet gevonden in database' }
    }

    // Update status to "Afgeleverd" (delivered)
    const updatedVoorwerp = await prisma.voorwerp.update({
      where: { volgnummer },
      data: {
        voorwerpStatusId: afgeleverdStatus.voorwerpStatusId,
        klaarDuur: new Date(),
      },
      include: {
        klant: true,
        voorwerpStatus: true,
        afdeling: true,
        gebruikteMaterialen: {
          include: {
            materiaal: true,
          },
        },
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
    console.error('Error confirming delivery:', error)
    return { success: false, error: 'Er is een fout opgetreden bij het bevestigen van de levering' }
  }
}

export async function updateVoorwerp(volgnummer: string, data: any) {
  try {
    const voorwerp = await prisma.voorwerp.update({
      where: { volgnummer },
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

interface CompleteVoorwerpWithAdviceInput {
  volgnummer: string
  advies: string
  reparatieStatus: string
}

export async function completeVoorwerpWithAdvice(data: CompleteVoorwerpWithAdviceInput) {
  try {
    // Validate input
    if (!data.advies || !data.reparatieStatus) {
      return { success: false, error: 'Advies en reparatiestatus zijn verplicht' }
    }

    // Get the voorwerp first to retrieve voorwerpId
    const voorwerp = await prisma.voorwerp.findUnique({
      where: { volgnummer: data.volgnummer },
    })

    if (!voorwerp) {
      return { success: false, error: 'Voorwerp niet gevonden' }
    }

    // Get "Klaar" status
    const klaarStatus = await prisma.voorwerpStatus.findFirst({
      where: { naam: 'Klaar' },
    })

    if (!klaarStatus) {
      return { success: false, error: 'Status "Klaar" niet gevonden in database' }
    }

    // Update voorwerp with advice and status in a transaction
    const updatedVoorwerp = await prisma.$transaction(async (tx) => {
      // Update voorwerp with advice and set status to "Klaar"
      const updated = await tx.voorwerp.update({
        where: { volgnummer: data.volgnummer },
        data: {
          advies: data.advies,
          voorwerpStatusId: klaarStatus.voorwerpStatusId,
          klaarDuur: new Date(),
        },
        include: {
          klant: true,
          voorwerpStatus: true,
          afdeling: true,
        },
      })

      // Create or update repair status record
      await tx.reparatieStatus.upsert({
        where: { voorwerpId: voorwerp.voorwerpId },
        update: {
          status: data.reparatieStatus,
        },
        create: {
          voorwerpId: voorwerp.voorwerpId,
          status: data.reparatieStatus,
        },
      })

      return updated
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

    return { success: true, voorwerp: updatedVoorwerp }
  } catch (error) {
    console.error('Error completing voorwerp with advice:', error)
    return { success: false, error: 'Er is een fout opgetreden bij het voltooien' }
  }
}

// Delete a voorwerp
export async function deleteVoorwerp(volgnummer: string) {
  try {
    // First, find the voorwerp to get its ID
    const voorwerp = await prisma.voorwerp.findUnique({
      where: { volgnummer },
      select: { voorwerpId: true }
    })

    if (!voorwerp) {
      return { success: false, error: 'Voorwerp not found' }
    }

    // Delete related records first to avoid foreign key constraint violations
    // Delete in transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete related Cafedagvoorwerp records
      await tx.cafedagvoorwerp.deleteMany({
        where: { voorwerpId: voorwerp.voorwerpId }
      })

      // Delete related GebruikteMateriaal records
      await tx.gebruikteMateriaal.deleteMany({
        where: { voorwerpId: voorwerp.voorwerpId }
      })

      // Delete related ReparatieStatus if exists
      await tx.reparatieStatus.deleteMany({
        where: { voorwerpId: voorwerp.voorwerpId }
      })

      // Delete related PrintJob records
      await tx.printJob.deleteMany({
        where: { voorwerpId: voorwerp.voorwerpId }
      })

      // Finally, delete the voorwerp itself
      await tx.voorwerp.delete({
        where: { volgnummer }
      })
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

    return { success: true }
  } catch (error) {
    console.error('Error deleting voorwerp:', error)
    return { success: false, error: 'Failed to delete voorwerp' }
  }
}
