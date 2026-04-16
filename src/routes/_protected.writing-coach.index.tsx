import { createFileRoute } from '@tanstack/react-router'
import { WritingCoachPage } from '#/pages/writing-coach'

export const Route = createFileRoute('/_protected/writing-coach/')({
  component: WritingCoachPage,
})
