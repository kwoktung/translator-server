import { z } from 'zod'
import { ttsFn } from '#/actions/tts'
import { createApiRoute, zValidator } from '#/utils/api-handler.server'
import { isEnglishWord } from '#/utils/patterns'

export const handlers = {
  GET: createApiRoute(
    zValidator('param', z.object({ word: z.string() })),
    async (c) => {
      const text = decodeURIComponent(c.req.valid('param').word)
      if (!isEnglishWord(text)) {
        return c.json({ error: `"${text}" is not a valid English word` }, 400)
      }
      const stream = await ttsFn({ data: { text } })
      return new Response(stream, { headers: { 'Content-Type': 'audio/mpeg' } })
    },
  ),
}
