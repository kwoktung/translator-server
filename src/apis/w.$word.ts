import { wordTranslateFn } from '#/actions/translate/word'
import { isEnglishWord } from '#/utils/patterns'

export const handlers = {
  GET: async ({ params }: { params: { word: string } }) => {
    const { word } = params
    if (!isEnglishWord(word)) {
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
