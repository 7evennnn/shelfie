import { useCallback, useEffect, useState } from 'react'
import IdentityView from './components/IdentityView'
import ImportDialog from './components/ImportDialog'
import LibraryManager from './components/LibraryManager'
import PrivacyView from './components/PrivacyView'
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

function getInitialTab() {
  return window.location.hash === '#privacy' ? 'privacy' : 'identity'
}

export default function App() {
  const { books, setBooks } = usePersistentLibrary()
  const [activeTab, setActiveTab] = useState(getInitialTab)
  const [readerName, setReaderName] = useState(getInitialName)
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(PROFILE_KEY, readerName)
    } catch {
      // The library hook exposes storage errors for the primary data.
    }
  }, [readerName])

  useEffect(() => {
    function handleHashChange() {
      if (window.location.hash === '#privacy') {
        setActiveTab('privacy')
      } else {
        setActiveTab((current) => current === 'privacy' ? 'identity' : current)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [activeTab])

  const closeImport = useCallback(() => setShowImport(false), [])

  function openTab(tab) {
    if (window.location.hash === '#privacy') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    }
    setActiveTab(tab)
  }

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
        <button type="button" className="brand" onClick={() => openTab('identity')} aria-label="Shelfie home">
          <span className="brand__mark" aria-hidden="true">S/</span>
          <span><strong>shelfie</strong><small>your online bookshelf :)</small></span>
        </button>
        <TabNav activeTab={activeTab} onChange={openTab} />
        <button type="button" className="button button--small button--accent" onClick={() => openTab('library')}>Add a book</button>
      </header>

      <main id="main-content">
        {activeTab === 'identity' && (
          <IdentityView
            books={books}
            readerName={readerName}
            onReaderNameChange={setReaderName}
            onOpenLibrary={() => openTab('library')}
          />
        )}
        {activeTab === 'library' && (
          <LibraryManager
            books={books}
            onAdd={addBook}
            onUpdate={updateBook}
            onRemove={removeBook}
            onOpenImport={() => setShowImport(true)}
          />
        )}
        {activeTab === 'report' && (
          <ReportView books={books} readerName={readerName} onOpenLibrary={() => openTab('library')} />
        )}
        {activeTab === 'privacy' && <PrivacyView onBack={() => openTab('identity')} />}
      </main>

      <footer className="site-footer">
        <span className="wordmark">shelfie</span>
        <nav aria-label="Footer">
          <button type="button" onClick={() => openTab('library')}>Books</button>
          <button type="button" onClick={() => openTab('report')}>Recaps</button>
          <a href="#privacy" onClick={() => setActiveTab('privacy')}>Privacy &amp; terms</a>
        </nav>
      </footer>

      {showImport && <ImportDialog onClose={closeImport} onImport={importBooks} />}
    </div>
  )
}
