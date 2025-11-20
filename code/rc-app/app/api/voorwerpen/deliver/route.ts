import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { voorwerpNummer } = body

    if (!voorwerpNummer) {
      return NextResponse.json(
        { error: 'Volgnummer is verplicht' },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: 'Voorwerp niet gevonden' },
        { status: 404 }
      )
    }

    // Check if item is ready for delivery (status should be "Klaar")
    if (voorwerp.voorwerpStatus.naam !== 'Klaar') {
      return NextResponse.json(
        { error: `Voorwerp is nog niet klaar voor uitlevering. Status: ${voorwerp.voorwerpStatus.naam}` },
        { status: 400 }
      )
    }

    // Update status to "Afgeleverd" (delivered)
    const afgeleverdStatus = await prisma.voorwerpStatus.findFirst({
      where: { naam: 'Afgeleverd' },
    })

    if (!afgeleverdStatus) {
      return NextResponse.json(
        { error: 'Status "Afgeleverd" niet gevonden in database' },
        { status: 500 }
      )
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

    return NextResponse.json({
      success: true,
      voorwerp: updatedVoorwerp,
    })
  } catch (error) {
    console.error('Error delivering item:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het uitleveren' },
      { status: 500 }
    )
  }
}
