import { createFileRoute } from '@tanstack/react-router'
import { WritingCoachHistoryPage } from '#/pages/writing-coach-history'

export const Route = createFileRoute('/_protected/writing-coach/history')({
  component: WritingCoachHistoryPage,
})
