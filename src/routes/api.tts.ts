import { createFileRoute } from '@tanstack/react-router'
import { handlers } from '#/apis/tts'

export const Route = createFileRoute('/api/tts')({
  server: { handlers },
})
