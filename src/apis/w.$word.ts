import { wordTranslateFn } from '#/actions/translate-word'

export const handlers = {
  GET: async ({ params }: { params: { word: string } }) => {
    const { word } = params
    const ENGLISH_WORD_PATTERN = /^[a-zA-Z]+(-[a-zA-Z]+)*$/
    if (!ENGLISH_WORD_PATTERN.test(word)) {
      return Response.json(
        { error: `"${word}" is not a valid English word` },
        { status: 400 },
      )
    }

    const result = await wordTranslateFn({
      data: { word, source: 'en', target: 'zh' },
    })
    return Response.json(result)
  },
}
