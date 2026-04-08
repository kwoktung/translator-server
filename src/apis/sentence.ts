import { z } from 'zod'
import {
  sentenceTranslateFn,
  sentenceTranslateInputSchema,
} from '#/actions/translate-sentence'

export const handlers = {
  POST: async ({ request }: { request: Request }) => {
    const body = await request.json()
    const parsed = sentenceTranslateInputSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: z.treeifyError(parsed.error) },
        { status: 400 },
      )
    }

    const result = await sentenceTranslateFn({ data: parsed.data })
    return Response.json(result)
  },
}
