import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/voorwerpen - Fetch all items
export async function GET() {
  try {
    const voorwerpen = await prisma.voorwerp.findMany({
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
      orderBy: {
        aanmeldingsDuur: 'desc',
      },
    })
    return NextResponse.json(voorwerpen)
  } catch (error) {
    console.error('Error fetching voorwerpen:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voorwerpen' },
      { status: 500 }
    )
  }
}

// POST /api/voorwerpen - Create a new item
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      voorwerpNummer,
      klantId,
      voorwerpStatusId,
      afdelingId,
      beschrijving,
    } = body

    const voorwerp = await prisma.voorwerp.create({
      data: {
        voorwerpNummer,
        klantId,
        aanmeldingsDuur: new Date(),
        voorwerpStatusId: voorwerpStatusId || 1, // Default to "Geregistreerd"
        afdelingId,
        beschrijving,
      },
      include: {
        klant: true,
        voorwerpStatus: true,
        afdeling: true,
      },
    })

    return NextResponse.json(voorwerp, { status: 201 })
  } catch (error) {
    console.error('Error creating voorwerp:', error)
    return NextResponse.json(
      { error: 'Failed to create voorwerp' },
      { status: 500 }
    )
  }
}
