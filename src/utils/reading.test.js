import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { filterBooksForPeriod, getReaderArchetype, getReadingStats } from './reading.js'

const books = [
  { title: 'Short', author: 'A. Reader', pages: 300, genre: 'Fiction', finishedAt: '2026-08-04' },
  { title: 'Long', author: 'B. Reader', pages: 500, genre: 'History', finishedAt: '2026-07-10' },
]

describe('reading statistics', () => {
  it('calculates totals and finds meaningful highlights', () => {
    const stats = getReadingStats(books)
    assert.equal(stats.bookCount, 2)
    assert.equal(stats.totalPages, 800)
    assert.equal(stats.readingHours, 15)
    assert.equal(stats.averagePages, 400)
    assert.equal(stats.longestBook.title, 'Long')
    assert.deepEqual(stats.genres, [['Fiction', 1], ['History', 1]])
  })

  it('creates deterministic reader archetypes', () => {
    assert.equal(getReaderArchetype(getReadingStats([
      { pages: 500, genre: 'Fiction', author: 'A' },
      { pages: 450, genre: 'History', author: 'B' },
    ])).name, 'The deep diver')
  })

  it('filters monthly and yearly report editions by finish date', () => {
    const august = new Date(2026, 7, 15)
    assert.deepEqual(filterBooksForPeriod(books, 'month', august).map((book) => book.title), ['Short'])
    assert.equal(filterBooksForPeriod(books, 'year', august).length, 2)
  })
})
