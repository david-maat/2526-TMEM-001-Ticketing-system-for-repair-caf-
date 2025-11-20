import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/gebruikers - Fetch all users
export async function GET() {
  try {
    const gebruikers = await prisma.gebruiker.findMany({
      include: {
        gebruikerType: true,
      },
    })
    return NextResponse.json(gebruikers)
  } catch (error) {
    console.error('Error fetching gebruikers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gebruikers' },
      { status: 500 }
    )
  }
}

// POST /api/gebruikers - Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { gebruikerNaam, naam, wachtwoord, gebruikerTypeId } = body

    const gebruiker = await prisma.gebruiker.create({
      data: {
        gebruikerNaam,
        naam,
        wachtwoord, // In production, hash this password!
        gebruikerTypeId,
      },
      include: {
        gebruikerType: true,
      },
    })

    return NextResponse.json(gebruiker, { status: 201 })
  } catch (error) {
    console.error('Error creating gebruiker:', error)
    return NextResponse.json(
      { error: 'Failed to create gebruiker' },
      { status: 500 }
    )
  }
}
