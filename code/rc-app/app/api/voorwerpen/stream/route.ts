import prisma from '@/lib/prisma'

let clients: { id: string; controller: ReadableStreamDefaultController }[] = []

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const clientId = Math.random().toString(36).substring(7)
      clients.push({ id: clientId, controller })

      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)

      // Send initial data
      fetchAndSendData(controller)

      // Cleanup on disconnect
      return () => {
        clients = clients.filter(client => client.id !== clientId)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

async function fetchAndSendData(controller: ReadableStreamDefaultController) {
  try {
    const voorwerpen = await prisma.voorwerp.findMany({
      include: {
        voorwerpStatus: true,
      },
      orderBy: {
        aanmeldingsDuur: 'desc',
      },
    })

    const grouped = {
      afgeleverd: voorwerpen.filter(v => v.voorwerpStatus.naam === 'Geregistreerd'),
      inBehandeling: voorwerpen.filter(v => v.voorwerpStatus.naam === 'In behandeling'),
      klaar: voorwerpen.filter(v => v.voorwerpStatus.naam === 'Klaar'),
    }

    controller.enqueue(`data: ${JSON.stringify(grouped)}\n\n`)
  } catch (error) {
    console.error('Error fetching data for SSE:', error)
  }
}

// Export function to broadcast updates to all clients
export async function broadcastUpdate() {
  const voorwerpen = await prisma.voorwerp.findMany({
    include: {
      voorwerpStatus: true,
    },
    orderBy: {
      aanmeldingsDuur: 'desc',
    },
  })

  const grouped = {
    afgeleverd: voorwerpen.filter(v => v.voorwerpStatus.naam === 'Geregistreerd'),
    inBehandeling: voorwerpen.filter(v => v.voorwerpStatus.naam === 'In behandeling'),
    klaar: voorwerpen.filter(v => v.voorwerpStatus.naam === 'Klaar'),
  }

  const data = `data: ${JSON.stringify(grouped)}\n\n`
  
  clients.forEach(client => {
    try {
      client.controller.enqueue(data)
    } catch (error) {
      console.error('Error sending to client:', error)
    }
  })
}
