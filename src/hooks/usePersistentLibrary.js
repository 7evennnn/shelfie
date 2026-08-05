import { useEffect, useState } from 'react'
import { loadLibrary, saveLibrary } from '../utils/libraryStorage'

export function usePersistentLibrary() {
  const [books, setBooks] = useState(loadLibrary)
  const [saveState, setSaveState] = useState('saved')

  useEffect(() => {
    const saveTimer = window.setTimeout(() => {
      try {
        saveLibrary(books)
        setSaveState('saved')
      } catch {
        setSaveState('error')
      }
    }, 0)

    return () => window.clearTimeout(saveTimer)
  }, [books])

  return { books, setBooks, saveState }
}
