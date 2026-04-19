import { z } from 'zod'
import { translateWord } from '#/actions/translate/word'
import { createApiRoute, zValidator } from '#/utils/api-handler.server'
import { UnauthorizedError } from '#/utils/errors'
import { isEnglishWord } from '#/utils/patterns'
import { getSession } from '#/utils/get-session'

export const handlers = {
  GET: createApiRoute(
    zValidator('param', z.object({ word: z.string() })),
    async (c) => {
      const session = await getSession()
      if (!session?.user?.id) throw new UnauthorizedError()
      const { word } = c.req.valid('param')
      if (!isEnglishWord(word)) {
        return c.json({ error: `"${word}" is not a valid English word` }, 400)
      }
      const result = await translateWord({ word, source: 'en', target: 'zh' })
      return c.json(result)
    },
  ),
}
