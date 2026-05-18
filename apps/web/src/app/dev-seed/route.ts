import { getPayload } from 'payload'
import config from '@payload-config'
import { runSeed } from '@/scripts/seed'

/**
 * Demo seed endpoint — guarded by SEED_SECRET env var. Idempotent.
 *
 * Lives outside /api/ on purpose: the Payload (payload)/api/[...slug] route
 * is a catch-all that would otherwise win over a sibling /api/* page.
 *
 *   curl -X POST -H "Authorization: Bearer $SEED_SECRET" \
 *        http://localhost:3021/_seed
 */
export async function POST(request: Request) {
  const expected = process.env.SEED_SECRET
  if (!expected) {
    return Response.json(
      { error: 'SEED_SECRET not configured on the server' },
      { status: 500 },
    )
  }

  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${expected}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const payload = await getPayload({ config })
  const result = await runSeed(payload)

  return Response.json(result)
}
