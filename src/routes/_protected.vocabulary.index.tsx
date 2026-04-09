import { createFileRoute } from '@tanstack/react-router'
import { VocabularyPage } from '#/pages/vocabulary'

export const Route = createFileRoute('/_protected/vocabulary/')({
  component: VocabularyPage,
})
