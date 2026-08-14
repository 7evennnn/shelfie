export const SHARE_FORMATS = [
  { id: 'current', label: 'Current card', detail: 'As shown', width: null, height: null, suffix: '' },
  { id: 'story', label: 'Story / TikTok', detail: '9:16 / 1080 x 1920', width: 1080, height: 1920, suffix: 'story' },
  { id: 'post', label: 'Instagram post', detail: '4:5 / 1080 x 1350', width: 1080, height: 1350, suffix: 'post' },
]

export function getShareFilename(filename, formatId) {
  const format = SHARE_FORMATS.find(({ id }) => id === formatId) || SHARE_FORMATS[0]
  return `${filename}${format.suffix ? `_${format.suffix}` : ''}`
}

export function getContainedSize(sourceWidth, sourceHeight, targetWidth, targetHeight, padding) {
  const availableWidth = targetWidth - padding * 2
  const availableHeight = targetHeight - padding * 2
  const scale = Math.min(availableWidth / sourceWidth, availableHeight / sourceHeight)
  return {
    width: Math.round(sourceWidth * scale),
    height: Math.round(sourceHeight * scale),
  }
}
