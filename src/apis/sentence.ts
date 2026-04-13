import {
  sentenceTranslateFn,
  sentenceTranslateInputSchema,
} from '#/actions/translate/sentence'
import { createApiRoute, zValidator } from '#/utils/api-handler.server'

export const handlers = {
  POST: createApiRoute(
    zValidator('json', sentenceTranslateInputSchema),
    async (c) => {
      const result = await sentenceTranslateFn({ data: c.req.valid('json') })
      return c.json(result)
    },
  ),
}
