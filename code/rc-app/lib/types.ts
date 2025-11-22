/**
 * This file exports commonly used Prisma types for easier imports
 * Import from this file instead of @prisma/client for better type inference
 */

import { Prisma } from '@prisma/client'

// Export the Prisma namespace for advanced types
export { Prisma }

// User types
export type Gebruiker = Prisma.GebruikerGetPayload<{}>
export type GebruikerWithType = Prisma.GebruikerGetPayload<{
  include: { gebruikerType: true }
}>
export type GebruikerType = Prisma.GebruikerTypeGetPayload<{}>

// Customer types
export type Klant = Prisma.KlantGetPayload<{}>
export type KlantWithType = Prisma.KlantGetPayload<{
  include: { klantType: true }
}>
export type KlantType = Prisma.KlantTypeGetPayload<{}>

// Item types
export type Voorwerp = Prisma.VoorwerpGetPayload<{}>
export type VoorwerpFull = Prisma.VoorwerpGetPayload<{
  include: {
    klant: { include: { klantType: true } }
    voorwerpStatus: true
    afdeling: true
    gebruikteMaterialen: { include: { materiaal: true } }
  }
}>
export type VoorwerpStatus = Prisma.VoorwerpStatusGetPayload<{}>
export type ReparatieStatus = Prisma.ReparatieStatusGetPayload<{}>

// Department types
export type Afdeling = Prisma.AfdelingGetPayload<{}>

// Material types
export type Materiaal = Prisma.MateriaalGetPayload<{}>
export type GebruikteMateriaal = Prisma.GebruikteMateriaalGetPayload<{}>
export type GebruikteMateriaalWithDetails = Prisma.GebruikteMateriaalGetPayload<{
  include: { materiaal: true; voorwerp: true }
}>

// Café types
export type Cafe = Prisma.CafeGetPayload<{}>
export type Cafedag = Prisma.CafedagGetPayload<{}>
export type CafedagWithCafe = Prisma.CafedagGetPayload<{
  include: { cafe: true }
}>
export type CafeGebruiker = Prisma.CafeGebruikerGetPayload<{}>

// Session types
export type Sessie = Prisma.SessieGetPayload<{}>
export type QRLogin = Prisma.QRLoginGetPayload<{}>

// Create/Update input types
export type GebruikerCreateInput = Prisma.GebruikerCreateInput
export type GebruikerUpdateInput = Prisma.GebruikerUpdateInput
export type VoorwerpCreateInput = Prisma.VoorwerpCreateInput
export type VoorwerpUpdateInput = Prisma.VoorwerpUpdateInput
export type KlantCreateInput = Prisma.KlantCreateInput
export type KlantUpdateInput = Prisma.KlantUpdateInput
