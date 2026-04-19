import { createFileRoute } from '@tanstack/react-router'
import { handlers } from '#/apis/audio.p.$phrase'

export const Route = createFileRoute('/audio/p/$phrase')({
  server: { handlers },
})
