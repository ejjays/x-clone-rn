// mobile/utils/imagekit.ts
import axios, { type AxiosInstance } from 'axios'
import { API_BASE_URL } from '@/utils/api'

export type UploadableMedia = {
  uri: string
  type: 'image' | 'video'
}

type AuthResponse = {
  token: string
  expire: number
  signature: string
  publicKey: string
  urlEndpoint?: string | null
}

export const uploadMediaToImageKit = async (
  media: UploadableMedia,
  api?: AxiosInstance,
): Promise<string | null> => {
  try {
    let auth: AuthResponse
    if (api && typeof api.get === 'function') {
      const res = await api.get('/upload/imagekit/auth')
      auth = res.data
    } else {
      // Without an authenticated API client, we cannot call the protected auth endpoint
      throw new Error('Missing authorized API client for ImageKit auth')
    }

    const formData = new FormData()
    formData.append('file', {
      uri: media.uri,
      type: media.type === 'image' ? 'image/jpeg' : 'video/mp4',
      name: `upload.${media.type === 'image' ? 'jpg' : 'mp4'}`,
    } as any)
    formData.append('fileName', `upload_${Date.now()}`)
    formData.append('publicKey', auth.publicKey)
    formData.append('signature', auth.signature)
    formData.append('expire', String(auth.expire))
    formData.append('token', auth.token)
    // Optional folder; can mirror Cloudinary folder
    formData.append('folder', 'app_uploads')

    const uploadEndpoint = 'https://upload.imagekit.io/api/v1/files/upload'
    const response = await axios.post(uploadEndpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    })

    // Prefer url; fallback to thumbnailUrl
    const url: string | undefined = response?.data?.url || response?.data?.thumbnailUrl
    return url ?? null
  } catch (error: any) {
    console.error('ImageKit upload failed:', error?.response?.data || error?.message)
    return null
  }
}

