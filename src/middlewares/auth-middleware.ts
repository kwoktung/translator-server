import type { MiddlewareHandler } from 'hono'
import { fetchSessionWithCookies } from '#/utils/get-session/fetch-session.server'

type WhitelistEntry = { path: string | RegExp; method: string }

export function matchesWhitelist(
  path: string,
  method: string,
  whitelist: WhitelistEntry[],
): boolean {
  return whitelist.some((entry) => {
    const pathMatch =
      typeof entry.path === 'string'
        ? entry.path === path
        : entry.path.test(path)
    const methodMatch = entry.method.toUpperCase() === method.toUpperCase()
    return pathMatch && methodMatch
  })
}

export function createAuthMiddleware({
  whitelist = [],
}: {
  whitelist?: WhitelistEntry[]
} = {}): MiddlewareHandler<HonoContext> {
  return async (c, next) => {
    if (matchesWhitelist(c.req.path, c.req.method, whitelist)) return next()

    const cookie = c.req.header('cookie') ?? ''
    const { session, setCookies } = await fetchSessionWithCookies(cookie)

    for (const sc of setCookies) {
      c.header('Set-Cookie', sc, { append: true })
    }

    if (!session?.user?.id) return c.json({ error: 'Unauthorized' }, 401)
    c.set('userId', session.user.id)
    await next()
  }
}
