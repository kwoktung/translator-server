import { z } from 'zod'
import { ttsInputSchema, ttsFn } from '#/actions/tts'

export const handlers = {
  POST: async ({ request }: { request: Request }) => {
    const body = await request.json()
    const parsed = ttsInputSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: z.treeifyError(parsed.error) },
        { status: 400 },
      )
    }

    const stream = await ttsFn(parsed.data.text)
    return new Response(stream, {
      headers: { 'Content-Type': 'audio/mpeg' },
    })
  },
}
