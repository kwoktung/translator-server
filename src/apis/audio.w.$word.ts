import { ttsFn } from '#/actions/tts'
import { isEnglishWord } from '#/utils/patterns'

export const handlers = {
  GET: async ({ params }: { params: { word: string } }) => {
    const text = decodeURIComponent(params.word)
    if (!isEnglishWord(text)) {
      return Response.json(
        { error: `"${text}" is not a valid English word` },
        { status: 400 },
      )
    }
    const stream = await ttsFn({ data: { text } })
    return new Response(stream, {
      headers: { 'Content-Type': 'audio/mpeg' },
    })
  },
}
