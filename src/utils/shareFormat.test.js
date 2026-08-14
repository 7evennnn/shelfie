import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { getContainedSize, getShareFilename, SHARE_FORMATS } from './shareFormat.js'

describe('share image formats', () => {
  it('defines exact Story and Instagram post dimensions', () => {
    assert.deepEqual(
      SHARE_FORMATS.map(({ id, width, height }) => ({ id, width, height })),
      [
        { id: 'current', width: null, height: null },
        { id: 'story', width: 1080, height: 1920 },
        { id: 'post', width: 1080, height: 1350 },
      ],
    )
  })

  it('keeps the established filename for current and adds safe format suffixes', () => {
    assert.equal(getShareFilename('shelfie_alltime', 'current'), 'shelfie_alltime')
    assert.equal(getShareFilename('shelfie_alltime', 'story'), 'shelfie_alltime_story')
    assert.equal(getShareFilename('shelfie_alltime', 'post'), 'shelfie_alltime_post')
  })

  it('fits a card inside the target without cropping or stretching it', () => {
    const size = getContainedSize(1700, 1853, 1080, 1920, 60)
    assert.deepEqual(size, { width: 960, height: 1046 })
  })
})
