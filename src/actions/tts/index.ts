import { createServerOnlyFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getEnv } from '#/env.server'
import { withBinaryCache } from '#/utils/cache.server'

export const ttsInputSchema = z.object({
  text: z.string().min(1).max(500),
})

export type TTSInput = z.infer<typeof ttsInputSchema>

export const ttsFn = createServerOnlyFn(
  async (text: string): Promise<ReadableStream> => {
    const env = getEnv()
    return withBinaryCache(
      'tts',
      text,
      async () => {
        const result = await env.AI.run('@cf/deepgram/aura-2-en', { text })
        return result as unknown as ReadableStream
      },
      604800,
      'audio/mpeg',
    )
  },
)
