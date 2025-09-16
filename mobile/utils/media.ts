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

