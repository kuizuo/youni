import { P } from 'ts-pattern'

/**
 * Common states for tRPC data fetching
 *
 */

export const error = {
  failureReason: P.not(null),
}

export const loading = {
  isLoading: P.when(isLoading => isLoading === true),
}

export const dataNotFetched = {
  isFetched: P.when(isFetched => isFetched === false),
}

export const empty = {
  data: P.when((data: { items: [] }) => data?.items?.length === 0 || data === null || data === undefined),
}

export const success = {
  isLoading: P.when(isLoading => isLoading === false),
  failureReason: P.when(status => status === null),
}
