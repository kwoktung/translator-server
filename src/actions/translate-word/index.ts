import { createServerFn } from '@tanstack/react-start'
import { generateText, Output } from 'ai'
import Mustache from 'mustache'
import { createWorkersAI } from 'workers-ai-provider'
import { z } from 'zod'
import { getEnv } from '#/env.server'
import promptTemplate from './prompt.mustache?raw'

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

const wordResultSchema = z.object({
  phonetic: z.string().describe('IPA pronunciation, e.g. /ˈmesi/'),
  mnemonic: z
    .string()
    .describe(
      'A short mnemonic or memory technique to help remember the word, in the source language',
    ),
  example: z
    .string()
    .describe('A natural example sentence in the source language'),
  meaning: z.string().describe('The word meaning in the target language'),
})

export const wordTranslateFn = createServerFn<
  'POST',
  WordTranslateInput,
  WordTranslateResult
>({ method: 'POST' })
  .inputValidator((data) => wordTranslateInputSchema.parse(data))
  .handler(async ({ data }) => {
    const env = getEnv()
    const workersai = createWorkersAI({ binding: env.AI })

    const prompt = Mustache.render(promptTemplate, {
      word: data.word,
      sourceLang: data.source === 'zh' ? 'Chinese' : 'English',
      targetLang: data.target === 'zh' ? 'Chinese' : 'English',
    })

    const { output: object } = await generateText({
      model: workersai('@cf/meta/llama-3.1-8b-instruct'),
      output: Output.object({ schema: wordResultSchema }),
      prompt,
    })

    return { word: data.word, ...object }
  })
