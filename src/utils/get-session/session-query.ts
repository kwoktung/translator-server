import { queryOptions } from '@tanstack/react-query'
import { getSession } from './get-session'

export const sessionQueryOptions = queryOptions({
  queryKey: ['session'],
  queryFn: () => getSession(),
  staleTime: 60_000,
})
