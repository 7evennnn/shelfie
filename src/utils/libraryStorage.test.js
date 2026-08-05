import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadLibrary, mergeLibraries, saveLibrary } from './libraryStorage.js'

function memoryStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

describe('accountless library flow', () => {
  it('saves and restores books on the same device', () => {
    const storage = memoryStorage()
    const books = [{ id: '1', title: 'Piranesi', author: 'Susanna Clarke' }]
    saveLibrary(books, storage)
    assert.deepEqual(loadLibrary(storage), books)
  })

  it('merges imports without duplicating title-and-author pairs', () => {
    const current = [{ id: '1', title: 'Piranesi', author: 'Susanna Clarke' }]
    const incoming = [
      { id: '2', title: 'piranesi', author: 'susanna clarke' },
      { id: '3', title: 'The Dispossessed', author: 'Ursula K. Le Guin' },
    ]
    assert.deepEqual(mergeLibraries(current, incoming).map((book) => book.id), ['1', '3'])
  })
})
