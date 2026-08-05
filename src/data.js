export const GENRES = [
  'Fiction',
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Thriller',
  'Romance',
  'Biography',
  'History',
  'Poetry',
  'Horror',
  'Self-Help',
  'Nonfiction',
  'Other',
]

export const SPINE_COLORS = [
  '#d65f3d', '#243e56', '#d8a52e', '#6b7d5c', '#8e4f61', '#4b6f75',
]

export const STORAGE_KEY = 'shelfie.library.v2'

export function createBook(values = {}) {
  return {
    id: values.id || globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    title: values.title?.trim() || 'Untitled',
    author: values.author?.trim() || 'Unknown author',
    pages: Math.max(0, Number.parseInt(values.pages, 10) || 0),
    genre: values.genre?.trim() || 'Other',
    cover: values.cover || null,
    authorCountry: values.authorCountry?.trim() || '',
    finishedAt: values.finishedAt === undefined ? new Date().toISOString().slice(0, 10) : values.finishedAt,
    pagesUnconfirmed: Boolean(values.pagesUnconfirmed),
    spineColor: values.spineColor || SPINE_COLORS[Math.floor(Math.random() * SPINE_COLORS.length)],
  }
}
