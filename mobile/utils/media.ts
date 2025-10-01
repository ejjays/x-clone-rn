export const getPlayableVideoUrl = (url: string): string => {
  try {
    if (!url) return url
    const isImageKit = url.includes('imagekit.io')
    if (!isImageKit) return url
    // If a transformation is already present, respect it
    if (url.includes('?tr=') || url.includes('&tr=')) return url
    const sep = url.includes('?') ? '&' : '?'
    // Force MP4 delivery for compatibility (ImageKit will transcode if needed)
    return `${url}${sep}tr=f-mp4`
  } catch {
    return url
  }
}

export const getVideoThumbnailUrl = (url: string): string | null => {
  try {
    if (!url) return null;

    // Handle ImageKit URLs
    if (url.includes('imagekit.io')) {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}tr=n-ik_ml_thumbnail`;
    }

    // Handle Cloudinary URLs
    if (url.includes('cloudinary.com')) {
      const baseUrl = url.split('?')[0];
      const urlWithoutExt = baseUrl.substring(0, baseUrl.lastIndexOf('.')) || baseUrl;
      
      if (urlWithoutExt.includes('/upload/')) {
        // Use so_auto for automatic frame selection and force format to jpg
        return urlWithoutExt.replace('/upload/', '/upload/so_auto,f_jpg/');
      }
      return `${urlWithoutExt}.jpg`;
    }

    // For other URLs, we can't reliably generate a thumbnail
    return null;
  } catch {
    return null;
  }
}
