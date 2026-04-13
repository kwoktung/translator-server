import { z } from 'zod'
import { getUserIdByApiKey } from '#/actions/api-keys'
import { createWritingTurn } from '#/actions/writing-coach'
import { createApiRoute, zValidator } from '#/utils/api-handler.server'

export const handlers = {
  POST: createApiRoute(
    zValidator('json', z.object({ text: z.string().min(1).max(2000) })),
    async (c) => {
      const authHeader = c.req.raw.headers.get('Authorization') ?? ''
      const match = /^Bearer\s+(.+)$/.exec(authHeader)
      if (!match) {
        return c.json({ error: 'Missing or invalid Authorization header' }, 401)
      }

      const userId = await getUserIdByApiKey(match[1])
      if (!userId) {
        return c.json({ error: 'Invalid API key' }, 401)
      }

      const { text } = c.req.valid('json')
      return c.json(await createWritingTurn({ userId, text }))
    },
  ),
}
