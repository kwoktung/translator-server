import { Hono } from 'hono'
import { UnauthorizedError } from '#/utils/errors'
import { authMiddleware } from '#/middlewares/auth-middleware'
import type { HonoContext } from '#/middlewares/auth-middleware'
import apiKeys from './api-keys'
import vocabulary from './vocabulary'
import writingCoach from './writing-coach'
import translation from './translation'
import { ZodError, z } from 'zod'

const app = new Hono<HonoContext>()

app.onError((err, c) => {
  if (err instanceof UnauthorizedError)
    return c.json({ error: 'Unauthorized' }, 401)
  if (err instanceof ZodError) {
    return c.json({ error: z.treeifyError(err) }, 400)
  }
  return c.json({ error: 'Internal server error' }, 500)
})

app.use(authMiddleware)

const routes = app
  .route('/api/api-keys', apiKeys)
  .route('/api/vocabulary', vocabulary)
  .route('/api/writing-coach', writingCoach)
  .route('/api/translate', translation)

export type AppType = typeof routes

export default app
