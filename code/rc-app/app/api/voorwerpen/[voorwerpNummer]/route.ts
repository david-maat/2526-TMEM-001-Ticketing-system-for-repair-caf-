import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { broadcastVoorwerpenUpdate } from '@/lib/broadcast'

// GET /api/voorwerpen/[voorwerpNummer] - Find item by tracking number
export async function GET(
  request: Request,
  { params }: { params: Promise<{ voorwerpNummer: string }> }
) {
  try {
    const { voorwerpNummer } = await params

    const voorwerp = await prisma.voorwerp.findUnique({
      where: { voorwerpNummer },
      include: {
        klant: {
          include: {
            klantType: true,
          },
        },
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
      return NextResponse.json(
        { error: 'Voorwerp niet gevonden' },
        { status: 404 }
      )
    }

    return NextResponse.json(voorwerp)
  } catch (error) {
    console.error('Error fetching voorwerp:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

// PATCH /api/voorwerpen/[voorwerpNummer] - Update item status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ voorwerpNummer: string }> }
) {
  try {
    const { voorwerpNummer } = await params
    const body = await request.json()

    const voorwerp = await prisma.voorwerp.update({
      where: { voorwerpNummer },
      data: body,
      include: {
        klant: true,
        voorwerpStatus: true,
        afdeling: true,
      },
    })

    // Broadcast update to all connected clients via WebSocket
    await broadcastVoorwerpenUpdate()

    return NextResponse.json(voorwerp)
  } catch (error) {
    console.error('Error updating voorwerp:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het bijwerken' },
      { status: 500 }
    )
  }
}
