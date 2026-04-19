import { z } from 'zod'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { translateSentence } from '#/actions/translate/sentence'
import { translateWord } from '#/actions/translate/word'

const wordTranslateInputSchema = z
  .object({
    word: z.string().min(1),
    source: z.enum(['zh', 'en']),
    target: z.enum(['zh', 'en']),
  })
  .refine((data) => data.source !== data.target, {
    message: 'source and target languages must be different',
    path: ['target'],
  })

const sentenceTranslateInputSchema = z
  .object({
    text: z.string().min(1),
    source: z.enum(['zh', 'en']),
    target: z.enum(['zh', 'en']),
  })
  .refine((data) => data.source !== data.target, {
    message: 'source and target languages must be different',
    path: ['target'],
  })

const app = new Hono()
  .post('/word', zValidator('json', wordTranslateInputSchema), async (c) => {
    return c.json(await translateWord(c.req.valid('json')))
  })
  .post(
    '/sentence',
    zValidator('json', sentenceTranslateInputSchema),
    async (c) => {
      return c.json(await translateSentence(c.req.valid('json')))
    },
  )

export default app
