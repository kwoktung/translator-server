import { createFileRoute } from '@tanstack/react-router'
import { handlers } from '#/apis/w.$word'

export const Route = createFileRoute('/w/$word')({
  server: { handlers },
})
