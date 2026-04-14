import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSession } from '@/utils/get-session'
import Header from '../components/header'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    const session = await getSession()
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
