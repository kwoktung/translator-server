import { z } from 'zod'
import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
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
    bearerAuth({
      verifyToken: async (token, c) => {
        const userId = await getUserIdByApiKey(token)
        if (!userId) return false
        c.set('userId', userId)
        return true
      },
    }),
    zValidator('json', z.object({ text: z.string().min(1).max(2000) })),
    async (c) => {
      return c.json(
        await createWritingTurn({
          userId: c.get('userId'),
          text: c.req.valid('json').text,
        }),
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
