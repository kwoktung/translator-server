import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getEnv } from '#/env.server'

export const ttsInputSchema = z.object({
  text: z.string().min(1).max(500),
})

export type TTSInput = z.infer<typeof ttsInputSchema>

export interface TTSResult {
  audio: string // base64-encoded WAV
}

export const ttsFn = createServerFn<'POST', TTSInput, TTSResult>({
  method: 'POST',
})
  .inputValidator((data) => ttsInputSchema.parse(data))
  .handler(async ({ data }) => {
    const env = getEnv()
    const result = await env.AI.run('@cf/microsoft/speecht5-tts', {
      text: data.text,
    })
    return { audio: result.audio }
  })
