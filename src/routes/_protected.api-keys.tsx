import { createFileRoute } from '@tanstack/react-router'
import { ApiKeysPage } from '#/pages/api-keys'

export const Route = createFileRoute('/_protected/api-keys')({
  component: ApiKeysPage,
})
