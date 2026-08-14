import { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { getContainedSize, getShareFilename, SHARE_FORMATS } from '../utils/shareFormat'

async function waitForImage(image) {
  if (image.complete) return
  await new Promise((resolve) => {
    image.addEventListener('load', resolve, { once: true })
    image.addEventListener('error', resolve, { once: true })
  })
}

function DownloadIcon() {
  return (
    <svg className="download-icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2v10m0 0 4-4m-4 4L6 8M3 14v3h14v-3" />
    </svg>
  )
}

function frameCanvas(sourceCanvas, format) {
  if (!format.width || !format.height) return sourceCanvas

  const canvas = document.createElement('canvas')
  canvas.width = format.width
  canvas.height = format.height
  const context = canvas.getContext('2d')
  const padding = format.id === 'story' ? 60 : 50
  const size = getContainedSize(sourceCanvas.width, sourceCanvas.height, canvas.width, canvas.height, padding)
  const left = Math.round((canvas.width - size.width) / 2)
  const top = Math.round((canvas.height - size.height) / 2)

  context.fillStyle = '#f7f4ec'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#243e56'
  context.fillRect(left + 14, top + 14, size.width, size.height)
  context.drawImage(sourceCanvas, left, top, size.width, size.height)
  return canvas
}

export default function ShareButton({ targetId, filename = 'my-shelfie', label = 'Share or save', formatPicker = false }) {
  const [status, setStatus] = useState('idle')
  const [menuOpen, setMenuOpen] = useState(false)
  const actionRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined

    function handlePointerDown(event) {
      if (!actionRef.current?.contains(event.target)) setMenuOpen(false)
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  async function capture(format) {
    const element = document.getElementById(targetId)
    if (!element) throw new Error('Share card not found')
    const fixedLayout = Boolean(format.width && format.height)
    if (fixedLayout) element.classList.add('share-capture--fixed')
    const proxyUrl = import.meta.env?.VITE_IMAGE_PROXY_URL?.replace(/\/$/, '')
    const images = [...element.querySelectorAll('img')]
    const originals = images.map((image) => image.src)

    if (proxyUrl) {
      await Promise.all(images.map(async (image) => {
        if (image.src.includes('books.google')) {
          image.src = `${proxyUrl}?url=${encodeURIComponent(image.src)}`
          await waitForImage(image)
        }
      }))
    }

    try {
      return await html2canvas(element, {
        backgroundColor: '#efe5d2',
        scale: 2,
        useCORS: true,
        allowTaint: false,
      })
    } finally {
      images.forEach((image, index) => { image.src = originals[index] })
      if (fixedLayout) element.classList.remove('share-capture--fixed')
    }
  }

  function download(canvas, outputFilename) {
    const link = document.createElement('a')
    link.download = `${outputFilename}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  async function handleShare(formatId = 'current') {
    const format = SHARE_FORMATS.find(({ id }) => id === formatId) || SHARE_FORMATS[0]
    const outputFilename = getShareFilename(filename, format.id)
    setMenuOpen(false)
    setStatus('working')

    try {
      const canvas = frameCanvas(await capture(format), format)
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('The image was empty')
      const file = new File([blob], `${outputFilename}.png`, { type: 'image/png' })
      const canShareNatively = window.matchMedia('(pointer: coarse)').matches
        && navigator.share
        && navigator.canShare?.({ files: [file] })

      if (canShareNatively) {
        try {
          await navigator.share({ files: [file], title: 'My Shelfie' })
        } catch (error) {
          if (error.name === 'AbortError') {
            setStatus('idle')
            return
          }
          download(canvas, outputFilename)
        }
      } else {
        download(canvas, outputFilename)
      }
      setStatus('done')
      window.setTimeout(() => setStatus('idle'), 1800)
    } catch (error) {
      console.error('Could not create share image', error)
      setStatus('error')
    }
  }

  function handlePrimaryClick() {
    if (formatPicker) {
      setMenuOpen((open) => !open)
    } else {
      handleShare()
    }
  }

  const buttonLabel = status === 'working' ? 'Making image...' : status === 'done' ? 'Image ready' : label

  return (
    <div className="share-action" ref={actionRef}>
      <button
        type="button"
        className="button button--ink"
        onClick={handlePrimaryClick}
        disabled={status === 'working'}
        aria-expanded={formatPicker ? menuOpen : undefined}
        aria-haspopup={formatPicker ? 'menu' : undefined}
      >
        <DownloadIcon /> {buttonLabel}
      </button>
      {menuOpen && (
        <div className="share-format-menu" role="menu" aria-label="Choose an image format">
          {SHARE_FORMATS.map((format) => (
            <button type="button" role="menuitem" key={format.id} onClick={() => handleShare(format.id)}>
              <strong>{format.label}</strong>
              <span>{format.detail}</span>
            </button>
          ))}
        </div>
      )}
      {status === 'error' && <p className="form-error" role="status">Couldn&apos;t make the image. Please try again</p>}
    </div>
  )
}
