import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ALL_TIME_FILENAME, getRecapFilename } from './shareFilename.js'

describe('share image filenames', () => {
  it('uses the all-time filename for the reading card', () => {
    assert.equal(`${ALL_TIME_FILENAME}.png`, 'shelfie_alltime.png')
  })

  it('uses the selected year for yearly recaps', () => {
    assert.equal(`${getRecapFilename('year', 2026)}.png`, 'shelfie_wrapped_2026.png')
  })

  it('uses a short month and two-digit year for monthly recaps', () => {
    assert.equal(`${getRecapFilename('month', 2026, 7)}.png`, 'shelfie_wrapped_aug_26.png')
  })
})
