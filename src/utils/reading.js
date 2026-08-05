const WORDS_PER_PAGE = 275
const WORDS_PER_MINUTE = 250

export function getReadingStats(books) {
  const totalPages = books.reduce((sum, book) => sum + (Number(book.pages) || 0), 0)
  const totalWords = totalPages * WORDS_PER_PAGE
  const readingHours = Math.round(totalWords / WORDS_PER_MINUTE / 60)
  const averagePages = books.length ? Math.round(totalPages / books.length) : 0
  const longestBook = books.reduce(
    (longest, book) => Number(book.pages) > Number(longest?.pages || 0) ? book : longest,
    null,
  )

  const genreCounts = books.reduce((counts, book) => {
    const genre = book.genre || 'Other'
    counts[genre] = (counts[genre] || 0) + 1
    return counts
  }, {})

  const genres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])
  const topGenre = genres[0]?.[0] || 'Still unfolding'
  const genreDiversity = books.length ? Math.round((genres.length / books.length) * 100) : 0

  const authorCounts = books.reduce((counts, book) => {
    const author = book.author || 'Unknown author'
    counts[author] = (counts[author] || 0) + 1
    return counts
  }, {})
  const favouriteAuthor = Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Still unfolding'

  return {
    bookCount: books.length,
    totalPages,
    totalWords,
    readingHours,
    averagePages,
    longestBook,
    genreCounts,
    genres,
    topGenre,
    genreDiversity,
    favouriteAuthor,
  }
}

export function getReaderArchetype(stats) {
  if (!stats.bookCount) {
    return { name: 'The open book', description: 'Add a few finished reads and your reading identity will take shape here.' }
  }
  if (stats.averagePages >= 420) {
    return { name: 'The deep diver', description: 'You are happiest disappearing into ambitious, many-page worlds.' }
  }
  if (stats.genres.length >= 5 && stats.genreDiversity >= 50) {
    return { name: 'The genre hopper', description: 'Curiosity keeps pulling you across categories and conventions.' }
  }
  if (stats.genres[0]?.[1] / stats.bookCount >= 0.6) {
    return { name: `The ${stats.topGenre.toLowerCase()} devotee`, description: `You have found your shelf and keep returning to ${stats.topGenre.toLowerCase()}.` }
  }
  return { name: 'The curious generalist', description: 'You follow a strong mood, but rarely stay on one shelf for long.' }
}

export function filterBooksForPeriod(books, period, referenceDate = new Date()) {
  const targetYear = referenceDate.getFullYear()
  const targetMonth = referenceDate.getMonth()

  return books.filter((book) => {
    if (!book.finishedAt) return false
    const date = new Date(`${book.finishedAt}T00:00:00`)
    if (Number.isNaN(date.getTime())) return false
    if (period === 'month') {
      return date.getFullYear() === targetYear && date.getMonth() === targetMonth
    }
    return date.getFullYear() === targetYear
  })
}

export function formatCompactNumber(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`
  return String(value)
}
