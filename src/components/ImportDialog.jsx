import { useState } from 'react'
import Modal from './Modal'
import { importBooksFromCsv } from '../utils/csv'

export default function ImportDialog({ onClose, onImport }) {
  const [state, setState] = useState({ status: 'idle', message: '' })

  async function handleFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const books = importBooksFromCsv(await file.text())
      const addedCount = onImport(books)
      setState({
        status: 'success',
        message: addedCount
          ? `${addedCount} book${addedCount === 1 ? '' : 's'} imported.`
          : 'Those books are already in your library.',
      })
    } catch (error) {
      setState({ status: 'error', message: error.message })
    }
  }

  return (
    <Modal
      title="Import books"
      description="Use a Goodreads export or a simple CSV file."
      onClose={onClose}
    >
      <div className="import-guide">
        <div><span>01</span><p>Your file needs <strong>title</strong> and <strong>author</strong> columns.</p></div>
        <div><span>02</span><p>Pages, genre, finish date, author country and cover URL are optional.</p></div>
        <div><span>03</span><p>Duplicate title-and-author pairs are skipped.</p></div>
      </div>
      <label className="file-drop">
        <span>Choose a CSV file</span>
        <small>.csv files only</small>
        <input type="file" accept=".csv,text/csv" onChange={handleFile} />
      </label>
      {state.message && <p className={state.status === 'error' ? 'form-error' : 'form-success'} role="status">{state.message}</p>}
      <div className="modal__actions">
        <button type="button" className="button button--ink" onClick={onClose}>Done</button>
      </div>
    </Modal>
  )
}
