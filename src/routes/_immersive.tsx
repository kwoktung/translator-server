import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSession } from '@/utils/get-session'

export const Route = createFileRoute('/_immersive')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) throw redirect({ to: '/' })
  },
  component: () => (
    <div className="fixed inset-0 overflow-hidden touch-none overscroll-none">
      <Outlet />
    </div>
  ),
})
