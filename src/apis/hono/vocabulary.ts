import { z } from 'zod'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import {
  addVocabulary,
  listVocabulary,
  removeVocabulary,
} from '#/actions/vocabulary'

const app = new Hono<HonoContext>()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        prefix: z.string().optional(),
        cursor: z.coerce.number().int().optional(),
        limit: z.coerce.number().int().min(1).max(1000).optional(),
      }),
    ),
    async (c) => {
      const userId = c.get('userId')
      return c.json(await listVocabulary({ userId, ...c.req.valid('query') }))
    },
  )
  .post(
    '/',
    zValidator('json', z.object({ word: z.string().min(1) })),
    async (c) => {
      const userId = c.get('userId')
      return c.json(
        await addVocabulary({ userId, word: c.req.valid('json').word }),
      )
    },
  )
  .delete(
    '/:id',
    zValidator('param', z.object({ id: z.coerce.number().int() })),
    async (c) => {
      const userId = c.get('userId')
      return c.json(
        await removeVocabulary({ userId, id: c.req.valid('param').id }),
      )
    },
  )

export default app
