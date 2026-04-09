import { z } from 'zod'
import {
  wordTranslateFn,
  wordTranslateInputSchema,
} from '#/actions/translate/word'

export const handlers = {
  POST: async ({ request }: { request: Request }) => {
    const body = await request.json()
    const parsed = wordTranslateInputSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: z.treeifyError(parsed.error) },
        { status: 400 },
      )
    }

    const result = await wordTranslateFn({ data: parsed.data })
    return Response.json(result)
  },
}
