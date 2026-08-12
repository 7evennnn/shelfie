import { useState } from 'react'
import BookEditor from './BookEditor'
import BookSearch from './BookSearch'

export default function LibraryManager({ books, onAdd, onUpdate, onRemove, onOpenImport }) {
  const [editingBook, setEditingBook] = useState(null)

  return (
    <section id="panel-library" role="tabpanel" aria-labelledby="tab-library" className="page-section library-page">
      <header className="section-heading">
        <div>
          <p className="eyebrow">Books</p>
          <h1>Your reading log</h1>
          <p>Add books one at a time, or bring them over from a CSV!</p>
        </div>
      </header>

      <div className="library-layout">
        <div className="library-layout__entry">
          <BookSearch onAdd={onAdd} />
          <button type="button" className="button button--quiet button--wide" onClick={onOpenImport}>Import CSV</button>
          <p className="privacy-note">Stored in this browser. Clearing its site data will remove your library.</p>
        </div>

        <div className="library-list-wrap">
          <div className="library-list__heading">
            <h2>Your books</h2>
            <span>{books.length} total</span>
          </div>
          {books.length === 0 ? (
            <div className="empty-shelf">
              <span aria-hidden="true">/////</span>
              <p>No books yet.</p>
            </div>
          ) : (
            <ul className="library-list">
              {books.map((book) => (
                <li key={book.id}>
                  <div className="book-spine" style={{ '--spine-color': book.spineColor }} aria-hidden="true" />
                  <div className="library-list__book">
                    <strong>{book.title}</strong>
                    <span>{book.author} · {book.pages || '—'} pages · {book.genre}</span>
                  </div>
                  {book.pagesUnconfirmed && <span className="status-badge">Check pages</span>}
                  <button type="button" className="text-button" onClick={() => setEditingBook(book)}>Edit</button>
                  <button type="button" className="icon-button icon-button--small" onClick={() => onRemove(book.id)} aria-label={`Remove ${book.title}`}>×</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {editingBook && <BookEditor book={editingBook} onClose={() => setEditingBook(null)} onSave={(changes) => onUpdate(editingBook.id, changes)} />}
    </section>
  )
}
