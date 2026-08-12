import { useCallback, useEffect, useState } from 'react'
import IdentityView from './components/IdentityView'
import ImportDialog from './components/ImportDialog'
import LibraryManager from './components/LibraryManager'
import ReportView from './components/ReportView'
import TabNav from './components/TabNav'
import { usePersistentLibrary } from './hooks/usePersistentLibrary'
import { mergeLibraries } from './utils/libraryStorage'

const PROFILE_KEY = 'shelfie.profile.v1'

function getInitialName() {
  try {
    const savedName = window.localStorage.getItem(PROFILE_KEY)
    return !savedName || savedName === 'A reader in progress' ? 'Reader' : savedName
  } catch {
    return 'Reader'
  }
}

export default function App() {
  const { books, setBooks, saveState } = usePersistentLibrary()
  const [activeTab, setActiveTab] = useState('identity')
  const [readerName, setReaderName] = useState(getInitialName)
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(PROFILE_KEY, readerName)
    } catch {
      // The library hook exposes storage errors for the primary data.
    }
  }, [readerName])

  const closeImport = useCallback(() => setShowImport(false), [])

  function addBook(book) {
    setBooks((current) => [...current, book])
  }

  function updateBook(id, changes) {
    setBooks((current) => current.map((book) => book.id === id ? { ...book, ...changes } : book))
  }

  function removeBook(id) {
    setBooks((current) => current.filter((book) => book.id !== id))
  }

  function importBooks(incoming) {
    const merged = mergeLibraries(books, incoming)
    setBooks(merged)
    return merged.length - books.length
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <button type="button" className="brand" onClick={() => setActiveTab('identity')} aria-label="Shelfie home">
          <span className="brand__mark" aria-hidden="true">S/</span>
          <span><strong>shelfie</strong><small>your online bookshelf :)</small></span>
        </button>
        <TabNav activeTab={activeTab} onChange={setActiveTab} />
        <button type="button" className="button button--small button--accent" onClick={() => setActiveTab('library')}>Add a book</button>
      </header>

      <main id="main-content">
        {activeTab === 'identity' && (
          <IdentityView
            books={books}
            readerName={readerName}
            onReaderNameChange={setReaderName}
            onOpenLibrary={() => setActiveTab('library')}
          />
        )}
        {activeTab === 'library' && (
          <LibraryManager
            books={books}
            onAdd={addBook}
            onUpdate={updateBook}
            onRemove={removeBook}
            onOpenImport={() => setShowImport(true)}
            saveState={saveState}
          />
        )}
        {activeTab === 'report' && (
          <ReportView books={books} readerName={readerName} onOpenLibrary={() => setActiveTab('library')} />
        )}
      </main>

      <footer className="site-footer">
        <div><span className="wordmark">shelfie</span><p>Your library is stored in this browser :)</p></div>
        <nav aria-label="Footer"><button type="button" onClick={() => setActiveTab('library')}>Books</button><button type="button" onClick={() => setActiveTab('report')}>Recaps</button></nav>
      </footer>

      {showImport && <ImportDialog onClose={closeImport} onImport={importBooks} />}
    </div>
  )
}
