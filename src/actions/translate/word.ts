import { createServerFn } from '@tanstack/react-start'
import { createWorkersAI } from 'workers-ai-provider'
import { z } from 'zod'
import { getEnv } from '#/env.server'
import { getExample } from '#/utils/llm/example'
import { getMeaning } from '#/utils/llm/meaning'
import { getMnemonic } from '#/utils/llm/mnemonic'
import { getPhonetic } from '#/utils/llm/phonetic'
import { LANG_MAP } from '#/actions/translate/common'
import { serverFnErrorMiddleware } from '#/middlewares/server-fn-error'

export const wordTranslateInputSchema = z
  .object({
    word: z.string().min(1),
    source: z.enum(['zh', 'en']),
    target: z.enum(['zh', 'en']),
  })
  .refine((data) => data.source !== data.target, {
    message: 'source and target languages must be different',
    path: ['target'],
  })

export type WordTranslateInput = z.infer<typeof wordTranslateInputSchema>

export interface WordTranslateResult {
  word: string
  phonetic: string
  mnemonic: string
  example: string
  meaning: string
}

export const wordTranslateFn = createServerFn<
  'POST',
  WordTranslateInput,
  WordTranslateResult
>({ method: 'POST' })
  .inputValidator((data) => wordTranslateInputSchema.parse(data))
  .middleware([serverFnErrorMiddleware])
  .handler(async ({ data }) => {
    const env = getEnv()
    const workersai = createWorkersAI({ binding: env.AI })
    const model = workersai('@cf/meta/llama-3.1-8b-instruct')

    const sourceLang = LANG_MAP[data.source]
    const targetLang = LANG_MAP[data.target]

    const [meaning, phonetic, example, mnemonic] = await Promise.all([
      getMeaning(model, { word: data.word, sourceLang, targetLang }),
      getPhonetic(model, { word: data.word }),
      getExample(model, { word: data.word, sourceLang }),
      getMnemonic(model, { word: data.word, sourceLang }),
    ])

    return { word: data.word, meaning, phonetic, example, mnemonic }
  })
