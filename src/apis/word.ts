import {
  wordTranslateFn,
  wordTranslateInputSchema,
} from '#/actions/translate/word'
import { createApiRoute, zValidator } from '#/utils/api-handler.server'

export const handlers = {
  POST: createApiRoute(
    zValidator('json', wordTranslateInputSchema),
    async (c) => {
      const result = await wordTranslateFn({ data: c.req.valid('json') })
      return c.json(result)
    },
  ),
}
