import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { withJsonCache } from '#/utils/cache.server'
import { serverFnErrorMiddleware } from '#/middlewares/server-fn-error'

export interface SessionUser {
  id: string
  name: string
  email: string
}

export interface Session {
  session: object
  user: SessionUser
}

export const getSessionFn = createServerFn({ method: 'GET' })
  .middleware([serverFnErrorMiddleware])
  .handler(async () => {
    const request = getRequest()
    const cookie = request.headers.get('cookie') ?? ''

    return withJsonCache<Session | null>({
      namespace: 'session',
      key: cookie,
      fn: async () => {
        const response = await fetch(
          `${import.meta.env.VITE_AUTH_BASE_URL}/api/auth/get-session`,
          { headers: { cookie } },
        )
        if (!response.ok) return null
        return response.json()
      },
      ttl: 60,
    })
  })
