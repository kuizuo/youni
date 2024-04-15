import axios from 'axios'
import type { AxiosError } from 'axios'
import { useRouter } from 'expo-router'
import { getToken, removeToken } from '../auth/utils'
import { getApiUrl } from '../api'

export const client = axios.create({
  baseURL: getApiUrl(),
  timeout: 5000,
})

client.interceptors.request.use((config) => {
  config.params = config.params || {}
  config.params._t = Date.now()

  const token = getToken()
  if (token)
    config.headers.Authorization = `Bearer ${token}`

  return config
})

client.interceptors.response.use(
  (response) => {
    // transform data
    const data = response.data

    const { code, data: result, message } = data
    const hasSuccess = data && Reflect.has(data, 'code') && code === 0
    if (hasSuccess)
      return result

    throw new Error(message)
  },
  (error: AxiosError) => {
    if (!error.response)
      return Promise.reject(error)

    const res = error.response

    if (res?.status === 401) {
      removeToken()
      const router = useRouter()

      router.replace('/login')
    }

    const data: any = res.data || {}
    if (typeof data.code === 'number') {
      if (!error.config?.ignoreBizError) {
        // ...
      }
    }

    return Promise.reject(error)
  },
)

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    /**
     * if true, will not throw BizError
     * @default false
     */
    ignoreBizError?: boolean
  }

  interface AxiosRequestConfig {
    /**
     * if true, will not throw BizError
     * @default false
     */
    ignoreBizError?: boolean
  }
}
