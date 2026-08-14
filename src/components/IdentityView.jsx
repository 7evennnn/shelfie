import ShareButton from './ShareButton'
import { getReadingStats } from '../utils/reading'
import { ALL_TIME_FILENAME } from '../utils/shareFilename'

function CoverStack({ books }) {
  const covers = books.filter((book) => book.cover).slice(-7).reverse()
  if (!covers.length) {
    return (
      <div className="cover-stack cover-stack--spines" aria-label="Decorative book spines">
        {books.slice(0, 7).map((book) => <span key={book.id} style={{ '--spine-color': book.spineColor }} />)}
      </div>
    )
  }
  return (
    <div className="cover-stack" aria-label="A selection of book covers from this library">
      {covers.map((book) => <img key={book.id} src={book.cover} alt={`Cover of ${book.title}`} />)}
    </div>
  )
}

export default function IdentityView({ books, readerName, onReaderNameChange, onOpenLibrary }) {
  const stats = getReadingStats(books)
  const topGenres = stats.genres.slice(0, 4)

  return (
    <section id="panel-identity" role="tabpanel" aria-labelledby="tab-identity" className="page-section identity-page">
      <header className="section-heading identity-intro">
        <div>
          <p className="eyebrow">Your card</p>
          <h1>Your Shelfie</h1>
        </div>
      </header>

      <div className="identity-workbench">
        <div className="identity-controls">
          <label htmlFor="reader-name">Name on your card</label>
          <input id="reader-name" value={readerName} onChange={(event) => onReaderNameChange(event.target.value)} maxLength="40" />
          {books.length ? (
            <ShareButton targetId="identity-card" filename={ALL_TIME_FILENAME} label="Share my card" formatPicker />
          ) : (
            <button type="button" className="button button--ink" onClick={onOpenLibrary}>Add a book</button>
          )}
        </div>

        <article className="identity-card" id="identity-card" aria-label={`${readerName}'s Shelfie reading card`}>
          <header className="identity-card__masthead">
            <span className="wordmark">SHELFIE / READING CARD</span>
          </header>

          <div className="identity-card__hero">
            <div>
              <p className="identity-card__label">Reader</p>
              <h2>{readerName || 'Reader'}</h2>
              <p className="identity-card__archetype">{books.length ? `${stats.genres.length} genre${stats.genres.length === 1 ? '' : 's'} logged` : 'No books logged yet'}</p>
              <p>{books.length ? `${stats.totalPages.toLocaleString()} pages recorded` : 'Add a finished book to start the card'}</p>
            </div>
            <div className="identity-card__seal" aria-label={`${stats.bookCount} books on this Shelfie`}>
              <strong>{stats.bookCount}</strong>
              <span>books<br />logged</span>
            </div>
          </div>

          <CoverStack books={books} />

          <div className="identity-card__facts">
            <div><span>Top genre</span><strong>{stats.topGenre}</strong></div>
            <div><span>Most read author</span><strong>{stats.favouriteAuthor}</strong></div>
            <div><span>Pages</span><strong>{stats.totalPages.toLocaleString()}</strong></div>
            <div><span>Est. reading time</span><strong>{stats.readingHours} hours</strong></div>
          </div>

          <div className="taste-index">
            <div className="taste-index__heading"><span>Genres</span><span>{stats.genres.length} recorded</span></div>
            {topGenres.length ? topGenres.map(([genre, count], index) => (
              <div className="taste-row" key={genre}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{genre}</strong>
                <div><i style={{ width: `${Math.max(12, count / stats.bookCount * 100)}%` }} /></div>
                <span>{count}</span>
              </div>
            )) : <p className="identity-card__empty">No genre data yet.</p>}
          </div>

          <footer className="identity-card__footer">
            <span>shelfie</span>
            <strong>shelfie.pages.dev</strong>
          </footer>
        </article>
      </div>
    </section>
  )
}
