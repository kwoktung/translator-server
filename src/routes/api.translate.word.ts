import { createFileRoute } from '@tanstack/react-router'
import {
  wordTranslateFn,
  wordTranslateInputSchema,
} from '#/actions/translate-word'

export const Route = createFileRoute('/api/translate/word')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json()
        const parsed = wordTranslateInputSchema.safeParse(body)

        if (!parsed.success) {
          return Response.json(
            { error: parsed.error.flatten().fieldErrors },
            { status: 400 },
          )
        }

        const result = await wordTranslateFn({ data: parsed.data })
        return Response.json(result)
      },
    },
  },
})
