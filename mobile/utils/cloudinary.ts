// mobile/utils/cloudinary.ts
import axios from 'axios';

export type UploadableMedia = {
  uri: string;
  type: 'image' | 'video';
};

// Reuse the same Cloudinary settings as posts
// TODO: If you later move to env vars, update both chat and posts to import from here
const CLOUDINARY_CLOUD_NAME = 'dagzpmz00';
const CLOUDINARY_UPLOAD_PRESET = 'ejpogi';

export const uploadMediaToCloudinary = async (
  media: UploadableMedia,
): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', {
    uri: media.uri,
    type: media.type === 'image' ? 'image/jpeg' : 'video/mp4',
    name: `upload.${media.type === 'image' ? 'jpg' : 'mp4'}`,
  } as any);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

  try {
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
  uploadPreset: CLOUDINARY_UPLOAD_PRESET,
};

