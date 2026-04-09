import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSessionFn } from '#/actions/get-session'
import { HomePage } from '#/pages/home'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await getSessionFn()
    if (session) throw redirect({ to: '/tr' })
  },
  component: HomePage,
})
