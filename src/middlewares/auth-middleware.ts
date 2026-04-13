import type { MiddlewareHandler } from 'hono'
import { getSession } from '#/utils/get-session'

export type HonoContext = {
  Variables: {
    userId: string
  }
}

export const authMiddleware: MiddlewareHandler<HonoContext> = async (
  c,
  next,
) => {
  const session = await getSession()
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!session?.user?.id) return c.json({ error: 'Unauthorized' }, 401)
  c.set('userId', session.user.id)
  await next()
}
