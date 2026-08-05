import { STORAGE_KEY } from '../data.js'

export function loadLibrary(storage = window.localStorage) {
  try {
    const saved = storage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function saveLibrary(books, storage = window.localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(books))
}

export function mergeLibraries(current, incoming) {
  const seen = new Set(current.map((book) => `${book.title}|${book.author}`.toLowerCase()))
  return [...current, ...incoming.filter((book) => {
    const key = `${book.title}|${book.author}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })]
}
