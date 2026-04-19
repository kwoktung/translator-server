import { z } from 'zod'
import { generateTts } from '#/actions/tts'
import { createApiRoute, zValidator } from '#/utils/api-handler.server'
import { UnauthorizedError } from '#/utils/errors'
import { isEnglishPhrase } from '#/utils/patterns'
import { getSession } from '#/utils/get-session'

export const handlers = {
  GET: createApiRoute(
    zValidator('param', z.object({ phrase: z.string() })),
    async (c) => {
      const session = await getSession()
      if (!session?.user?.id) throw new UnauthorizedError()
      const text = decodeURIComponent(c.req.valid('param').phrase)
      if (!isEnglishPhrase(text)) {
        return c.json({ error: `"${text}" is not a valid English phrase` }, 400)
      }
      const stream = await generateTts(text)
      return new Response(stream, { headers: { 'Content-Type': 'audio/mpeg' } })
    },
  ),
}
