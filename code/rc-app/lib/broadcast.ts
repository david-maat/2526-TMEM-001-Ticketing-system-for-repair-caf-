import prisma from '@/lib/prisma'

export async function broadcastVoorwerpenUpdate() {
  try {
    if (!global.io) {
      console.log('Socket.IO not initialized yet')
      return
    }

    const voorwerpen = await prisma.voorwerp.findMany({
      include: {
        voorwerpStatus: true,
      },
      orderBy: {
        aanmeldingsDuur: 'desc',
      },
    })

    const grouped = {
      afgeleverd: voorwerpen.filter((v: any) => v.voorwerpStatus.naam === 'Geregistreerd'),
      inBehandeling: voorwerpen.filter((v: any) => v.voorwerpStatus.naam === 'In behandeling'),
      klaar: voorwerpen.filter((v: any) => v.voorwerpStatus.naam === 'Klaar'),
    }

    global.io.emit('voorwerpen-updated', grouped)
    console.log('Broadcasted voorwerpen update to all clients')
  } catch (error) {
    console.error('Error broadcasting voorwerpen update:', error)
  }
}
