import React, { useState } from 'react'
import { AppRouter } from '@server/shared/trpc/trpc.instance'
import { createTRPCReact } from '@trpc/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { getToken } from '../auth/utils'
import { getApiUrl } from '../api'

export const trpc = createTRPCReact<AppRouter>()

export const TRPCProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      // transformer: superjson,‰
      links: [
        httpBatchLink({
          async headers() {
            const token = getToken()

            return {
              Authorization: token ? `Bearer ${token}` : undefined,
            }
          },
          url: `${getApiUrl()}/api/trpc`,
        }),
      ],
    }),
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
