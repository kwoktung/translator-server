import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getEnv } from '#/env.server'
import { serverFnErrorMiddleware } from '#/middlewares/server-fn-error'
import { withBinaryCache } from '#/utils/cache.server'

export const ttsInputSchema = z.object({
  text: z.string().min(1).max(500),
})

export type TTSInput = z.infer<typeof ttsInputSchema>

export const ttsFn = createServerFn({ method: 'POST' })
  .inputValidator((data) => ttsInputSchema.parse(data))
  .middleware([serverFnErrorMiddleware])
  .handler(async ({ data }): Promise<ReadableStream> => {
    const env = getEnv()
    return withBinaryCache(
      'tts',
      data.text,
      async () => {
        const result = await env.AI.run('@cf/deepgram/aura-2-en', {
          text: data.text,
        })
        return result as unknown as ReadableStream
      },
      604800,
      'audio/mpeg',
    )
  })
