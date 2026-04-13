import { z } from 'zod'
import { getEnv } from '#/env.server'
import { withBinaryCache } from '#/utils/cache.server'
import { createServerOnlyFn } from '@tanstack/react-start'

export const ttsInputSchema = z.object({
  text: z.string().min(1).max(500),
})

export type TTSInput = z.infer<typeof ttsInputSchema>

export const generateTts = createServerOnlyFn(
  async (text: string): Promise<ReadableStream> => {
    const env = getEnv()
    return withBinaryCache({
      namespace: 'tts',
      key: text,
      fn: async () => {
        const result = await env.AI.run('@cf/deepgram/aura-2-en', { text })
        return result as unknown as ReadableStream
      },
      ttl: 604800,
      contentType: 'audio/mpeg',
    })
  },
)
