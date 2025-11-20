import prisma from '@/lib/prisma'
import { cache } from 'react'

// GET all voorwerpen - cached for request deduplication
export const getVoorwerpen = cache(async () => {
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
    return voorwerpen
  } catch (error) {
    console.error('Error fetching voorwerpen:', error)
    throw new Error('Failed to fetch voorwerpen')
  }
})

// GET single voorwerp by voorwerpNummer
export const getVoorwerpByNummer = cache(async (voorwerpNummer: string) => {
  try {
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
    return voorwerp
  } catch (error) {
    console.error('Error fetching voorwerp:', error)
    throw new Error('Failed to fetch voorwerp')
  }
})

// GET voorwerpen grouped by status
export const getVoorwerpenByStatus = cache(async () => {
  try {
    const voorwerpen = await prisma.voorwerp.findMany({
      include: {
        voorwerpStatus: true,
      },
      orderBy: {
        aanmeldingsDuur: 'desc',
      },
    })

    // Group items by status
    const grouped = {
      afgeleverd: voorwerpen.filter(v => v.voorwerpStatus.naam === 'Geregistreerd'),
      inBehandeling: voorwerpen.filter(v => v.voorwerpStatus.naam === 'In behandeling'),
      klaar: voorwerpen.filter(v => v.voorwerpStatus.naam === 'Klaar'),
    }

    return grouped
  } catch (error) {
    console.error('Error fetching voorwerpen status:', error)
    throw new Error('Er is een fout opgetreden')
  }
})
