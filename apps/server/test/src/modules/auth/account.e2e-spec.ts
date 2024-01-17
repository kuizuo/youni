import { createE2EApp } from '@test/helper/create-e2e-app'

import { AuthModule } from '~/modules/auth/auth.module'

describe('Account', () => {
  const proxy = createE2EApp({
    imports: [AuthModule],
  })

  it.skip('GET /account/profile', async () => {
    const data = await proxy.app.inject({
      method: 'GET',
      url: '/account/profile',
    })

    const res = data.json()
    console.log(res)
  })
})
