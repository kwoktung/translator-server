import type { MiddlewareHandler } from 'hono'
import { getSession } from '#/utils/get-session'

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
    const session = await getSession()
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!session?.user?.id) return c.json({ error: 'Unauthorized' }, 401)
    c.set('userId', session.user.id)
    await next()
  }
}
