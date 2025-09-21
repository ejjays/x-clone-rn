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
    if (!url) return null
    const isImageKit = url.includes('imagekit.io')
    if (!isImageKit) return null
    // Replace any existing tr param with jpg frame at ~1s
    const hasQuery = url.includes('?')
    const trPattern = /([?&])tr=[^&]*/
    if (trPattern.test(url)) {
      return url.replace(trPattern, '$1tr=f-jpg,so-1')
    }
    const sep = hasQuery ? '&' : '?'
    return `${url}${sep}tr=f-jpg,so-1`
  } catch {
    return null
  }
}
