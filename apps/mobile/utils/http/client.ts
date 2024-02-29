import axios from 'axios'
import type { AxiosError } from 'axios'
import { getToken, removeToken } from '../auth/util'
import { useRouter } from 'expo-router'
import { useToastController } from '@/ui'

export const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 5000,
})

client.interceptors.request.use((config) => {
  config.params = config.params || {}
  config.params._t = Date.now()

  const token = getToken()
  if (token) {
    config.headers['Authorization'] = token
  }

  return config
})

client.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError) => {
    if (!error.response) {
      return Promise.reject(error)
    }
    const res = error.response

    if (res?.status === 401) {
      removeToken()
      const router = useRouter()

      router.replace('/sign-in')
    }

    const data: any = res.data || {}
    if (typeof data.code === 'number') {
      if (!error.config?.ignoreBizError) {
        const toast = useToastController()
        toast.show(data.message)
      }
    }

    return Promise.reject(error)
  },
)


declare module 'axios' {
  interface InternalAxiosRequestConfig {
    /** if true, will not throw BizError
     * @default false
     */
    ignoreBizError?: boolean
  }

  interface AxiosRequestConfig {
    /** if true, will not throw BizError
     * @default false
     */
    ignoreBizError?: boolean
  }
}
