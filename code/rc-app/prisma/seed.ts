import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Seed GebruikerType
  const adminType = await prisma.gebruikerType.upsert({
    where: { gebruikerTypeId: 1 },
    update: {},
    create: {
      typeNaam: 'Admin',
    },
  })

  const counterType = await prisma.gebruikerType.upsert({
    where: { gebruikerTypeId: 2 },
    update: {},
    create: {
      typeNaam: 'Balie',
    },
  })

  const studentType = await prisma.gebruikerType.upsert({
    where: { gebruikerTypeId: 3 },
    update: {},
    create: {
      typeNaam: 'Student',
    },
  })

  console.log('Created gebruiker types:', { adminType, counterType, studentType })

  // Seed Gebruikers (with hashed passwords - in production use bcrypt)
  const admin = await prisma.gebruiker.upsert({
    where: { gebruikerNaam: 'admin' },
    update: {},
    create: {
      gebruikerNaam: 'admin',
      naam: 'Administrator',
      wachtwoord: 'admin123', // In production, hash this password
      gebruikerTypeId: adminType.gebruikerTypeId,
    },
  })

  const balieUser = await prisma.gebruiker.upsert({
    where: { gebruikerNaam: 'balie1' },
    update: {},
    create: {
      gebruikerNaam: 'balie1',
      naam: 'Balie Medewerker',
      wachtwoord: 'balie123', // In production, hash this password
      gebruikerTypeId: counterType.gebruikerTypeId,
    },
  })

  const studentUser = await prisma.gebruiker.upsert({
    where: { gebruikerNaam: 'student1' },
    update: {},
    create: {
      gebruikerNaam: 'student1',
      naam: 'Student User',
      wachtwoord: 'student123', // In production, hash this password
      gebruikerTypeId: studentType.gebruikerTypeId,
    },
  })

  console.log('Created users:', { admin, balieUser, studentUser })
  // Seed KlantType
  const studentKlantType = await prisma.klantType.upsert({
    where: { klantTypeId: 1 },
    update: {},
    create: {
      naam: 'Student',
    },
  })

  const externeKlantType = await prisma.klantType.upsert({
    where: { klantTypeId: 2 },
    update: {},
    create: {
      naam: 'Externe',
    },
  })

  console.log('Created klant types:', { studentKlantType, externeKlantType })

  // Seed Afdeling
  const elektronica = await prisma.afdeling.upsert({
    where: { afdelingId: 1 },
    update: {},
    create: {
      naam: 'Elektronica',
    },
  })

  const textiel = await prisma.afdeling.upsert({
    where: { afdelingId: 2 },
    update: {},
    create: {
      naam: 'Textiel',
    },
  })

  const meubelen = await prisma.afdeling.upsert({
    where: { afdelingId: 3 },
    update: {},
    create: {
      naam: 'Meubelen',
    },
  })

  console.log('Created afdelingen:', { elektronica, textiel, meubelen })

  // Seed VoorwerpStatus
  const geregistreerd = await prisma.voorwerpStatus.upsert({
    where: { voorwerpStatusId: 1 },
    update: {},
    create: {
      naam: 'Geregistreerd',
    },
  })

  const inBehandeling = await prisma.voorwerpStatus.upsert({
    where: { voorwerpStatusId: 2 },
    update: {},
    create: {
      naam: 'In behandeling',
    },
  })

  const klaar = await prisma.voorwerpStatus.upsert({
    where: { voorwerpStatusId: 3 },
    update: {},
    create: {
      naam: 'Klaar',
    },
  })

  const afgeleverd = await prisma.voorwerpStatus.upsert({
    where: { voorwerpStatusId: 4 },
    update: {},
    create: {
      naam: 'Afgeleverd',
    },
  })

  console.log('Created voorwerp statuses:', { geregistreerd, inBehandeling, klaar, afgeleverd })

  // Seed Materiaal
  const soldeerbout = await prisma.materiaal.upsert({
    where: { materiaalId: 1 },
    update: {},
    create: {
      naam: 'Soldeerbout',
    },
  })

  const draad = await prisma.materiaal.upsert({
    where: { materiaalId: 2 },
    update: {},
    create: {
      naam: 'Draad',
    },
  })

  const lijm = await prisma.materiaal.upsert({
    where: { materiaalId: 3 },
    update: {},
    create: {
      naam: 'Lijm',
    },
  })

  console.log('Created materialen:', { soldeerbout, draad, lijm })

  // Seed Cafe
  const repaircafe = await prisma.cafe.upsert({
    where: { cafeId: 1 },
    update: {},
    create: {
      cafePatroon: 'RC-GEEL',
      naam: 'Repair Café Geel',
      locatie: 'Thomas More Geel',
    },
  })

  console.log('Created cafe:', repaircafe)

  console.log('Seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
