const MONTH_CODES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

export const ALL_TIME_FILENAME = 'shelfie_alltime'

export function getRecapFilename(period, year, month = 0) {
  if (period === 'year') return `shelfie_wrapped_${year}`

  const monthCode = MONTH_CODES[month]
  if (!monthCode) throw new RangeError('Month must be between 0 and 11')

  return `shelfie_wrapped_${monthCode}_${String(year).slice(-2).padStart(2, '0')}`
}
