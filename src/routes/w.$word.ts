import { createFileRoute } from '@tanstack/react-router'
import { wordTranslateFn } from '#/actions/translate-word'

export const Route = createFileRoute('/w/$word')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { word } = params
        if (!/^[a-zA-Z]+(-[a-zA-Z]+)*$/.test(word)) {
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
    },
  },
})
