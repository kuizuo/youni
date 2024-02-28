import type { AppRouter } from '@server/shared/trpc/trpc.instance'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import superjson from 'superjson'
import { getToken } from '../auth/cookies'

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      // transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          async headers() {
            return {
              Authorization: `Bearer ${getToken()}`,
            }
          },
          url: `${process.env.NEXT_PUBLIC_API_URL}/trpc`,
        }),
      ],
    }
  },
  ssr: false,
})
