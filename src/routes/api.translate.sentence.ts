import { createFileRoute } from '@tanstack/react-router'
import {
  sentenceTranslateFn,
  sentenceTranslateInputSchema,
} from '#/actions/translate-sentence'

export const Route = createFileRoute('/api/translate/sentence')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json()
        const parsed = sentenceTranslateInputSchema.safeParse(body)

        if (!parsed.success) {
          return Response.json(
            { error: parsed.error.flatten().fieldErrors },
            { status: 400 },
          )
        }

        const result = await sentenceTranslateFn({ data: parsed.data })
        return Response.json(result)
      },
    },
  },
})
