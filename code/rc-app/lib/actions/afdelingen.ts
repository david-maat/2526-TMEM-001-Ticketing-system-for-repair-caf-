'use server'

import { getAfdelingen } from '@/lib/data/afdelingen'

// Wrapper function to allow client components to fetch afdelingen
export async function getAfdelingenForClient() {
  return await getAfdelingen()
}
