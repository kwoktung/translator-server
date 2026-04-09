import { createFileRoute } from '@tanstack/react-router'
import { VocabularyImportPage } from '#/pages/vocabulary-import'

export const Route = createFileRoute('/_protected/vocabulary/import')({
  component: VocabularyImportPage,
})
