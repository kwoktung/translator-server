import { z } from 'zod'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createApiKey, deleteApiKey, listApiKeys } from '#/actions/api-keys'
import { requireUserId } from '#/utils/require-user-id'

const app = new Hono()
  .get('/', async (c) => {
    const userId = await requireUserId()
    return c.json(await listApiKeys({ userId }))
  })
  .post(
    '/',
    zValidator('json', z.object({ name: z.string().min(1).max(100) })),
    async (c) => {
      const userId = await requireUserId()
      return c.json(
        await createApiKey({ userId, name: c.req.valid('json').name }),
      )
    },
  )
  .delete(
    '/:id',
    zValidator('param', z.object({ id: z.coerce.number().int() })),
    async (c) => {
      const userId = await requireUserId()
      await deleteApiKey({ userId, id: c.req.valid('param').id })
      return c.json({ success: true as const })
    },
  )

export default app
