import { createFileRoute } from '@tanstack/react-router'
import { handlers } from '#/apis/word'

export const Route = createFileRoute('/api/word')({
  server: { handlers },
})
