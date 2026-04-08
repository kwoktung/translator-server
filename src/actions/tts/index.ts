import { createServerOnlyFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getEnv } from '#/env.server'

export const ttsInputSchema = z.object({
  text: z.string().min(1).max(500),
})

export type TTSInput = z.infer<typeof ttsInputSchema>

export const ttsFn = createServerOnlyFn(
  async (text: string): Promise<ReadableStream> => {
    const env = getEnv()
    const result = await env.AI.run('@cf/deepgram/aura-2-es', { text })
    return result as unknown as ReadableStream
  },
)
