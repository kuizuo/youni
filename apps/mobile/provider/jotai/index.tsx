import { Provider } from 'jotai'

import { jotaiStore } from './store'

export const JotaiProvider = ({ children }: { children: React.ReactNode }): React.ReactNode => {
  return <Provider store={jotaiStore}>{children}</Provider>
}
