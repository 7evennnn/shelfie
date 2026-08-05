import { useEffect, useRef } from 'react'

export default function Modal({ title, description, onClose, children }) {
  const dialogRef = useRef(null)
  const previousFocus = useRef(null)

  useEffect(() => {
    previousFocus.current = document.activeElement
    const dialog = dialogRef.current
    const focusable = dialog?.querySelector('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])')
    focusable?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !dialog) return
      const elements = [...dialog.querySelectorAll('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.disabled)
      if (!elements.length) return
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('modal-open')
      previousFocus.current?.focus?.()
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        ref={dialogRef}
      >
        <div className="modal__header">
          <div>
            <p className="eyebrow">Shelfie studio</p>
            <h2 id="modal-title">{title}</h2>
            {description && <p id="modal-description" className="modal__description">{description}</p>}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog">×</button>
        </div>
        {children}
      </section>
    </div>
  )
}
