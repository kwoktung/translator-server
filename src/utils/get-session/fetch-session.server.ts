import { makeCacheKey } from '#/utils/cache.server'
import type { Session } from './types'

export async function fetchSessionWithCookies(cookie: string): Promise<{
  session: Session | null
  setCookies: string[]
}> {
  const cache = caches.default
  const cacheKey = await makeCacheKey('session', cookie)

  const cached = await cache.match(cacheKey)
  if (cached) {
    return { session: await cached.json(), setCookies: [] }
  }

  const response = await fetch(
    `${import.meta.env.VITE_AUTH_BASE_URL}/api/auth/get-session`,
    { headers: { cookie } },
  )

  if (!response.ok) return { session: null, setCookies: [] }

  const setCookies = response.headers.getSetCookie()
  const session: Session = await response.json()

  await cache.put(
    cacheKey,
    new Response(JSON.stringify(session), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=60',
      },
    }),
  )

  return { session, setCookies }
}
