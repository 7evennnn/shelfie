import { useState } from 'react'
import html2canvas from 'html2canvas'

async function waitForImage(image) {
  if (image.complete) return
  await new Promise((resolve) => {
    image.addEventListener('load', resolve, { once: true })
    image.addEventListener('error', resolve, { once: true })
  })
}

export default function ShareButton({ targetId, filename = 'my-shelfie', label = 'Share or save' }) {
  const [status, setStatus] = useState('idle')

  async function capture() {
    const element = document.getElementById(targetId)
    if (!element) throw new Error('Share card not found')
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
    }
  }

  function download(canvas) {
    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  async function handleShare() {
    setStatus('working')
    try {
      const canvas = await capture()
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('The image was empty')
      const file = new File([blob], `${filename}.png`, { type: 'image/png' })
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
          download(canvas)
        }
      } else {
        download(canvas)
      }
      setStatus('done')
      window.setTimeout(() => setStatus('idle'), 1800)
    } catch (error) {
      console.error('Could not create share image', error)
      setStatus('error')
    }
  }

  const buttonLabel = status === 'working' ? 'Making image…' : status === 'done' ? 'Image ready' : label

  return (
    <div className="share-action">
      <button type="button" className="button button--ink" onClick={handleShare} disabled={status === 'working'}>
        <span aria-hidden="true">↗</span> {buttonLabel}
      </button>
      {status === 'error' && <p className="form-error" role="status">Couldn’t make the image. Please try again</p>}
    </div>
  )
}
