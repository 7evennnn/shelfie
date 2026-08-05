import { useState } from 'react'
import { createBook, GENRES } from '../data'

const EMPTY_BOOK = { title: '', author: '', pages: '', genre: 'Fiction', finishedAt: new Date().toISOString().slice(0, 10), authorCountry: '' }

function normaliseGenre(categories) {
  const category = categories?.[0]?.split('/')[0]?.trim()
  if (!category) return 'Other'
  return GENRES.find((genre) => category.toLowerCase().includes(genre.toLowerCase())) || category
}

export default function BookSearch({ onAdd }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searchState, setSearchState] = useState('idle')
  const [manualOpen, setManualOpen] = useState(false)
  const [manualBook, setManualBook] = useState(EMPTY_BOOK)

  async function handleSearch(event) {
    event.preventDefault()
    if (!query.trim()) return
    setSearchState('loading')
    try {
      const params = new URLSearchParams({ q: query.trim(), maxResults: '6' })
      const apiKey = import.meta.env?.VITE_GOOGLE_BOOKS_API_KEY
      if (apiKey) params.set('key', apiKey)
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?${params}`)
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      setResults(data.items || [])
      setSearchState(data.items?.length ? 'success' : 'empty')
    } catch {
      setSearchState('error')
      setResults([])
    }
  }

  function addResult(item) {
    const info = item.volumeInfo
    onAdd(createBook({
      title: info.title,
      author: info.authors?.[0],
      pages: info.pageCount,
      pagesUnconfirmed: !info.pageCount,
      genre: normaliseGenre(info.categories),
      cover: info.imageLinks?.thumbnail?.replace('http://', 'https://'),
    }))
    setResults([])
    setQuery('')
  }

  function handleManualSubmit(event) {
    event.preventDefault()
    if (!manualBook.title.trim()) return
    onAdd(createBook(manualBook))
    setManualBook(EMPTY_BOOK)
    setManualOpen(false)
  }

  return (
    <div className="book-entry">
      <form className="search-form" onSubmit={handleSearch} role="search">
        <label htmlFor="book-search">Find a book</label>
        <div className="search-form__row">
          <input
            id="book-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try a title, author or ISBN"
          />
          <button type="submit" className="button button--accent" disabled={searchState === 'loading'}>
            {searchState === 'loading' ? 'Searching…' : 'Search'}
          </button>
        </div>
      </form>

      {searchState === 'empty' && <p className="form-note" role="status">No matches. Try a different search or enter it yourself.</p>}
      {searchState === 'error' && <p className="form-error" role="alert">Search is unavailable. You can still enter the book yourself.</p>}

      {results.length > 0 && (
        <ul className="search-results" aria-label="Book search results">
          {results.map((item) => {
            const info = item.volumeInfo
            return (
              <li key={item.id}>
                <button type="button" className="search-result" onClick={() => addResult(item)}>
                  <span className="search-result__cover" aria-hidden="true">
                    {info.imageLinks?.smallThumbnail ? <img src={info.imageLinks.smallThumbnail.replace('http://', 'https://')} alt="" /> : 'BK'}
                  </span>
                  <span>
                    <strong>{info.title}</strong>
                    <small>{info.authors?.join(', ') || 'Unknown author'} · {info.pageCount ? `${info.pageCount} pages` : 'Page count unknown'}</small>
                  </span>
                  <span className="search-result__add" aria-hidden="true">＋</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <button type="button" className="text-button" onClick={() => setManualOpen((open) => !open)} aria-expanded={manualOpen}>
        {manualOpen ? 'Close form' : 'Enter a book yourself'}
      </button>

      {manualOpen && (
        <form className="manual-form" onSubmit={handleManualSubmit}>
          <div className="field-grid">
            <label>Title <input required value={manualBook.title} onChange={(event) => setManualBook({ ...manualBook, title: event.target.value })} /></label>
            <label>Author <input value={manualBook.author} onChange={(event) => setManualBook({ ...manualBook, author: event.target.value })} /></label>
            <label>Pages <input type="number" min="0" value={manualBook.pages} onChange={(event) => setManualBook({ ...manualBook, pages: event.target.value })} /></label>
            <label>Genre <select value={manualBook.genre} onChange={(event) => setManualBook({ ...manualBook, genre: event.target.value })}>{GENRES.map((genre) => <option key={genre}>{genre}</option>)}</select></label>
            <label>Finished on <input type="date" value={manualBook.finishedAt} onChange={(event) => setManualBook({ ...manualBook, finishedAt: event.target.value })} /></label>
            <label>Author’s country <input value={manualBook.authorCountry} onChange={(event) => setManualBook({ ...manualBook, authorCountry: event.target.value })} placeholder="Optional" /></label>
          </div>
          <button type="submit" className="button button--ink">Add book</button>
        </form>
      )}
    </div>
  )
}
