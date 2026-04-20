import { createFileRoute, redirect } from '@tanstack/react-router'
import { sessionQueryOptions } from '#/utils/get-session'
import { HomePage } from '#/pages/home'

export const Route = createFileRoute('/')({
  loader: async ({ context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData(sessionQueryOptions)
    if (session) throw redirect({ to: '/tr' })
  },
  component: HomePage,
})
