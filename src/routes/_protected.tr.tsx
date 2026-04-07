import { createFileRoute } from '@tanstack/react-router'
import { TranslatePage } from '#/pages/tr'

export const Route = createFileRoute('/_protected/tr')({
  component: TranslatePage,
})
