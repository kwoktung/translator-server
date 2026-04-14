import { z } from 'zod'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { getUserIdByApiKey } from '#/actions/api-keys'
import {
  createWritingTurn,
  deleteWritingTurn,
  listWritingTurns,
} from '#/actions/writing-coach'

const app = new Hono<HonoContext>()
  // POST / — external API key auth
  .post(
    '/',
    zValidator('json', z.object({ text: z.string().min(1).max(2000) })),
    async (c) => {
      const authHeader = c.req.header('Authorization') ?? ''
      const match = /^Bearer\s+(.+)$/.exec(authHeader)
      if (!match)
        return c.json({ error: 'Missing or invalid Authorization header' }, 401)

      const userId = await getUserIdByApiKey(match[1])
      if (!userId) return c.json({ error: 'Invalid API key' }, 401)

      return c.json(
        await createWritingTurn({ userId, text: c.req.valid('json').text }),
      )
    },
  )
  // GET /turns — session auth
  .get('/turns', async (c) => {
    return c.json(await listWritingTurns({ userId: c.get('userId') }))
  })
  // POST /turns — session auth
  .post(
    '/turns',
    zValidator('json', z.object({ text: z.string().min(1).max(2000) })),
    async (c) => {
      const userId = c.get('userId')
      return c.json(
        await createWritingTurn({ userId, text: c.req.valid('json').text }),
      )
    },
  )
  // DELETE /turns/:id — session auth
  .delete(
    '/turns/:id',
    zValidator('param', z.object({ id: z.coerce.number().int() })),
    async (c) => {
      const userId = c.get('userId')
      await deleteWritingTurn({ userId, id: c.req.valid('param').id })
      return c.json({ success: true as const })
    },
  )

export default app
