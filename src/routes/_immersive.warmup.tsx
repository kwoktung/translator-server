import { createFileRoute } from '@tanstack/react-router'
import { VocabularyWarmupPage } from '#/pages/warmup'

export const Route = createFileRoute('/_immersive/warmup')({
  component: VocabularyWarmupPage,
})
