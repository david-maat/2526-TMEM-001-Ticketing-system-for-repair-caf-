import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Sessie ID is verplicht' },
        { status: 400 }
      )
    }

    // Delete the session
    await prisma.sessie.delete({
      where: { sessieId: parseInt(sessionId) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden tijdens het uitloggen' },
      { status: 500 }
    )
  }
}
