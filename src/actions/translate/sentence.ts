import { createServerFn } from '@tanstack/react-start'
import { createWorkersAI } from 'workers-ai-provider'
import { z } from 'zod'
import { getEnv } from '#/env.server'
import { translateText } from '#/utils/llm/translate'
import { LANG_MAP } from '#/actions/translate/common'
import { serverFnErrorMiddleware } from '#/middlewares/server-fn-error'

export const sentenceTranslateInputSchema = z
  .object({
    text: z.string().min(1),
    source: z.enum(['zh', 'en']),
    target: z.enum(['zh', 'en']),
  })
  .refine((data) => data.source !== data.target, {
    message: 'source and target languages must be different',
    path: ['target'],
  })

export type SentenceTranslateInput = z.infer<
  typeof sentenceTranslateInputSchema
>

export interface SentenceTranslateResult {
  translatedText: string
}

export const sentenceTranslateFn = createServerFn<
  'POST',
  SentenceTranslateInput,
  SentenceTranslateResult
>({ method: 'POST' })
  .inputValidator((data) => sentenceTranslateInputSchema.parse(data))
  .middleware([serverFnErrorMiddleware])
  .handler(async ({ data }) => {
    const env = getEnv()
    const workersai = createWorkersAI({ binding: env.AI })
    const model = workersai('@cf/meta/llama-3.1-8b-instruct')

    const translatedText = await translateText(model, {
      text: data.text,
      sourceLang: LANG_MAP[data.source],
      targetLang: LANG_MAP[data.target],
    })

    return { translatedText }
  })
