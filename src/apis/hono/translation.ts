import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import {
  translateSentence,
  sentenceTranslateInputSchema,
} from '#/actions/translate/sentence'
import {
  translateWord,
  wordTranslateInputSchema,
} from '#/actions/translate/word'

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
