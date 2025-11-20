import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      customerName,
      customerPhone,
      customerType,
      problemDescription,
      itemDescription,
      departmentId,
    } = body

    // Validate required fields
    if (!customerName || !customerType || !problemDescription || !itemDescription) {
      return NextResponse.json(
        { error: 'Verplichte velden ontbreken' },
        { status: 400 }
      )
    }

    // Find or create customer
    let klant = await prisma.klant.findFirst({
      where: {
        klantnaam: customerName,
        telNummer: customerPhone || null,
      },
    })

    if (!klant) {
      // Find customer type
      const klantType = await prisma.klantType.findFirst({
        where: { naam: customerType },
      })

      if (!klantType) {
        return NextResponse.json(
          { error: 'Klanttype niet gevonden' },
          { status: 400 }
        )
      }

      // Create new customer
      klant = await prisma.klant.create({
        data: {
          klantnaam: customerName,
          telNummer: customerPhone || null,
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
      return NextResponse.json(
        { error: 'Status "Geregistreerd" niet gevonden in database' },
        { status: 500 }
      )
    }

    // Use provided department or default to first one
    let afdelingId = departmentId ? parseInt(departmentId) : null
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
        beschrijving: `${itemDescription}\n\nProbleem: ${problemDescription}`,
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

    return NextResponse.json({
      success: true,
      voorwerp,
      trackingNumber: voorwerpNummer,
    }, { status: 201 })
  } catch (error) {
    console.error('Error registering item:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het registreren' },
      { status: 500 }
    )
  }
}
