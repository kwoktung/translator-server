import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { sessionQueryOptions } from '#/utils/get-session'
import Header from '../components/header'

export const Route = createFileRoute('/_protected')({
  loader: async ({ context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData(sessionQueryOptions)
    if (!session) throw redirect({ to: '/' })
  },
  component: () => (
    <div>
      <Header />
      <Outlet />
    </div>
  ),
})
