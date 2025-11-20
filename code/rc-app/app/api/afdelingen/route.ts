import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const afdelingen = await prisma.afdeling.findMany({
      orderBy: {
        naam: 'asc',
      },
    })
    return NextResponse.json(afdelingen)
  } catch (error) {
    console.error('Error fetching afdelingen:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
