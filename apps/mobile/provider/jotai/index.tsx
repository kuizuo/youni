import { Provider } from 'jotai'

import { jotaiStore } from './store'

export function JotaiProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={jotaiStore}>{children}</Provider>
}
