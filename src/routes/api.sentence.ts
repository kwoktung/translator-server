import { createFileRoute } from '@tanstack/react-router'
import { handlers } from '#/apis/sentence'

export const Route = createFileRoute('/api/sentence')({
  server: { handlers },
})
