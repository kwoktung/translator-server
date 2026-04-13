import { z } from 'zod'
import { wordTranslateFn } from '#/actions/translate/word'
import { createApiRoute, zValidator } from '#/utils/api-handler.server'
import { isEnglishWord } from '#/utils/patterns'

export const handlers = {
  GET: createApiRoute(
    zValidator('param', z.object({ word: z.string() })),
    async (c) => {
      const { word } = c.req.valid('param')
      if (!isEnglishWord(word)) {
        return c.json({ error: `"${word}" is not a valid English word` }, 400)
      }
      const result = await wordTranslateFn({
        data: { word, source: 'en', target: 'zh' },
      })
      return c.json(result)
    },
  ),
}
