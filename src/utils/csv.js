import { createBook } from '../data.js'

export function parseCsv(text) {
  const rows = []
  let row = []
  let value = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    const next = text[index + 1]
    if (character === '"' && quoted && next === '"') {
      value += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(value)
      value = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      row.push(value)
      if (row.some((cell) => cell.trim())) rows.push(row)
      row = []
      value = ''
    } else {
      value += character
    }
  }

  row.push(value)
  if (row.some((cell) => cell.trim())) rows.push(row)
  return rows
}

function normalizeHeader(header) {
  return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function findValue(record, names) {
  for (const name of names) {
    const value = record[normalizeHeader(name)]
    if (value != null && value !== '') return value
  }
  return ''
}

function normalizeDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

export function importBooksFromCsv(text) {
  const rows = parseCsv(text)
  if (rows.length < 2) throw new Error('The CSV needs a header row and at least one book.')

  const headers = rows[0].map(normalizeHeader)
  const books = rows.slice(1).map((row) => {
    const record = Object.fromEntries(headers.map((header, index) => [header, row[index]?.trim() || '']))
    const title = findValue(record, ['title', 'book title'])
    if (!title) return null
    const shelves = findValue(record, ['genre', 'bookshelves', 'exclusive shelf'])
    const genre = shelves.split(',')[0]?.replace(/-/g, ' ').trim() || 'Other'

    return createBook({
      title,
      author: findValue(record, ['author', 'author l-f']) || 'Unknown author',
      pages: findValue(record, ['pages', 'number of pages', 'num pages']),
      genre: genre.replace(/\b\w/g, (letter) => letter.toUpperCase()),
      finishedAt: normalizeDate(findValue(record, ['finished date', 'date read', 'read at'])),
      authorCountry: findValue(record, ['author country', 'country']),
      cover: findValue(record, ['cover', 'cover url', 'image url']) || null,
    })
  }).filter(Boolean)

  if (!books.length) throw new Error('No books with a title were found in this CSV.')
  return books
}
