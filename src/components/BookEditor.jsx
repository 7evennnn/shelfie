import { useState } from 'react'
import { GENRES } from '../data'
import Modal from './Modal'

export default function BookEditor({ book, onClose, onSave }) {
  const [draft, setDraft] = useState(book)

  function handleSubmit(event) {
    event.preventDefault()
    onSave({ ...draft, pages: Math.max(0, Number.parseInt(draft.pages, 10) || 0), pagesUnconfirmed: false })
    onClose()
  }

  return (
    <Modal title="Edit book" description="Page count and finish date are used in your recaps" onClose={onClose}>
      <form className="manual-form" onSubmit={handleSubmit}>
        <div className="field-grid">
          <label>Title <input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
          <label>Author <input value={draft.author} onChange={(event) => setDraft({ ...draft, author: event.target.value })} /></label>
          <label>Pages <input type="number" min="0" value={draft.pages} onChange={(event) => setDraft({ ...draft, pages: event.target.value })} /></label>
          <label>Genre <select value={draft.genre} onChange={(event) => setDraft({ ...draft, genre: event.target.value })}>{GENRES.map((genre) => <option key={genre}>{genre}</option>)}</select></label>
          <label>Finished on <input type="date" value={draft.finishedAt || ''} onChange={(event) => setDraft({ ...draft, finishedAt: event.target.value })} /></label>
          <label>Author’s country <input value={draft.authorCountry || ''} onChange={(event) => setDraft({ ...draft, authorCountry: event.target.value })} /></label>
        </div>
        <div className="modal__actions">
          <button type="button" className="button button--quiet" onClick={onClose}>Cancel</button>
          <button type="submit" className="button button--ink">Save changes</button>
        </div>
      </form>
    </Modal>
  )
}
