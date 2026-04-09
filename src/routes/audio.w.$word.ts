import { createFileRoute } from '@tanstack/react-router'
import { handlers } from '#/apis/audio.w.$word'

export const Route = createFileRoute('/audio/w/$word')({
  server: { handlers },
})
