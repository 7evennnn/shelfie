import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { importBooksFromCsv, parseCsv } from './csv.js'

describe('CSV import', () => {
  it('handles commas and escaped quotes inside quoted cells', () => {
    assert.deepEqual(parseCsv('title,author\n"The Book, Again","Doe, Jane"\n'), [
      ['title', 'author'],
      ['The Book, Again', 'Doe, Jane'],
    ])
  })

  it('maps Goodreads-style columns into Shelfie books', () => {
    const csv = 'Title,Author,Number of Pages,Date Read,Bookshelves\nPiranesi,Susanna Clarke,272,2026-08-01,"fantasy,favourites"'
    const [book] = importBooksFromCsv(csv)
    assert.equal(book.title, 'Piranesi')
    assert.equal(book.author, 'Susanna Clarke')
    assert.equal(book.pages, 272)
    assert.equal(book.finishedAt, '2026-08-01')
    assert.equal(book.genre, 'Fantasy')
  })

  it('rejects files without importable titles', () => {
    assert.throws(() => importBooksFromCsv('author,pages\nSomeone,100'), /No books/)
  })

  it('does not invent a finish date when an import has none', () => {
    const [book] = importBooksFromCsv('title,author\nBeloved,Toni Morrison')
    assert.equal(book.finishedAt, '')
  })
})
