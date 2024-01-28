import * as trpcFastify from '@trpc/server/adapters/fastify'

export async function createContext({
  req,
  res,
}: trpcFastify.CreateFastifyContextOptions) {
  return {
    authorization: req.headers.authorization as string | null,
    lang: req.headers['accept-language'],
    ua: req.headers['user-agent'],
  }
}
export type Context = Awaited<ReturnType<typeof createContext>>
