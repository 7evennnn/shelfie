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
    const csv = 'Book Id,Title,Author,Number of Pages,Date Read,Bookshelves,Exclusive Shelf\n1,Piranesi,Susanna Clarke,272,2026-08-01,"fantasy,favourites",read'
    const [book] = importBooksFromCsv(csv)
    assert.equal(book.title, 'Piranesi')
    assert.equal(book.author, 'Susanna Clarke')
    assert.equal(book.pages, 272)
    assert.equal(book.finishedAt, '2026-08-01')
    assert.equal(book.genre, 'Fantasy')
  })

  it('imports only finished Goodreads books and never treats status shelves as genres', () => {
    const csv = [
      'Book Id,Title,Author,Bookshelves,Exclusive Shelf',
      '1,Finished One,A. Reader,take-these,read',
      '2,Finished Two,B. Reader,self-help,read',
      '3,Future Book,C. Reader,to-read,to-read',
      '4,Current Book,D. Reader,currently-reading,currently-reading',
    ].join('\n')

    const books = importBooksFromCsv(csv)
    assert.deepEqual(books.map(({ title, genre }) => ({ title, genre })), [
      { title: 'Finished One', genre: 'Other' },
      { title: 'Finished Two', genre: 'Self-Help' },
    ])
  })

  it('rejects files without importable titles', () => {
    assert.throws(() => importBooksFromCsv('author,pages\nSomeone,100'), /No books/)
  })

  it('does not invent a finish date when an import has none', () => {
    const [book] = importBooksFromCsv('title,author\nBeloved,Toni Morrison')
    assert.equal(book.finishedAt, '')
  })

  it('keeps Goodreads slash-formatted dates on the same calendar day', () => {
    const [book] = importBooksFromCsv('title,author,date read\nBeloved,Toni Morrison,2017/11/12')
    assert.equal(book.finishedAt, '2017-11-12')
  })
})
