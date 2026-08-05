import { useMemo, useState } from 'react'
import ShareButton from './ShareButton'
import { filterBooksForPeriod, formatCompactNumber, getReadingStats } from '../utils/reading'

const MONTHS = new Intl.DateTimeFormat('en', { month: 'long' }).format

function periodLabel(period, year, month) {
  if (period === 'year') return String(year)
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date(year, month, 1))
}

export default function ReportView({ books, readerName, onOpenLibrary }) {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const [period, setPeriod] = useState('year')
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const years = useMemo(() => {
    const fromBooks = books.map((book) => Number(book.finishedAt?.slice(0, 4))).filter(Boolean)
    return [...new Set([currentYear, ...fromBooks])].sort((a, b) => b - a)
  }, [books, currentYear])
  const referenceDate = new Date(year, month, 15)
  const reportBooks = filterBooksForPeriod(books, period, referenceDate)
  const stats = getReadingStats(reportBooks)
  const label = periodLabel(period, year, month)
  const countries = Object.entries(reportBooks.reduce((counts, book) => {
    if (book.authorCountry) counts[book.authorCountry] = (counts[book.authorCountry] || 0) + 1
    return counts
  }, {})).sort((a, b) => b[1] - a[1])

  return (
    <section id="panel-report" role="tabpanel" aria-labelledby="tab-report" className="page-section report-page">
      <header className="section-heading section-heading--split">
        <div>
          <p className="eyebrow">Recaps</p>
          <h1>Pick a month<br />or a year</h1>
          <p>Choose a period, then save the recap as an image</p>
        </div>
        <div className="report-controls" aria-label="Report period">
          <div className="segmented-control">
            <button type="button" aria-pressed={period === 'month'} onClick={() => setPeriod('month')}>Month</button>
            <button type="button" aria-pressed={period === 'year'} onClick={() => setPeriod('year')}>Year</button>
          </div>
          <label>Year<select value={year} onChange={(event) => setYear(Number(event.target.value))}>{years.map((option) => <option key={option}>{option}</option>)}</select></label>
          {period === 'month' && <label>Month<select value={month} onChange={(event) => setMonth(Number(event.target.value))}>{Array.from({ length: 12 }, (_, index) => <option value={index} key={index}>{MONTHS(new Date(2020, index, 1))}</option>)}</select></label>}
        </div>
      </header>

      {reportBooks.length === 0 ? (
        <div className="report-empty">
          <span aria-hidden="true">00</span>
          <h2>Nothing to show for {label}.</h2>
          <p>Add a finish date to at least one book.</p>
          <button type="button" className="button button--ink" onClick={onOpenLibrary}>Go to books</button>
        </div>
      ) : (
        <>
          <article className="reading-report" id="reading-report" aria-label={`${label} reading report for ${readerName}`}>
            <section className="report-cover">
              <header><span className="wordmark">SHELFIE</span><span>{period === 'month' ? 'Monthly' : 'Yearly'} recap</span></header>
              <div className="report-cover__number"><span>Books finished</span><strong>{stats.bookCount.toString().padStart(2, '0')}</strong></div>
              <div className="report-cover__title">
                <h2>{label}<br />in books</h2>
              </div>
              <div className="report-cover__spines" aria-hidden="true">
                {reportBooks.slice(0, 12).map((book) => <i key={book.id} style={{ '--spine-color': book.spineColor }} />)}
              </div>
            </section>

            <section className="report-chapter report-chapter--statement">
              <p className="report-kicker">01 / At a glance</p>
              <blockquote>{stats.bookCount} book{stats.bookCount === 1 ? '' : 's'} / {stats.topGenre} showed up most</blockquote>
              <div className="report-big-stats">
                <div><strong>{stats.bookCount}</strong><span>books finished</span></div>
                <div><strong>{stats.totalPages.toLocaleString()}</strong><span>pages read</span></div>
                <div><strong>{stats.readingHours}</strong><span>estimated hours</span></div>
              </div>
            </section>

            <section className="report-chapter report-chapter--covers">
              <p className="report-kicker">02 / Books</p>
              <h3>What you finished</h3>
              <div className="report-covers">
                {reportBooks.map((book, index) => book.cover ? (
                  <figure key={book.id}><img src={book.cover} alt={`Cover of ${book.title}`} /><figcaption>{String(index + 1).padStart(2, '0')} · {book.title}</figcaption></figure>
                ) : (
                  <figure key={book.id} className="report-covers__placeholder" style={{ '--spine-color': book.spineColor }}><div>{book.title}</div><figcaption>{String(index + 1).padStart(2, '0')} · {book.author}</figcaption></figure>
                ))}
              </div>
            </section>

            <section className="report-chapter report-chapter--taste">
              <p className="report-kicker">03 / Genres</p>
              <div className="report-taste-layout">
                <div><span>Most read</span><strong>{stats.topGenre}</strong><p>{stats.genres.length} genres across {stats.bookCount} books.</p></div>
                <ol>{stats.genres.slice(0, 6).map(([genre, count]) => <li key={genre}><span>{genre}</span><strong>{count}</strong></li>)}</ol>
              </div>
            </section>

            <section className="report-chapter report-chapter--detail">
              <p className="report-kicker">04 / Details</p>
              <div className="report-details">
                <div><span>Longest book</span><strong>{stats.longestBook?.title}</strong><small>{stats.longestBook?.pages} pages</small></div>
                <div><span>Most read author</span><strong>{stats.favouriteAuthor}</strong><small>By book count</small></div>
                <div><span>Average length</span><strong>{stats.averagePages}</strong><small>pages per book</small></div>
                <div><span>Words encountered</span><strong>{formatCompactNumber(stats.totalWords)}</strong><small>rough estimate</small></div>
              </div>
              {countries.length > 0 && <div className="report-origins"><span>Author countries</span>{countries.map(([country, count]) => <i key={country}>{country} · {count}</i>)}</div>}
            </section>

            <footer className="report-footer">
              <div><span className="wordmark">shelfie</span></div>
              <strong>shelfie.pages.dev</strong>
            </footer>
          </article>
          <div className="report-share"><ShareButton targetId="reading-report" filename={`shelfie-${period}-${year}${period === 'month' ? `-${month + 1}` : ''}`} label="Save recap" /></div>
        </>
      )}
    </section>
  )
}
