'use server'

import prisma from '@/lib/prisma'

export async function logoutAction(sessionId: number) {
  try {
    // Delete the session from database
    await prisma.sessie.delete({
      where: { sessieId: sessionId },
    })

    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    return { success: false, error: 'Er is een fout opgetreden tijdens het uitloggen' }
  }
}

export async function loginAction(username: string, password: string) {
  try {
    if (!username || !password) {
      return { success: false, error: 'Gebruikersnaam en wachtwoord zijn verplicht' }
    }

    // Find user by username
    const gebruiker = await prisma.gebruiker.findUnique({
      where: { gebruikerNaam: username },
      include: { gebruikerType: true },
    })

    if (!gebruiker) {
      return { success: false, error: 'Ongeldige gebruikersnaam of wachtwoord' }
    }

    // Check password (in production, use bcrypt.compare)
    if (gebruiker.wachtwoord !== password) {
      return { success: false, error: 'Ongeldige gebruikersnaam of wachtwoord' }
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

    return {
      success: true,
      user: userWithoutPassword,
      sessionId: session.sessieId,
    }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Er is een fout opgetreden tijdens het inloggen' }
  }
}
