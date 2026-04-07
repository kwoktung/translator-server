import { createServerFn } from '@tanstack/react-start'
import { generateText, Output } from 'ai'
import Mustache from 'mustache'
import { createWorkersAI } from 'workers-ai-provider'
import { z } from 'zod'
import { getEnv } from '#/env.server'
import promptTemplate from './prompt.mustache?raw'

const LANG_MAP: Record<string, string> = {
  zh: 'Chinese',
  en: 'English',
}

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

const sentenceResultSchema = z.object({
  translatedText: z
    .string()
    .describe('The translated text in the target language'),
})

export const sentenceTranslateFn = createServerFn<
  'POST',
  SentenceTranslateInput,
  SentenceTranslateResult
>({ method: 'POST' })
  .inputValidator((data) => sentenceTranslateInputSchema.parse(data))
  .handler(async ({ data }) => {
    const env = getEnv()
    const workersai = createWorkersAI({ binding: env.AI })

    const prompt = Mustache.render(promptTemplate, {
      text: data.text,
      sourceLang: LANG_MAP[data.source],
      targetLang: LANG_MAP[data.target],
    })

    const { output } = await generateText({
      model: workersai('@cf/meta/llama-3.1-8b-instruct'),
      output: Output.object({ schema: sentenceResultSchema }),
      prompt,
    })

    return output
  })
