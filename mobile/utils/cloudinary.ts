// mobile/utils/cloudinary.ts
import axios from 'axios';
import { useApiClient } from '@/utils/api';

export type UploadableMedia = {
  uri: string;
  type: 'image' | 'video';
};

// Reuse the same Cloudinary settings as posts
// TODO: If you later move to env vars, update both chat and posts to import from here
const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME as string;

export const uploadMediaToCloudinary = async (
  media: UploadableMedia,
): Promise<string | null> => {
  try {
    // 1) get a signed payload from backend
    const api = (useApiClient as any)?.() ?? null;
    let sigRes: any;
    if (api && typeof api.post === 'function') {
      sigRes = await api.post('/upload/signature', { folder: 'app_uploads' });
    } else {
      sigRes = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/upload/signature`, { folder: 'app_uploads' });
    }
    const { timestamp, signature, apiKey, cloudName } = sigRes.data;

    const formData = new FormData();
    formData.append('file', {
      uri: media.uri,
      type: media.type === 'image' ? 'image/jpeg' : 'video/mp4',
      name: `upload.${media.type === 'image' ? 'jpg' : 'mp4'}`,
    } as any);
    formData.append('timestamp', String(timestamp));
    formData.append('api_key', apiKey);
    formData.append('signature', signature);
    formData.append('folder', 'app_uploads');

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName || CLOUDINARY_CLOUD_NAME}/auto/upload`;
    const response = await axios.post(uploadUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const secureUrl: string | undefined = response?.data?.secure_url;
    return secureUrl ?? null;
  } catch (error) {
    console.error('Cloudinary upload failed:', (error as any)?.response?.data || (error as any)?.message);
    return null;
  }
};

export const cloudinaryConfig = {
  cloudName: CLOUDINARY_CLOUD_NAME,
};

