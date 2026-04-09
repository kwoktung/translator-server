import { createFileRoute } from '@tanstack/react-router'
import { handlers } from '#/apis/writing-coach'

export const Route = createFileRoute('/api/writing-coach')({
  server: { handlers },
})
