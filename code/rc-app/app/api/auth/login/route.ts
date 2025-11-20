import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Gebruikersnaam en wachtwoord zijn verplicht' },
        { status: 400 }
      )
    }

    // Find user by username
    const gebruiker = await prisma.gebruiker.findUnique({
      where: { gebruikerNaam: username },
      include: { gebruikerType: true },
    })

    if (!gebruiker) {
      return NextResponse.json(
        { error: 'Ongeldige gebruikersnaam of wachtwoord' },
        { status: 401 }
      )
    }

    // Check password (in production, use bcrypt.compare)
    if (gebruiker.wachtwoord !== password) {
      return NextResponse.json(
        { error: 'Ongeldige gebruikersnaam of wachtwoord' },
        { status: 401 }
      )
    }

    // Create session
    const session = await prisma.sessie.create({
      data: {
        gebruikerId: gebruiker.gebruikerId,
        vervalTijd: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    // Return user info without password
    const { wachtwoord, ...userWithoutPassword } = gebruiker

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      sessionId: session.sessieId,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden tijdens het inloggen' },
      { status: 500 }
    )
  }
}
