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
    const extension = media.type === 'image' ? 'jpg' : 'mp4';
    const fileName = `upload_${Date.now()}.${extension}`;
    formData.append('file', {
      uri: media.uri,
      type: media.type === 'image' ? 'image/jpeg' : 'video/mp4',
      name: fileName,
    } as any)
    formData.append('fileName', fileName)
    formData.append('publicKey', auth.publicKey)
    formData.append('signature', auth.signature)
    formData.append('expire', String(auth.expire))
    formData.append('token', auth.token)
    formData.append('post', JSON.stringify([{
      type: 'thumbnail'
    }]));
    // Optional folder; can mirror Cloudinary folder
    formData.append('folder', 'app_uploads')

    const uploadEndpoint = 'https://upload.imagekit.io/api/v1/files/upload'

    // Use fetch for better reliability with large videos in RN
    const response = await fetch(uploadEndpoint, {
      method: 'POST',
      // Do NOT set Content-Type manually; let RN set the correct multipart boundary
      body: formData as any,
    } as any)

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(text || `HTTP ${response.status}`)
    }
    const json = await response.json()
    const url: string | undefined = json?.url || json?.thumbnailUrl
    return url ?? null
  } catch (error: any) {
    console.error('ImageKit upload failed:', error?.response?.data || error?.message)
    return null
  }
}

