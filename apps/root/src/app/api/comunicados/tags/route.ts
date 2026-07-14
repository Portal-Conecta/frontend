import { NextResponse } from 'next/server'

import { listTags } from '@portal/comunicados/services/server/tagsService'
import type { TagEntityType } from '@portal/comunicados/types'

import { bffErrorResponse } from '../_lib/bffError'

const ENTITY_TYPES = new Set<TagEntityType>(['COURSE', 'CLASS', 'USER', 'GENERAL', 'SHIFT'])

/**
 * BFF — lista tags ativas do domínio comunicados. Repassa `entityType` quando
 * válido e usa o JWT do cookie via service server.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const entityType = searchParams.get('entityType')

  try {
    const data = await listTags(
      entityType && ENTITY_TYPES.has(entityType as TagEntityType)
        ? { entityType: entityType as TagEntityType }
        : {},
    )
    return NextResponse.json(data)
  } catch (err) {
    return bffErrorResponse(err)
  }
}
