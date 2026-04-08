import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSessionFn } from '#/actions/get-session'
import Header from '../components/header'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    const session = await getSessionFn()
    if (!session) {
      throw redirect({ to: '/' })
    }
  },
  component: () => (
    <div>
      <Header />
      <Outlet />
    </div>
  ),
})
