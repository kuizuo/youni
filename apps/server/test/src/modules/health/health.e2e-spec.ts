import { createE2EApp } from '@test/helper/create-e2e-app'

import { HealthModule } from '~/modules/health/health.module'

describe('Health', () => {
  const proxy = createE2EApp({
    imports: [HealthModule],
  })

  it('GET /health/network', async () => {
    const response = await proxy.app.inject({
      method: 'GET',
      url: '/health/network',
    })

    expect(response.statusCode).toBe(200)
  })

  it('GET /health/database', async () => {
    const response = await proxy.app.inject({
      method: 'GET',
      url: '/health/database',
    })

    expect(response.statusCode).toBe(200)
  })

  it('GET /health/memory-heap', async () => {
    const response = await proxy.app.inject({
      method: 'GET',
      url: '/health/memory-heap',
    })

    expect(response.statusCode).toBe(200)
  })

  it('GET /health/memory-rss', async () => {
    const response = await proxy.app.inject({
      method: 'GET',
      url: '/health/memory-rss',
    })

    expect(response.statusCode).toBe(200)
  })

  it('GET /health/disk', async () => {
    const response = await proxy.app.inject({
      method: 'GET',
      url: '/health/disk',
    })
    expect(response.statusCode).toBe(200)
  })
})
