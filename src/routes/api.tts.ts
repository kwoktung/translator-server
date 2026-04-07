import { createFileRoute } from '@tanstack/react-router'
import { ttsFn, ttsInputSchema } from '#/actions/tts'

export const Route = createFileRoute('/api/tts')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json()
        const parsed = ttsInputSchema.safeParse(body)

        if (!parsed.success) {
          return Response.json(
            { error: parsed.error.flatten().fieldErrors },
            { status: 400 },
          )
        }

        const result = await ttsFn({ data: parsed.data })
        return Response.json(result)
      },
    },
  },
})
